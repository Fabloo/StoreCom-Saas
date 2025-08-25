import { NextRequest, NextResponse } from 'next/server';
import { storeOperations } from '@/lib/database';
import { updateStoreSchema } from '@/lib/validation';

// GET /api/stores/[id] - Get a specific store
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id;
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }
    
    const store = await storeOperations.getStoreById(storeId);
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }
    
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], store.brandId);
    return NextResponse.json({
      success: true,
      data: store
    });
    
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[id] - Update a store
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id;
    const body = await request.json();
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }
    
    // Check if store exists
    const existingStore = await storeOperations.getStoreById(storeId);
    if (!existingStore) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }
    
    // Validate input data
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], existingStore.brandId);
    const validationResult = updateStoreSchema.safeParse(body);
    
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
    
    // Check uniqueness for store code if it's being updated
    if (updateData.storeCode && updateData.storeCode !== existingStore.storeCode) {
      const isCodeUnique = await storeOperations.isStoreCodeUnique(updateData.storeCode, storeId);
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
    }
    
    // Check uniqueness for store slug if it's being updated
    if (updateData.storeSlug && updateData.storeSlug !== existingStore.storeSlug) {
      const isSlugUnique = await storeOperations.isStoreSlugUnique(updateData.storeSlug, storeId);
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
    }
    
    // Update the store
    await storeOperations.updateStore(storeId, updateData);
    
    // Get the updated store
    const updatedStore = await storeOperations.getStoreById(storeId);
    
    return NextResponse.json({
      success: true,
      data: updatedStore,
      message: 'Store updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[id] - Delete a store
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id;
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }
    
    // Check if store exists
    const existingStore = await storeOperations.getStoreById(storeId);
    if (!existingStore) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }
    
    // Temporarily disabled authentication for development
    // assertRole(request, ['super_admin', 'brand_admin'], existingStore.brandId);
    // Delete the store
    await storeOperations.deleteStore(storeId);
    
    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 