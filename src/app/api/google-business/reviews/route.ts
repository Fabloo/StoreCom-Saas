import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';
import { googleBusinessAPI } from '@/lib/google-business-api';

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

    // Prefer OAuth via cookies (consistent with accounts/locations)
    const rawRefresh = request.cookies.get('gbp_refresh_token')?.value;
    const rawAccess = request.cookies.get('gbp_access_token')?.value;
    const refreshToken = rawRefresh;
    const accessToken = rawAccess;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        const reviews = await googleBusinessAPI.getReviews(locationName);
        return NextResponse.json({ success: true, reviews });
      } catch (oauthErr) {
        // fall through to service account
      }
    }

    // Fallback: service account
    const reviews = await googleBusinessServiceAccountAPI.getReviews(locationName);
    return NextResponse.json({ success: true, reviews });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewName = searchParams.get('reviewName');

    if (!reviewName) {
      return NextResponse.json(
        { error: 'Review name is required' }, 
        { status: 400 }
      );
    }

    const { comment } = await request.json();
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required' }, 
        { status: 400 }
      );
    }

    const reply = await googleBusinessServiceAccountAPI.replyToReview(reviewName, comment);

    return NextResponse.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('Error replying to review:', error);
    return NextResponse.json(
      { error: 'Failed to reply to review' }, 
      { status: 500 }
    );
  }
} 