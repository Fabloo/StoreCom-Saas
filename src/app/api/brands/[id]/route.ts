import { NextRequest, NextResponse } from 'next/server';
import { brandOperations } from '@/lib/database';
import { updateBrandSchema } from '@/lib/validation';
import { googleBusinessAPI } from '@/lib/google-business-api';

// GET /api/brands/[id] - Get a specific brand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id;
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], brandId);
    const brand = await brandOperations.getBrandById(params.id);
    
    if (!brand) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brand not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch brand',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/brands/[id] - Update a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id;
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], brandId);
    const body = await request.json();
    
    // Validate input data
    const validationResult = updateBrandSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const updateData = validationResult.data;
    
    // Check if brand exists
    const existingBrand = await brandOperations.getBrandById(params.id);
    if (!existingBrand) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brand not found' 
        },
        { status: 404 }
      );
    }
    
    // Check if brand slug is unique (if being updated)
    if (updateData.brandSlug && updateData.brandSlug !== existingBrand.brandSlug) {
      const isSlugUnique = await brandOperations.isBrandSlugUnique(updateData.brandSlug, params.id);
      if (!isSlugUnique) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Brand slug already exists',
            field: 'brandSlug'
          },
          { status: 409 }
        );
      }
    }
    
    // Update the brand in database
    await brandOperations.updateBrand(params.id, updateData);
    
    // If Google Business integration is being updated, sync with GMB
    if (updateData.googleBusiness?.isConnected && existingBrand.googleBusiness.locationId) {
      try {
        // Update location in Google My Business
        const gmbLocationData: any = {};
        
        if (updateData.brandName) gmbLocationData.locationName = updateData.brandName;
        if (updateData.primaryCategory) {
          gmbLocationData.primaryCategory = {
            displayName: updateData.primaryCategory,
            categoryId: updateData.primaryCategory.toLowerCase().replace(/\s+/g, '_')
          };
        }
        if (updateData.website) gmbLocationData.websiteUri = updateData.website;
        if (updateData.address) {
          gmbLocationData.latlng = {
            latitude: parseFloat(updateData.address.latitude),
            longitude: parseFloat(updateData.address.longitude)
          };
        }
        if (updateData.description || updateData.phone) {
          gmbLocationData.profile = {
            ...(updateData.description && { description: updateData.description }),
            ...(updateData.phone && { phoneNumbers: { primaryPhone: updateData.phone } }),
            ...(updateData.website && { websiteUri: updateData.website })
          };
        }
        
        if (Object.keys(gmbLocationData).length > 0) {
          await googleBusinessAPI.updateLocation(
            existingBrand.googleBusiness.locationId,
            gmbLocationData
          );
          
          // Update last sync time
          await brandOperations.updateGoogleBusinessConnection(params.id, {
            lastSync: new Date()
          });
        }
      } catch (gmbError) {
        console.error('Error updating Google My Business location:', gmbError);
        // Don't fail the brand update if GMB fails
        // Just log the error and continue
      }
    }
    
    // Get updated brand
    const updatedBrand = await brandOperations.getBrandById(params.id);
    
    return NextResponse.json({
      success: true,
      data: updatedBrand,
      message: 'Brand updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update brand',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[id] - Delete a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id;
    assertRole(request, ['super_admin']);
    // Check if brand exists
    const existingBrand = await brandOperations.getBrandById(params.id);
    if (!existingBrand) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brand not found' 
        },
        { status: 404 }
      );
    }
    
    // If connected to Google My Business, optionally delete the location
    if (existingBrand.googleBusiness.isConnected && existingBrand.googleBusiness.locationId) {
      try {
        // Note: Google My Business API doesn't provide a direct delete method for locations
        // You might want to mark it as closed or handle this differently
        console.log('Brand is connected to Google My Business. Consider handling location deletion separately.');
      } catch (gmbError) {
        console.error('Error handling Google My Business location:', gmbError);
      }
    }
    
    // Delete the brand from database
    await brandOperations.deleteBrand(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete brand',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 