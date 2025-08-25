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

    // Try to fetch Google user info (best-effort)
    let userInfo: any = null;
    try {
      const oauth2Client = googleBusinessAPI.getOAuth2Client();
      oauth2Client.setCredentials(tokens as any);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const resp = await oauth2.userinfo.get();
      userInfo = resp?.data || null;
    } catch (err) {
      // ignore; not critical
    }

    // Issue an app auth token (optional for your app sections)
    const token = signJwt({
      userId: userInfo?.id || 'google_user',
      role: 'super_admin' as const,
      brandIds: [],
      email: userInfo?.email,
      name: userInfo?.name,
      picture: userInfo?.picture,
    }, '7d');

    const returnTo = state && state.startsWith('/') ? state : '/reviews';
    const response = NextResponse.redirect(new URL(returnTo, request.url));

    // Persist app token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.set('client_auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Persist GBP cookies used by our GBP endpoints
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
    return NextResponse.json({ error: 'Authentication failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}






