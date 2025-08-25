import { NextRequest, NextResponse } from 'next/server';
import { brandOperations } from '@/lib/database';
import { googleBusinessAPI } from '@/lib/google-business-api';

// POST /api/brands/[id]/sync-gmb - Sync brand with Google My Business
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brandId = params.id;
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], brandId);
    // Get the brand
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

    if (!brand.googleBusiness.isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brand is not connected to Google My Business' 
        },
        { status: 400 }
      );
    }

    // Sync with Google My Business
    try {
      // Get the location from Google My Business
      const gmbLocation = await googleBusinessAPI.getLocation(brand.googleBusiness.locationId!);
      
      // Update brand with latest GMB data
      const updates: any = {};
      
      if (gmbLocation.locationName && gmbLocation.locationName !== brand.brandName) {
        updates.brandName = gmbLocation.locationName;
      }
      
      if (gmbLocation.primaryCategory && gmbLocation.primaryCategory.displayName !== brand.primaryCategory) {
        updates.primaryCategory = gmbLocation.primaryCategory.displayName;
      }
      
      if (gmbLocation.websiteUri && gmbLocation.websiteUri !== brand.website) {
        updates.website = gmbLocation.websiteUri;
      }
      
      if (gmbLocation.latlng) {
        updates.address = {
          ...brand.address,
          latitude: gmbLocation.latlng.latitude.toString(),
          longitude: gmbLocation.latlng.longitude.toString(),
        };
      }
      
      if (gmbLocation.profile) {
        if (gmbLocation.profile.description && gmbLocation.profile.description !== brand.description) {
          updates.description = gmbLocation.profile.description;
        }
        
        if (gmbLocation.profile.phoneNumbers?.primaryPhone && gmbLocation.profile.phoneNumbers.primaryPhone !== brand.phone) {
          updates.phone = gmbLocation.profile.phoneNumbers.primaryPhone;
        }
      }
      
      // Update the brand if there are changes
      if (Object.keys(updates).length > 0) {
        await brandOperations.updateBrand(params.id, updates);
      }
      
      // Update last sync time
      await brandOperations.updateGoogleBusinessConnection(params.id, {
        lastSync: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Brand synced with Google My Business successfully',
        syncedFields: Object.keys(updates)
      });
      
    } catch (gmbError) {
      console.error('Error syncing with Google My Business:', gmbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to sync with Google My Business',
          details: gmbError instanceof Error ? gmbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error syncing brand:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync brand',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 