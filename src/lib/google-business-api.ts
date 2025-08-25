import { google } from 'googleapis';
import { OAuth2Client, JWT } from 'google-auth-library';

// Google Business API scopes (request only what's needed)
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
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
}

export interface GoogleBusinessLocation {
  name: string;
  locationName: string;
  primaryCategory: {
    displayName: string;
    categoryId: string;
  };
  categories: Array<{
    displayName: string;
    categoryId: string;
  }>;
  storeCode?: string;
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
    // Initialize OAuth2 client for user authentication
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

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
    // Authorize the service account client
    if (this.authMode === 'service_account') {
      await this.serviceAccountClient.authorize();
    }
    if (this.authMode === 'oauth') {
      await this.ensureAccessTokenFromRefresh();
    }

    if (!this.mybusinessaccount) {
      this.mybusinessaccount = (google as any).mybusinessaccountmanagement({ version: 'v1', auth: this.getAuthClient() });
    }
    
    if (!this.mybusinessbusinessinformation) {
      this.mybusinessbusinessinformation = (google as any).mybusinessbusinessinformation({ version: 'v1', auth: this.getAuthClient() });
    }

    if (!this.mybusinessnotifications) {
      this.mybusinessnotifications = (google as any).mybusinessnotifications({ version: 'v1', auth: this.getAuthClient() });
    }

    if (!this.mybusinessverifications) {
      this.mybusinessverifications = (google as any).mybusinessverifications({ version: 'v1', auth: this.getAuthClient() });
    }
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
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
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

  // Get locations for an account
  async getLocations(accountName: string): Promise<GoogleBusinessLocation[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.list({
        parent: accountName,
        auth: this.getAuthClient(),
      });
      return response.data.locations || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations');
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
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.reviews.updateReply({
        name: reviewName,
        requestBody: {
          comment: comment
        },
        auth: this.getAuthClient(),
      });
      return response.data;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw new Error('Failed to reply to review');
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