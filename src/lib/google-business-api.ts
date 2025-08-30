import { google } from 'googleapis';
import { OAuth2Client, JWT } from 'google-auth-library';

// Google Business API scopes (request only what's needed)
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/plus.business.manage'
];

// Prefer environment-based configuration. Supports either a full JSON blob or individual env vars.
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : null;

const SERVICE_ACCOUNT_CONFIG = SERVICE_ACCOUNT_JSON ?? {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID ?? '',
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID ?? '',
  private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL ?? '',
  client_id: process.env.GOOGLE_CLIENT_ID ?? '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: '',
  universe_domain: 'googleapis.com',
};

export interface GoogleBusinessAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  state: string;
  profilePhotoUri?: string;
  accountNumber?: string;
  locationCount?: number;
  locations?: GoogleBusinessLocation[];
}

export interface GoogleBusinessLocation {
  name: string;
  locationName?: string;
  title?: string; // Google API response has this
  primaryCategory?: {
    displayName: string;
    categoryId: string;
  };
  categories?: Array<{
    displayName: string;
    categoryId: string;
  }>;
  storeCode?: string;
  websiteUri?: string;
  phoneNumbers?: {
    primaryPhone?: string;
    additionalPhones?: string[];
  };
  description?: string;
  regularHours?: {
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  };
  specialHours?: {
    specialHourPeriods: Array<{
      startDate: {
        year: number;
        month: number;
        day: number;
      };
      endDate: {
        year: number;
        month: number;
        day: number;
      };
      openTime: string;
      closeTime: string;
      closed: boolean;
    }>;
  };
  serviceArea?: {
    businessType: string;
    places: {
      placeInfos: Array<{
        name: string;
        placeId: string;
      }>;
    };
  };
  labels?: string[];
  adWordsLocationExtensions?: {
    adPhone?: string;
  };
  latlng?: {
    latitude: number;
    longitude: number;
  };
  openInfo?: {
    status: string;
    canReopen: boolean;
    openingDate?: {
      year: number;
      month: number;
      day: number;
    };
  };
  locationKey?: {
    placeId: string;
    plusPageId?: string;
  };
  profile?: {
    description?: string;
    phoneNumbers?: {
      primaryPhone?: string;
      additionalPhones?: string[];
    };
    websiteUri?: string;
    regularHours?: {
      periods: Array<{
        openDay: string;
        openTime: string;
        closeDay: string;
        closeTime: string;
      }>;
    };
    specialHours?: {
      specialHourPeriods: Array<{
        startDate: {
          year: number;
          month: number;
          day: number;
        };
        endDate: {
          year: number;
          month: number;
          day: number;
        };
        openTime: string;
        closeTime: string;
        closed: boolean;
      }>;
    };
    serviceArea?: {
      businessType: string;
      places: {
        placeInfos: Array<{
          name: string;
          placeId: string;
        }>;
      };
    };
    labels?: string[];
    adWordsLocationExtensions?: {
      adPhone?: string;
    };
    latlng?: {
      latitude: number;
      longitude: number;
    };
    openInfo?: {
      status: string;
      canReopen: boolean;
      openingDate?: {
        year: number;
        month: number;
        day: number;
      };
    };
    locationKey?: {
      placeId: string;
      plusPageId?: string;
    };
  };
  metadata?: {
    duplicate?: {
      locationName: string;
    };
    mapsUri?: string;
    newReviewUri?: string;
  };
  relationshipData?: {
    parentChain?: {
      chainNames: Array<{
        displayName: string;
        languageCode: string;
      }>;
    };
  };
  moreHours?: Array<{
    hoursTypeId: string;
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  }>;
}

export interface GoogleBusinessInsights {
  locationMetrics: Array<{
    locationName: string;
    timeZone: string;
    metricValues: Array<{
      metric: string;
      dimensionalValues: Array<{
        dimension: string;
        value: string;
        metricValues: Array<{
          metric: string;
          value: string;
        }>;
      }>;
    }>;
  }>;
}

export interface GoogleBusinessPost {
  name: string;
  summary?: string;
  callToAction?: {
    actionType: string;
    url?: string;
  };
  media?: Array<{
    mediaFormat: string;
    googleUrl?: string;
  }>;
  topicType: string;
  languageCode?: string;
  createTime?: string;
  updateTime?: string;
  state: string;
  alertType?: string;
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
    offerType: string;
    title: string;
    summary?: string;
  };
  event?: {
    title: string;
    summary?: string;
    startTime?: string;
    endTime?: string;
  };
}

class GoogleBusinessAPI {
  private oauth2Client: OAuth2Client;
  private serviceAccountClient: JWT;
  private mybusinessaccount: any;
  private mybusinessbusinessinformation: any;
  private mybusinessnotifications: any;
  private mybusinessverifications: any;
  private authMode: 'oauth' | 'service_account' = 'service_account';

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    console.log('[GBP API] === OAuth2Client Initialization Debug ===');
    console.log('[GBP API] Environment variables at constructor:');
    console.log('[GBP API] - GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 10)}...${clientId.substring(clientId.length - 10)}` : 'MISSING');
    console.log('[GBP API] - GOOGLE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...${clientSecret.substring(clientSecret.length - 10)}` : 'MISSING');
    console.log('[GBP API] - GOOGLE_REDIRECT_URI:', redirectUri || 'MISSING');
    console.log('[GBP API] - All env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')).map(key => `${key}=${process.env[key] ? 'SET' : 'MISSING'}`));
    console.log('[GBP API] ===========================================');
    
    // Initialize OAuth2 client for user authentication
    try {
      this.oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      );
      console.log('[GBP API] OAuth2Client initialized successfully');
      console.log('[GBP API] OAuth2Client instance created with provided credentials');
      
      // If we have OAuth credentials, default to OAuth mode
      if (clientId && clientSecret) {
        this.authMode = 'oauth';
        console.log('[GBP API] Setting auth mode to OAuth (OAuth credentials detected)');
      }
    } catch (error) {
      console.error('[GBP API] Error initializing OAuth2Client:', error);
      throw error;
    }

    // Initialize service account client
    this.serviceAccountClient = new JWT({
      email: SERVICE_ACCOUNT_CONFIG.client_email,
      key: SERVICE_ACCOUNT_CONFIG.private_key,
      scopes: SCOPES
    });
  }

  // Ensure we have a usable access token if we only have a refresh token
  private async ensureAccessTokenFromRefresh(): Promise<void> {
    if (this.authMode !== 'oauth') return;
    const creds: any = (this.oauth2Client as any).credentials || {};
    const hasRefresh = Boolean(creds.refresh_token);
    const hasAccess = Boolean(creds.access_token);
    if (hasRefresh && !hasAccess) {
      try {
        const at = await this.oauth2Client.getAccessToken();
        if (at?.token) {
          this.oauth2Client.setCredentials({ access_token: at.token } as any);
        }
      } catch (err) {
        // Leave to upstream call to surface auth error
        // Intentionally no rethrow here to allow caller fallback logic
      }
    }
  }

  // Initialize the API clients
  private async initializeAPIs() {
    console.log('[GBP API] initializeAPIs called, auth mode:', this.authMode);
    
    // Authorize the service account client
    if (this.authMode === 'service_account') {
      console.log('[GBP API] Using service account authentication');
      await this.serviceAccountClient.authorize();
    }
    if (this.authMode === 'oauth') {
      console.log('[GBP API] Using OAuth authentication');
      await this.ensureAccessTokenFromRefresh();
    }

    const authClient = this.getAuthClient();
    console.log('[GBP API] Auth client type:', authClient.constructor.name);
    console.log('[GBP API] Auth client has credentials:', !!(authClient as any).credentials);

    // Debug: Check what's available in the google object
    console.log('[GBP API] Available Google APIs:', Object.keys(google).filter(key => key.includes('mybusiness') || key.includes('business')));
    
    if (!this.mybusinessaccount) {
      console.log('[GBP API] Initializing mybusinessaccount API client');
      try {
        // Try the correct API name
        if ((google as any).mybusinessaccountmanagement) {
          this.mybusinessaccount = (google as any).mybusinessaccountmanagement({ version: 'v1', auth: authClient });
          console.log('[GBP API] mybusinessaccount initialized successfully');
        } else if ((google as any).mybusinessaccount) {
          this.mybusinessaccount = (google as any).mybusinessaccount({ version: 'v1', auth: authClient });
          console.log('[GBP API] mybusinessaccount (alternative) initialized successfully');
        } else {
          console.error('[GBP API] mybusinessaccount API not available');
          this.mybusinessaccount = null;
        }
      } catch (error) {
        console.error('[GBP API] Error initializing mybusinessaccount:', error);
        this.mybusinessaccount = null;
      }
    }
    
    if (!this.mybusinessbusinessinformation) {
      console.log('[GBP API] Initializing mybusinessbusinessinformation API client');
      try {
        if ((google as any).mybusinessbusinessinformation) {
          this.mybusinessbusinessinformation = (google as any).mybusinessbusinessinformation({ version: 'v1', auth: authClient });
          console.log('[GBP API] mybusinessbusinessinformation initialized successfully');
        } else {
          console.error('[GBP API] mybusinessbusinessinformation API not available');
          this.mybusinessbusinessinformation = null;
        }
      } catch (error) {
        console.error('[GBP API] Error initializing mybusinessbusinessinformation:', error);
        this.mybusinessbusinessinformation = null;
      }
    }

    if (!this.mybusinessnotifications) {
      console.log('[GBP API] Initializing mybusinessnotifications API client');
      try {
        if ((google as any).mybusinessnotifications) {
          this.mybusinessnotifications = (google as any).mybusinessnotifications({ version: 'v1', auth: authClient });
          console.log('[GBP API] mybusinessnotifications initialized successfully');
        } else {
          console.error('[GBP API] mybusinessnotifications API not available');
          this.mybusinessnotifications = null;
        }
      } catch (error) {
        console.error('[GBP API] Error initializing mybusinessnotifications:', error);
        this.mybusinessnotifications = null;
      }
    }

    if (!this.mybusinessverifications) {
      console.log('[GBP API] Initializing mybusinessverifications API client');
      try {
        if ((google as any).mybusinessverifications) {
          this.mybusinessverifications = (google as any).mybusinessverifications({ version: 'v1', auth: authClient });
          console.log('[GBP API] mybusinessverifications initialized successfully');
        } else {
          console.error('[GBP API] mybusinessverifications API not available');
          this.mybusinessverifications = null;
        }
      } catch (error) {
        console.error('[GBP API] Error initializing mybusinessverifications:', error);
        this.mybusinessverifications = null;
      }
    }
    
    console.log('[GBP API] All API clients initialized');
  }

  // Set authentication mode
  setAuthMode(mode: 'oauth' | 'service_account') {
    this.authMode = mode;
    // Reset API clients to reinitialize with new auth
    this.mybusinessaccount = null;
    this.mybusinessbusinessinformation = null;
    this.mybusinessnotifications = null;
    this.mybusinessverifications = null;
  }

  // Get the current auth client
  private getAuthClient() {
    return this.authMode === 'service_account' ? this.serviceAccountClient : this.oauth2Client;
  }

  // Expose the OAuth2 client for cases where callers need to use Google APIs directly (e.g., userinfo)
  getOAuth2Client() {
    return this.oauth2Client;
  }

  // Set credentials from tokens
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
    // Ensure we're in OAuth mode when credentials are set
    this.authMode = 'oauth';
    console.log('[GBP API] Credentials set, auth mode switched to OAuth');
  }

  // Set credentials from a refresh token string
  setRefreshToken(refreshToken: string) {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken } as any);
  }

  // Public method to explicitly refresh an access token when a refresh token is present
  async refreshAccessToken(): Promise<any> {
    if (this.authMode !== 'oauth') {
      throw new Error('refreshAccessToken called while not in oauth mode');
    }
    const creds: any = (this.oauth2Client as any).credentials || {};
    if (!creds.refresh_token) {
      throw new Error('No refresh_token available to refresh access token');
    }
    // getAccessToken() will use the refresh_token to obtain a fresh access token
    const accessTokenResponse = await this.oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error('Failed to obtain access token from refresh token');
    }
    // Set both refresh_token and access_token to maintain the refresh capability
    this.oauth2Client.setCredentials({ 
      refresh_token: creds.refresh_token,
      access_token: accessToken 
    } as any);
    return { access_token: accessToken };
  }

  // Generate authorization URL
  generateAuthUrl(): string {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log('[GBP API] === OAuth Configuration Debug ===');
    console.log('[GBP API] Environment variables check:');
    console.log('[GBP API] - GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 10)}...${clientId.substring(clientId.length - 10)}` : 'MISSING');
    console.log('[GBP API] - GOOGLE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...${clientSecret.substring(clientSecret.length - 10)}` : 'MISSING');
    console.log('[GBP API] - GOOGLE_REDIRECT_URI:', redirectUri || 'MISSING');
    console.log('[GBP API] - SCOPES:', SCOPES);
    console.log('[GBP API] - NODE_ENV:', process.env.NODE_ENV);
    console.log('[GBP API] ================================');
    
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is required');
    }
    
    if (!redirectUri) {
      throw new Error('GOOGLE_REDIRECT_URI environment variable is required');
    }
    
    if (!clientSecret) {
      console.warn('[GBP API] WARNING: GOOGLE_CLIENT_SECRET is missing - this may cause OAuth issues');
    }
    
    const authUrlOptions = {
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      redirect_uri: redirectUri
    };
    
    console.log('[GBP API] OAuth2Client.generateAuthUrl options:', JSON.stringify(authUrlOptions, null, 2));
    
    try {
      // Ensure the OAuth2Client has the correct redirect_uri
      const currentRedirectUri = (this.oauth2Client as any)._redirectUri;
      if (currentRedirectUri !== redirectUri) {
        console.log('[GBP API] Updating OAuth2Client redirect_uri from', currentRedirectUri, 'to', redirectUri);
        // Create a new OAuth2Client instance with the correct redirect_uri
        this.oauth2Client = new (require('google-auth-library').OAuth2Client)(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          redirectUri
        );
        console.log('[GBP API] New OAuth2Client created with redirect_uri:', (this.oauth2Client as any)._redirectUri);
      }
      
      // Force set the redirect_uri on the OAuth2Client instance
      (this.oauth2Client as any)._redirectUri = redirectUri;
      console.log('[GBP API] Forced redirect_uri on OAuth2Client:', (this.oauth2Client as any)._redirectUri);
      
      const authUrl = this.oauth2Client.generateAuthUrl(authUrlOptions);
      console.log('[GBP API] Generated OAuth URL successfully');
      console.log('[GBP API] Auth URL (first 100 chars):', authUrl.substring(0, 100) + '...');
      console.log('[GBP API] Auth URL contains redirect_uri:', authUrl.includes(redirectUri));
      console.log('[GBP API] Auth URL contains client_id:', authUrl.includes(clientId));
      
      // Debug: Check if redirect_uri is in the options
      console.log('[GBP API] Debug - redirect_uri in options:', authUrlOptions.redirect_uri);
      console.log('[GBP API] Debug - OAuth2Client redirect_uri:', (this.oauth2Client as any)._redirectUri);
      
      return authUrl;
    } catch (error) {
      console.error('[GBP API] Error generating OAuth URL:', error);
      throw error;
    }
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string) {
    console.log('[GBP API] === Token Exchange Debug ===');
    console.log('[GBP API] Exchanging code for tokens...');
    console.log('[GBP API] Code length:', code?.length);
    console.log('[GBP API] OAuth2Client state:', {
      hasClientId: !!this.oauth2Client._clientId,
      hasClientSecret: !!this.oauth2Client._clientSecret,
      hasRedirectUri: !!(this.oauth2Client as any)._redirectUri
    });
    
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      console.log('[GBP API] Token exchange successful');
      console.log('[GBP API] Tokens received:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        hasExpiry: !!tokens.expiry_date,
        tokenKeys: Object.keys(tokens || {})
      });
      
      this.oauth2Client.setCredentials(tokens);
      console.log('[GBP API] Credentials set on OAuth2Client');
      
      return tokens;
    } catch (error: any) {
      console.error('[GBP API] Token exchange failed:', error);
      console.error('[GBP API] Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'No code',
        status: error?.status || 'No status',
        response: error?.response?.data || 'No response data'
      });
      throw error;
    }
  }

  // Get all accounts
  async getAccounts(): Promise<GoogleBusinessAccount[]> {
    await this.initializeAPIs();
    
    try {
      // Use the newer Google Business Profile API endpoint
      const response = await this.mybusinessaccount.accounts.list({
        auth: this.getAuthClient(),
      });
      if (!response?.data) {
        console.warn('[GBP Lib] Accounts list response missing data');
      }
      return response.data.accounts || [];
    } catch (error) {
      const status = (error as any)?.code || (error as any)?.response?.status;
      const details = (error as any)?.response?.data || (error as any)?.message || String(error);
      console.error('[GBP Lib] Error fetching accounts', { status, details });
      
      // Try direct API call as fallback
      try {
        console.log('[GBP Lib] Trying direct API call...');
        const authClient = this.getAuthClient();
        const tokenResp = await (authClient as any).getAccessToken();
        const accessToken = tokenResp?.token || tokenResp;
        console.log('[GBP Lib] Access token debug:', {
          hasToken: !!accessToken,
          tokenLength: accessToken?.length,
          tokenStart: accessToken?.substring(0, 20),
          authMode: this.authMode,
        });
        
        // Try the main Business Profile API first
        let directResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('[GBP Lib] Direct API call successful, found accounts:', directData.accounts?.length || 0);
          console.log('[GBP Lib] Account details:', directData.accounts?.map((a: any) => ({ name: a.name, accountName: a.accountName, type: a.type })));
          return directData.accounts || [];
        }
        
        // If that fails, try the newer Business Profile API
        console.log('[GBP Lib] Main API failed, trying Business Profile API...');
        directResponse = await fetch('https://businessprofileperformance.googleapis.com/v1/accounts', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('[GBP Lib] Business Profile API successful, found accounts:', directData.accounts?.length || 0);
          console.log('[GBP Lib] Business Profile accounts:', directData.accounts?.map((a: any) => ({ name: a.name, accountName: a.accountName, type: a.type })));
          return directData.accounts || [];
        }
        
        // Try the legacy My Business API as a fallback
        console.log('[GBP Lib] Business Profile API failed, trying legacy My Business API...');
        directResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('[GBP Lib] Legacy My Business API successful, found accounts:', directData.accounts?.length || 0);
          console.log('[GBP Lib] Legacy accounts:', directData.accounts?.map((a: any) => ({ name: a.name, accountName: a.accountName, type: a.type })));
          return directData.accounts || [];
        }
        
        // If both fail, show the error from the first attempt
        const errorText = await directResponse.text();
        console.error('[GBP Lib] All API calls failed. Last error:', directResponse.status, errorText);
        
        // Try one more approach - check if we need different scopes
        console.log('[GBP Lib] Trying to check account access with different approach...');
        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            console.log('[GBP Lib] User info accessible:', userInfo.email);
          }
        } catch (userError) {
          console.log('[GBP Lib] User info check failed:', userError);
        }
        
        throw new Error(`All API calls failed. Last error: ${directResponse.status} ${errorText}`);
      } catch (directError) {
        console.error('[GBP Lib] Direct API call also failed:', directError);
        throw new Error('Failed to fetch Google Business accounts');
      }
    }
  }

  // Get all businesses (accounts + their locations)
  async getAllBusinesses(): Promise<GoogleBusinessAccount[]> {
    console.log('[GBP API] Getting all businesses (accounts + locations)...');
    
    try {
      // First get the main accounts
      const accounts = await this.getAccounts();
      console.log('[GBP API] Found main accounts:', accounts.length);
      
      if (accounts.length === 0) {
        console.log('[GBP API] No main accounts found');
        return [];
      }
      
      // Try to get businesses directly from Business Profile API
      console.log('[GBP API] Trying to get businesses directly from Business Profile API...');
      const businesses = await this.getBusinessesDirect();
      
      if (businesses.length > 0) {
        console.log('[GBP API] Found businesses directly:', businesses.length);
        return businesses;
      }
      
      // Fallback: For each account, get its locations but keep the account structure
      console.log('[GBP API] Direct business fetch failed, using accounts with locations...');
      const allBusinesses: GoogleBusinessAccount[] = [];
      
      for (const account of accounts) {
        console.log('[GBP API] Processing account:', account.name);
        
        try {
          // Get locations for this account
          const locations = await this.getLocations(account.name);
          console.log('[GBP API] Found locations for account', account.name, ':', locations.length);
          
          if (locations.length > 0) {
            // Keep the main account and add location count info
            const accountWithLocations = {
              ...account,
              locationCount: locations.length,
              locations: locations // Add locations array for reference
            };
            
            allBusinesses.push(accountWithLocations);
            console.log('[GBP API] Added account with locations:', account.accountName, 'Locations:', locations.length);
          } else {
            // If no locations, add the main account itself
            allBusinesses.push(account);
            console.log('[GBP API] No locations found, added main account');
          }
        } catch (locationError) {
          console.error('[GBP API] Error fetching locations for account', account.name, ':', locationError);
          // Still add the main account even if locations fail
          allBusinesses.push(account);
        }
      }
      
      console.log('[GBP API] Total businesses found:', allBusinesses.length);
      return allBusinesses;
      
    } catch (error) {
      console.error('[GBP API] Error getting all businesses:', error);
      // Fallback to just accounts if the full process fails
      console.log('[GBP API] Falling back to accounts only');
      return await this.getAccounts();
    }
  }

  // Get businesses directly from Business Profile API using the correct flow
  private async getBusinessesDirect(): Promise<GoogleBusinessAccount[]> {
    try {
      const authClient = this.getAuthClient();
      const tokenResp = await (authClient as any).getAccessToken();
      const accessToken = tokenResp?.token || tokenResp;
      
      console.log('[GBP API] Getting businesses using correct API flow...');
      
      // Step 1: Get all accounts using Account Management API
      console.log('[GBP API] Step 1: Getting accounts from Account Management API...');
      const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      
      if (!accountsResponse.ok) {
        console.error('[GBP API] Account Management API failed:', accountsResponse.status);
        return [];
      }
      
      const accountsData = await accountsResponse.json();
      console.log('[GBP API] Accounts found:', accountsData.accounts?.length || 0);
      
      if (!accountsData.accounts || accountsData.accounts.length === 0) {
        console.log('[GBP API] No accounts found');
        return [];
      }
      
      const allBusinesses: GoogleBusinessAccount[] = [];
      
      // Step 2: For each account, get its locations using Business Information API
      for (const account of accountsData.accounts) {
        console.log('[GBP API] Processing account:', account.name, 'Type:', account.type);
        
        // Extract accountId from account name (e.g., "accounts/1234567890" -> "1234567890")
        const accountId = account.name?.replace('accounts/', '');
        if (!accountId) {
          console.log('[GBP API] Skipping account with invalid name:', account.name);
          continue;
        }
        
        try {
          // Step 3: Get locations for this account using Business Information API
          console.log('[GBP API] Step 3: Getting locations for account:', accountId);
          const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storeCode,websiteUri,regularHours,serviceArea,labels`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            },
          });
          
          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            console.log('[GBP API] Locations found for account', accountId, ':', locationsData.locations?.length || 0);
            
            if (locationsData.locations && locationsData.locations.length > 0) {
              // Create account with nested locations instead of separate businesses
              const accountWithLocations = {
                name: account.name,
                accountName: account.accountName || account.name,
                type: account.type || 'ACCOUNT',
                role: 'OWNER',
                state: 'ACTIVE',
                profilePhotoUri: undefined,
                accountNumber: accountId,
                locationCount: locationsData.locations.length,
                locations: locationsData.locations
              };
              
              allBusinesses.push(accountWithLocations);
              console.log('[GBP API] Added account with nested locations:', account.accountName, 'Locations:', locationsData.locations.length);
            } else {
              // If no locations, add the main account itself
              allBusinesses.push({
                name: account.name,
                accountName: account.accountName || account.name,
                type: account.type || 'ACCOUNT',
                role: 'OWNER',
                state: 'ACTIVE',
                profilePhotoUri: undefined,
                accountNumber: accountId,
                locationCount: 0
              });
              console.log('[GBP API] No locations found, added main account');
            }
          } else {
            console.log('[GBP API] Failed to get locations for account', accountId, 'Status:', locationsResponse.status);
            // Still add the main account even if locations fail
            allBusinesses.push({
              name: account.name,
              accountName: account.accountName || account.name,
              type: account.type || 'ACCOUNT',
              role: 'OWNER',
              state: 'ACTIVE',
              profilePhotoUri: undefined,
              accountNumber: accountId,
              locationCount: 0
            });
          }
        } catch (locationError) {
          console.error('[GBP API] Error fetching locations for account', accountId, ':', locationError);
          // Still add the main account even if locations fail
          allBusinesses.push({
            name: account.name,
            accountName: account.accountName || account.name,
            type: account.type || 'ACCOUNT',
            role: 'OWNER',
            state: 'ACTIVE',
            profilePhotoUri: undefined,
            accountNumber: accountId,
            locationCount: 0
          });
        }
      }
      
      console.log('[GBP API] Total businesses found using correct API flow:', allBusinesses.length);
      return allBusinesses;
      
    } catch (error) {
      console.error('[GBP API] Error in direct business fetch:', error);
      return [];
    }
  }

  // Get locations for an account
  async getLocations(accountName: string): Promise<GoogleBusinessLocation[]> {
    await this.initializeAPIs();
    
    // If the API client is not available, try direct API call
    if (!this.mybusinessaccount) {
      console.log('[GBP API] mybusinessaccount API client not available, trying direct API call');
      return await this.getLocationsDirect(accountName);
    }
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.list({
        parent: accountName,
        auth: this.getAuthClient(),
      });
      return response.data.locations || [];
    } catch (error) {
      console.error('[GBP API] Error fetching locations via API client:', error);
      console.log('[GBP API] Falling back to direct API call');
      return await this.getLocationsDirect(accountName);
    }
  }

  // Fallback method to get locations via direct API call
  private async getLocationsDirect(accountName: string): Promise<GoogleBusinessLocation[]> {
    try {
      const authClient = this.getAuthClient();
      const tokenResp = await (authClient as any).getAccessToken();
      const accessToken = tokenResp?.token || tokenResp;
      
      console.log('[GBP API] Getting locations via direct API call for account:', accountName);
      
      // Use the correct API endpoint as per Google documentation
      console.log('[GBP API] Using correct API endpoint for locations...');
      
      // Extract accountId from account name (e.g., "accounts/1234567890" -> "1234567890")
      const accountId = accountName.replace('accounts/', '');
      console.log('[GBP API] Extracted accountId:', accountId);
      
      // Use the Business Information API as per documentation
      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storeCode,websiteUri,regularHours,serviceArea,labels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[GBP API] Business Information API successful, found locations:', data.locations?.length || 0);
        return data.locations || [];
      }
      
      // If that fails, try the Account Management API as fallback
      console.log('[GBP API] Business Information API failed, trying Account Management API...');
      const accountResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts/${accountId}/locations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      
      if (accountResponse.ok) {
        const data = await accountResponse.json();
        console.log('[GBP API] Account Management API successful, found locations:', data.locations?.length || 0);
        return data.locations || [];
      }
      
      // Log the error details
      const errorText = await response.text();
      console.error('[GBP API] Location API calls failed. Last error:', response.status, errorText);
      
      // Return empty array instead of throwing error to allow fallback to main account
      return [];
      
    } catch (error) {
      console.error('[GBP API] Error in direct location API call:', error);
      // Return empty array instead of throwing error to allow fallback to main account
      return [];
    }
  }

  // Get a specific location
  async getLocation(locationName: string): Promise<GoogleBusinessLocation> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessbusinessinformation.accounts.locations.get({
        name: locationName,
        auth: this.getAuthClient(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Failed to fetch location');
    }
  }

  // Update location information
  async updateLocation(locationName: string, updateData: Partial<GoogleBusinessLocation>) {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessbusinessinformation.accounts.locations.patch({
        name: locationName,
        requestBody: updateData,
        updateMask: Object.keys(updateData).join(','),
        auth: this.getAuthClient(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location');
    }
  }

  // Get location insights
  async getLocationInsights(locationName: string, startDate: string, endDate: string): Promise<GoogleBusinessInsights> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.reportInsights({
        location: locationName,
        requestBody: {
          locationNames: [locationName],
          basicRequest: {
            metricRequests: [
              { metric: 'QUERIES_DIRECT' },
              { metric: 'QUERIES_INDIRECT' },
              { metric: 'VIEWS_MAPS' },
              { metric: 'VIEWS_SEARCH' },
              { metric: 'ACTIONS_WEBSITE' },
              { metric: 'ACTIONS_PHONE' },
              { metric: 'ACTIONS_DRIVING_DIRECTIONS' },
              { metric: 'PHOTOS_VIEWS_MERCHANT' },
              { metric: 'PHOTOS_VIEWS_CUSTOMERS' },
              { metric: 'PHOTOS_COUNT_MERCHANT' },
              { metric: 'PHOTOS_COUNT_CUSTOMERS' },
              { metric: 'LOCAL_POST_VIEWS' },
              { metric: 'LOCAL_POST_ACTIONS' }
            ],
            timeRange: {
              startTime: startDate,
              endTime: endDate
            }
          }
        },
        auth: this.getAuthClient(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw new Error('Failed to fetch location insights');
    }
  }

  // Create a post
  async createPost(locationName: string, postData: Partial<GoogleBusinessPost>): Promise<GoogleBusinessPost> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.localPosts.create({
        parent: locationName,
        requestBody: postData,
        auth: this.getAuthClient(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  // Get posts for a location
  async getPosts(locationName: string): Promise<GoogleBusinessPost[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.localPosts.list({
        parent: locationName,
        auth: this.getAuthClient(),
      });
      return response.data.localPosts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  // Delete a post
  async deletePost(postName: string): Promise<void> {
    await this.initializeAPIs();
    
    try {
      await this.mybusinessaccount.accounts.locations.localPosts.delete({
        name: postName,
        auth: this.getAuthClient(),
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  // Get reviews for a location
  async getReviews(locationName: string): Promise<any[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.reviews.list({
        parent: locationName,
        auth: this.getAuthClient(),
      });
      return response.data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  // Reply to a review
  async replyToReview(reviewName: string, comment: string): Promise<any> {
    try {
      console.log('[GBP API] Replying to review:', reviewName);
      
      const authClient = this.getAuthClient();
      const tokenResp = await (authClient as any).getAccessToken();
      const accessToken = tokenResp?.token || tokenResp;
      
      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${reviewName}/reviewReply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to reply to review: ${errorData.error?.message || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('[GBP API] Review reply successful');
      return result;
      
    } catch (error) {
      console.error('[GBP API] Error replying to review:', error);
      throw error;
    }
  }

  // Get verification status
  async getVerificationStatus(locationName: string): Promise<any> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessverifications.accounts.locations.verifications.list({
        parent: locationName,
        auth: this.getAuthClient(),
      });
      return response.data.verifications || [];
    } catch (error) {
      console.error('Error fetching verification status:', error);
      throw new Error('Failed to fetch verification status');
    }
  }

  // Get notifications
  async getNotifications(accountName: string): Promise<any[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessnotifications.accounts.notifications.list({
        parent: accountName,
        auth: this.getAuthClient(),
      });
      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Performance API: fetch multiple daily metrics time series
  // Docs: https://businessprofileperformance.googleapis.com/v1/locations/{locationId}:fetchMultiDailyMetricsTimeSeries
  async getLocationPerformanceMetrics(
    locationName: string,
    metrics: string[],
    startDateISO: string,
    endDateISO: string
  ): Promise<any> {
    await this.initializeAPIs();

    // Extract locationId from accounts/{aid}/locations/{lid}
    const match = /\/locations\/([^/]+)/.exec(locationName);
    const locationId = match?.[1] || locationName;

    // Convert ISO -> date parts
    const start = new Date(startDateISO);
    const end = new Date(endDateISO);
    const qp = new URLSearchParams();
    for (const m of metrics) qp.append('dailyMetrics', m);
    qp.append('dailyRange.start_date.year', String(start.getUTCFullYear()));
    qp.append('dailyRange.start_date.month', String(start.getUTCMonth() + 1));
    qp.append('dailyRange.start_date.day', String(start.getUTCDate()));
    qp.append('dailyRange.end_date.year', String(end.getUTCFullYear()));
    qp.append('dailyRange.end_date.month', String(end.getUTCMonth() + 1));
    qp.append('dailyRange.end_date.day', String(end.getUTCDate()));

    // Get bearer token for current auth client
    const tokenResp = await (this.getAuthClient() as any).getAccessToken();
    const accessToken = tokenResp?.token || tokenResp; // google-auth may return string or { token }
    if (!accessToken) {
      throw new Error('Unable to acquire access token for Performance API');
    }

    const url = `https://businessprofileperformance.googleapis.com/v1/locations/${encodeURIComponent(
      locationId
    )}:fetchMultiDailyMetricsTimeSeries?${qp.toString()}`;

    console.log("bearer token", accessToken)

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    } as any);

    const data = await res.json();
    if (!res.ok) {
      const details = (data && (data.error?.message || JSON.stringify(data))) || res.statusText;
      throw new Error(`Performance API error: ${details}`);
    }
    return data;
  }
}

// Create a singleton instance
export const googleBusinessAPI = new GoogleBusinessAPI(); 