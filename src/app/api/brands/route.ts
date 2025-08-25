import { NextRequest, NextResponse } from 'next/server';
import { brandOperations } from '@/lib/database';
import { createBrandSchema } from '@/lib/validation';
import { googleBusinessAPI } from '@/lib/google-business-api';
import { assertRole } from '@/lib/auth';

// GET /api/brands - Get all brands
export async function GET(request: NextRequest) {
  try {
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin']);
    const brands = await brandOperations.getAllBrands();
    
    return NextResponse.json({
      success: true,
      data: brands,
      count: brands.length
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch brands',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    // Temporarily disabled authentication for development
    // const auth = assertRole(request, ['super_admin', 'brand_admin']);
    const body = await request.json();
    
    // Debug: Log the incoming data
    console.log('Brand creation request body:', JSON.stringify(body, null, 2));
    
    // Validate input data
    const validationResult = createBrandSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const brandData = validationResult.data;
    
    // Check if brand slug is unique
    const isSlugUnique = await brandOperations.isBrandSlugUnique(brandData.brandSlug);
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
    
    // Create the brand in database
    // The createBrand function will automatically add status: 'draft', createdAt, and updatedAt
    const newBrand = await brandOperations.createBrand(brandData as any);
    
    // If Google Business integration is enabled, create location in GMB
    if (brandData.googleBusiness.isConnected) {
      try {
        // Get the first available account
        const accounts = await googleBusinessAPI.getAccounts();
        
        if (accounts.length > 0) {
          const accountName = accounts[0].name;
          
          // Create location data for Google My Business
          const gmbLocationData = {
            locationName: brandData.brandName,
            primaryCategory: {
              displayName: brandData.primaryCategory,
              categoryId: brandData.primaryCategory.toLowerCase().replace(/\s+/g, '_')
            },
            categories: [
              {
                displayName: brandData.primaryCategory,
                categoryId: brandData.primaryCategory.toLowerCase().replace(/\s+/g, '_')
              },
              ...brandData.additionalCategories.map(cat => ({
                displayName: cat,
                categoryId: cat.toLowerCase().replace(/\s+/g, '_')
              }))
            ],
            websiteUri: brandData.website,
            latlng: {
              latitude: parseFloat(brandData.address.latitude),
              longitude: parseFloat(brandData.address.longitude)
            },
            profile: {
              description: brandData.description,
              phoneNumbers: {
                primaryPhone: brandData.phone
              },
              websiteUri: brandData.website
            }
          };
          
          // Create location in Google My Business
          const gmbLocation = await googleBusinessAPI.updateLocation(
            `${accountName}/locations/${brandData.brandSlug}`,
            gmbLocationData
          );
          
          // Update brand with GMB location ID
          await brandOperations.updateGoogleBusinessConnection(newBrand._id!.toString(), {
            accountId: accountName,
            locationId: gmbLocation.name,
            isConnected: true,
            lastSync: new Date()
          });
          
          // Update the response with GMB data
          newBrand.googleBusiness = {
            accountId: accountName,
            locationId: gmbLocation.name,
            isConnected: true,
            lastSync: new Date()
          };
        }
      } catch (gmbError) {
        console.error('Error creating Google My Business location:', gmbError);
        // Don't fail the brand creation if GMB fails
        // Just log the error and continue
      }
    }
    
    return NextResponse.json({
      success: true,
      data: newBrand,
      message: 'Brand created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create brand',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 