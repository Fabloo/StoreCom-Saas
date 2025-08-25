import { NextRequest, NextResponse } from 'next/server';
import { storeOperations, brandOperations } from '@/lib/database';
import { createStoreSchema } from '@/lib/validation';

// GET /api/stores - Get all stores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    // Temporarily disabled authentication for development
    // if (brandId) {
    //   // super_admin or brand_admin with access to that brand
    //   assertRole(request, ['super_admin', 'brand_admin'], brandId);
    // } else {
    //   // super_admin only when listing all
    //   assertRole(request, ['super_admin']);
    // }
    
    let stores;
    
    if (brandId) {
      // Get stores for a specific brand
      stores = await storeOperations.getStoresByBrand(brandId);
    } else {
      // Get all stores
      stores = await storeOperations.getAllStores();
    }
    
    return NextResponse.json({
      success: true,
      data: stores,
      count: stores.length
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/stores - Create a new store
export async function POST(request: NextRequest) {
  try {
    const bodyRaw = await request.text();
    const body = bodyRaw ? JSON.parse(bodyRaw) : {};
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], body.brandId);
    
    // Validate input data
    const validationResult = createStoreSchema.safeParse(body);
    
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
    
    const storeData = validationResult.data;
    // Ensure brand exists
    const brand = await brandOperations.getBrandById(storeData.brandId);
    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }
    
    // Check if store code is unique
    const isCodeUnique = await storeOperations.isStoreCodeUnique(storeData.storeCode);
    if (!isCodeUnique) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Store code already exists',
          field: 'storeCode'
        },
        { status: 409 }
      );
    }
    
    // Check if store slug is unique
    const isSlugUnique = await storeOperations.isStoreSlugUnique(storeData.storeSlug);
    if (!isSlugUnique) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Store slug already exists',
          field: 'storeSlug'
        },
        { status: 409 }
      );
    }
    
    // Create the store
    const newStore = await storeOperations.createStore(storeData);
    
    return NextResponse.json({
      success: true,
      data: newStore,
      message: 'Store created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 