import { NextRequest, NextResponse } from 'next/server';
import { storeOperations } from '@/lib/database';

// POST /api/stores/validate - Validate store code and slug uniqueness
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeCode, storeSlug, excludeId } = body;
    
    const results: { [key: string]: boolean } = {};
    
    // Validate store code if provided
    if (storeCode) {
      results.storeCode = await storeOperations.isStoreCodeUnique(storeCode, excludeId);
    }
    
    // Validate store slug if provided
    if (storeSlug) {
      results.storeSlug = await storeOperations.isStoreSlugUnique(storeSlug, excludeId);
    }
    
    return NextResponse.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('Error validating store data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate store data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 