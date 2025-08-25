import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { googleBusinessAPI } from '@/lib/google-business-api';
import { signJwt } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    // Exchange the authorization code for tokens
    const tokens = await googleBusinessAPI.getTokensFromCode(code);
    
    if (!tokens) {
      return NextResponse.json({ error: 'Failed to exchange tokens' }, { status: 500 });
    }

    // Get user information from Google
    let userInfo;
    try {
      const oauth2Client = googleBusinessAPI.getOAuth2Client();
      oauth2Client.setCredentials(tokens);
      
      // Get user profile from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      userInfo = await oauth2.userinfo.get();
    } catch (error) {
      console.error('Failed to get user info:', error);
      // Continue without user info, we'll use a default profile
    }

    // Create a JWT token for the application
    const jwtPayload = {
      userId: userInfo?.id || 'google_user',
      role: 'super_admin' as const, // Default to super admin for now
      brandIds: [],
      email: userInfo?.email,
      name: userInfo?.name,
      picture: userInfo?.picture
    };

    const token = signJwt(jwtPayload, '7d');

    // Redirect using the OAuth state param as return path; fallback to /admin
    const returnTo = state && state.startsWith('/') ? state : '/admin';
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    
    // Set the JWT token as a cookie for server-side access
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set a client-side accessible token
    response.cookies.set('client_auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Persist Google tokens for GBP API usage similar to /api/google-business/auth
    const refreshToken = (tokens as any)?.refresh_token;
    const accessToken = (tokens as any)?.access_token;
    if (refreshToken) {
      response.cookies.set('gbp_refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    if (accessToken) {
      // Default short TTL; GoogleBusiness endpoints will refresh as needed
      response.cookies.set('gbp_access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10,
      });
    }

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
