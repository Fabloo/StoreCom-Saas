import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

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

// Google Business API scopes (request only what's needed)
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

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

class GoogleBusinessServiceAccountAPI {
  private serviceAccountClient: JWT;
  private mybusinessaccount: any;
  private mybusinessbusinessinformation: any;
  private mybusinessnotifications: any;
  private mybusinessverifications: any;

  constructor() {
    // Initialize service account client
    this.serviceAccountClient = new JWT({
      email: SERVICE_ACCOUNT_CONFIG.client_email,
      key: SERVICE_ACCOUNT_CONFIG.private_key,
      scopes: SCOPES
    });
  }

  // Initialize the API clients
  private async initializeAPIs() {
    // Authorize the service account client
    await this.serviceAccountClient.authorize();

    if (!this.mybusinessaccount) {
      this.mybusinessaccount = (google as any).mybusinessaccountmanagement({ version: 'v1', auth: this.serviceAccountClient });
    }
    
    if (!this.mybusinessbusinessinformation) {
      this.mybusinessbusinessinformation = (google as any).mybusinessbusinessinformation({ version: 'v1', auth: this.serviceAccountClient });
    }

    if (!this.mybusinessnotifications) {
      this.mybusinessnotifications = (google as any).mybusinessnotifications({ version: 'v1', auth: this.serviceAccountClient });
    }

    if (!this.mybusinessverifications) {
      this.mybusinessverifications = (google as any).mybusinessverifications({ version: 'v1', auth: this.serviceAccountClient });
    }
  }

  // Get all accounts
  async getAccounts(): Promise<GoogleBusinessAccount[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.list({
        auth: this.serviceAccountClient
      });
      return response.data.accounts || [];
    } catch (error) {
      const details = (error as any)?.response?.data || (error as any)?.message || String(error);
      console.error('Error fetching accounts:', details);
      throw new Error(`Failed to fetch Google Business accounts: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
    }
  }

  // Get locations for an account
  async getLocations(accountName: string): Promise<GoogleBusinessLocation[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.list({
        parent: accountName,
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
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
        auth: this.serviceAccountClient
      });
      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Performance API: fetch multiple daily metrics time series using service account
  async getLocationPerformanceMetrics(
    locationName: string,
    metrics: string[],
    startDateISO: string,
    endDateISO: string
  ): Promise<any> {
    await this.initializeAPIs();

    // Ensure a fresh access token for service account
    await this.serviceAccountClient.authorize();
    const tokenResp = await (this.serviceAccountClient as any).getAccessToken();
    const accessToken = tokenResp?.token || tokenResp;
    if (!accessToken) {
      throw new Error('Unable to acquire access token for Performance API');
    }

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

    const url = `https://businessprofileperformance.googleapis.com/v1/locations/${encodeURIComponent(
      locationId
    )}:fetchMultiDailyMetricsTimeSeries?${qp.toString()}`;

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
export const googleBusinessServiceAccountAPI = new GoogleBusinessServiceAccountAPI(); 