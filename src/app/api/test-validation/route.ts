import { NextRequest, NextResponse } from 'next/server';
import { createBrandSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Test validation request body:', JSON.stringify(body, null, 2));
    
    // Test validation
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
    
    return NextResponse.json({
      success: true,
      message: 'Validation passed',
      data: validationResult.data
    });
    
  } catch (error) {
    console.error('Test validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


