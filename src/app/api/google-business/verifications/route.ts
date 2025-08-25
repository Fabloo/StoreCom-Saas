import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');

    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    const verifications = await googleBusinessServiceAccountAPI.getVerificationStatus(locationName);

    return NextResponse.json({
      success: true,
      verifications,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}


