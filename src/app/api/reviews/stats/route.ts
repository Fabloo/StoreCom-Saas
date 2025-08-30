import { NextRequest, NextResponse } from 'next/server';
import { reviewOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const stats = await reviewOperations.getReviewStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' }, 
      { status: 500 }
    );
  }
} 