import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessAPI } from '@/lib/google-business-api';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get('returnTo') || undefined;
    console.log('[GBP Accounts][GET]', {
      hasReturnTo: Boolean(returnTo),
      hasRefreshCookie: Boolean(request.cookies.get('gbp_refresh_token')?.value),
      hasAccessCookie: Boolean(request.cookies.get('gbp_access_token')?.value),
    });
    // Track if the refresh token is definitively invalid (e.g., invalid_grant)
    let invalidRefresh = false;
    let fallbackAuthUrl: string | null = null;
    const isInvalidRefreshError = (err: any): boolean => {
      const message = String(err?.message || '').toLowerCase();
      const responseError = String(err?.response?.data?.error || err?.code || '').toLowerCase();
      const responseErrorDesc = String(err?.response?.data?.error_description || '').toLowerCase();
      return (
        responseError === 'invalid_grant' ||
        responseError === 'invalid_token' ||
        message.includes('invalid_grant') ||
        responseErrorDesc.includes('token has been expired or revoked') ||
        (message.includes('refresh token') && (message.includes('revoked') || message.includes('expired') || message.includes('invalid')))
      );
    };
    const rawRefresh = request.cookies.get('gbp_refresh_token')?.value;
    const rawAccess = request.cookies.get('gbp_access_token')?.value;
    const refreshToken = rawRefresh;
    const accessToken = rawAccess;
    
    console.log('[GBP Accounts] Cookie debug:', {
      hasRawRefresh: !!rawRefresh,
      hasRawAccess: !!rawAccess,
      refreshFirst10: rawRefresh?.substring(0, 10),
      accessFirst10: rawAccess?.substring(0, 10),
    });

    // 1) Try short-lived access token first
    if (accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        const accounts = await googleBusinessAPI.getAccounts();
        console.log('[GBP Accounts] Short-lived access token cookie used; fetched accounts', { count: accounts?.length || 0 });
        const res = NextResponse.json({ success: true, accounts });
        if (invalidRefresh) {
          res.cookies.set('gbp_refresh_token', '', { maxAge: 0, path: '/' });
        }
        return res;
      } catch (accessErr) {
        console.warn('[GBP Accounts] Access token failed; will try refresh if available', accessErr);
        // If we also have a refresh token, try to refresh and retry once
        if (refreshToken) {
          try {
            googleBusinessAPI.setAuthMode('oauth');
            googleBusinessAPI.setRefreshToken(refreshToken);
            const newTokens = await googleBusinessAPI.refreshAccessToken();
            googleBusinessAPI.setCredentials(newTokens);
            const accounts = await googleBusinessAPI.getAccounts();
            console.log('[GBP Accounts] Access token refreshed via refresh_token; fetched accounts', { count: accounts?.length || 0 });
            const res = NextResponse.json({ success: true, accounts });
            return res;
          } catch (refreshErr) {
            console.warn('[GBP Accounts] Refresh using refresh_token failed after access token failure', refreshErr);
            invalidRefresh = isInvalidRefreshError(refreshErr);
            let authUrl = googleBusinessAPI.generateAuthUrl();
            if (returnTo) {
              try {
                const url = new URL(authUrl);
                url.searchParams.set('state', returnTo);
                authUrl = url.toString();
              } catch {}
            }
            fallbackAuthUrl = authUrl;
          }
        }
      }
    }

    // 2) If no access token or it failed without refresh, try refresh token directly
    if (refreshToken && !invalidRefresh) {
      try {
        console.log('[GBP Accounts] Attempting refresh token flow...');
        googleBusinessAPI.setAuthMode('oauth');
        googleBusinessAPI.setRefreshToken(refreshToken);
        const newTokens = await googleBusinessAPI.refreshAccessToken();
        console.log('[GBP Accounts] Refresh successful, new token obtained');
        // newTokens already sets credentials in refreshAccessToken(), but ensure it's set
        googleBusinessAPI.setCredentials({
          refresh_token: refreshToken,
          access_token: newTokens.access_token
        });
        const accounts = await googleBusinessAPI.getAccounts();
        console.log('[GBP Accounts] OAuth cookie present; fetched accounts via refreshed access token', { 
          count: accounts?.length || 0,
          accounts: accounts?.map(a => ({ name: a.name, accountName: a.accountName, type: a.type }))
        });
        return NextResponse.json({ success: true, accounts });
      } catch (oauthError: any) {
        // If refresh token is invalid/expired, mark invalidRefresh to clear cookie later
        console.error('[GBP Accounts] Refresh token flow failed', {
          error: oauthError?.message,
          code: oauthError?.code,
          response: oauthError?.response?.data,
          refreshTokenLength: refreshToken?.length,
        });
        invalidRefresh = isInvalidRefreshError(oauthError);
        let authUrl = googleBusinessAPI.generateAuthUrl();
        if (returnTo) {
          try {
            const url = new URL(authUrl);
            url.searchParams.set('state', returnTo);
            authUrl = url.toString();
          } catch {}
        }
        fallbackAuthUrl = authUrl;
        // do not return yet; try service account or requireAuth
      }
    }

    // Try service account next if credentials exist
    const hasServiceAccount =
      !!process.env.GOOGLE_CLIENT_EMAIL &&
      (!!process.env.GOOGLE_PRIVATE_KEY || !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

      console.log("has Service Account", hasServiceAccount);

    if (hasServiceAccount) {
      try {
        const accounts = await googleBusinessServiceAccountAPI.getAccounts();
        console.log('[GBP Accounts] Service account used; fetched accounts', { count: accounts?.length || 0 });
        return NextResponse.json({
          success: true,
          accounts,
        });
      } catch (saError: any) {
        const status = (saError?.response as any)?.status;
        const details = saError?.message || (saError as any)?.toString?.() || 'Unknown error';
        console.warn('[GBP Accounts] Service account failed', { status, details });

        // If service account lacks permission, fall back to OAuth by returning authUrl
        const isAuthIssue =
          status === 401 ||
          status === 403 ||
          /permission|unauthorized|auth|forbidden/i.test(details);

        if (isAuthIssue) {
          let authUrl = fallbackAuthUrl || googleBusinessAPI.generateAuthUrl();
          if (returnTo) {
            try {
              const url = new URL(authUrl);
              url.searchParams.set('state', returnTo);
              authUrl = url.toString();
            } catch {}
          }
          // Return 200 with requireAuth to avoid noisy 401s on lightweight status checks
          const res = NextResponse.json({ requireAuth: true, authUrl, details });
          if (invalidRefresh) {
            res.cookies.set('gbp_refresh_token', '', { maxAge: 0, path: '/' });
          }
          return res;
        }

        // Non-auth related error
        return NextResponse.json(
          { error: 'Failed to fetch accounts', details },
          { status: 500 }
        );
      }
    }

    // No service account configured and no valid OAuth cookie. Require OAuth login.
    let authUrl = fallbackAuthUrl || googleBusinessAPI.generateAuthUrl();
    if (returnTo) {
      try {
        const url = new URL(authUrl);
        url.searchParams.set('state', returnTo);
        authUrl = url.toString();
      } catch {}
    }
    console.log('[GBP Accounts] No credentials; requiring OAuth');
    const res = NextResponse.json({ requireAuth: true, authUrl, details: 'No credentials found. OAuth required.' });
    if (invalidRefresh) {
      res.cookies.set('gbp_refresh_token', '', { maxAge: 0, path: '/' });
    }
    return res;

  } catch (error) {
    console.error('[GBP Accounts] Handler error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts', details: message }, 
      { status: 500 }
    );
  }
} 