import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';
import { googleBusinessAPI } from '@/lib/google-business-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // Optional: comma-separated Performance API metrics; if omitted, use sensible defaults
    const metricsParam = searchParams.get('metrics');
    const metrics = (metricsParam?.split(',').map((m) => m.trim()).filter(Boolean)) || [
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'WEBSITE_CLICKS',
      'CALL_CLICKS',
      'BUSINESS_DIRECTION_REQUESTS',
    ];

    if (!locationName || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Location name, start date, and end date are required' }, 
        { status: 400 }
      );
    }

    // Prefer OAuth
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        const performance = await googleBusinessAPI.getLocationPerformanceMetrics(locationName, metrics, startDate, endDate);
        return NextResponse.json({ success: true, performance });
      } catch (oauthErr) {
        // fall through
      }
    }

    const performance = await googleBusinessServiceAccountAPI.getLocationPerformanceMetrics(locationName, metrics, startDate, endDate);
    return NextResponse.json({ success: true, performance });

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' }, 
      { status: 500 }
    );
  }
} 