import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessProfileId = searchParams.get('businessProfileId');
    const storeId = searchParams.get('storeId');
    const directCall = searchParams.get('direct') === 'true';

    if (!businessProfileId || !storeId) {
      return NextResponse.json(
        { error: 'Business Profile ID and Store ID are required' }, 
        { status: 400 }
      );
    }

    // Use the provided IDs as account ID and location ID for Google Business Profile API
    const accountId = businessProfileId; // 16058076381455815546
    const locationId = storeId; // 11007263269570993027
    
    // API endpoints based on Google Business Profile API v4.9 and Business Information API v1
    const locationEndpoint = `https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationId}`;
    const reviewsEndpoint = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;
    
    // If direct call is requested, try to make the API call directly
    if (directCall) {
      try {
        // Try to use environment variables for direct API access
        const apiKey = process.env.GOOGLE_API_KEY;
        const serviceAccountEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        
        if (apiKey) {
          // Method 1: Try with API key (if the API supports it)
          console.log('Attempting direct API call with API key...');
          
          const reviewsResponse = await fetch(`${reviewsEndpoint}?key=${apiKey}&pageSize=50&orderBy=updateTime desc`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            return NextResponse.json({
              success: true,
              businessProfileId: accountId,
              storeId: locationId,
              message: 'Direct API call successful with API key',
              data: {
                reviews: reviewsData,
                totalReviews: reviewsData?.reviews?.length || 0
              },
              source: 'Direct API call with API key',
              method: 'API Key'
            });
          } else {
            console.log('API key method failed:', reviewsResponse.status, reviewsResponse.statusText);
          }
        }
        
        if (serviceAccountEmail && privateKey) {
          // Method 2: Try with service account credentials
          console.log('Attempting direct API call with service account...');
          
          // Create JWT token for service account
          const jwt = require('jsonwebtoken');
          const now = Math.floor(Date.now() / 1000);
          
          const payload = {
            iss: serviceAccountEmail,
            scope: 'https://www.googleapis.com/auth/business.manage',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now
          };
          
          const token = jwt.sign(payload, privateKey.replace(/\\n/g, '\n'), { algorithm: 'RS256' });
          
          // Exchange JWT for access token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
              assertion: token
            })
          });
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            
            // Use access token to fetch reviews
            const reviewsResponse = await fetch(`${reviewsEndpoint}?pageSize=50&orderBy=updateTime desc`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
              }
            });
            
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json();
              return NextResponse.json({
                success: true,
                businessProfileId: accountId,
                storeId: locationId,
                message: 'Direct API call successful with service account',
                data: {
                  reviews: reviewsData,
                  totalReviews: reviewsData?.reviews?.length || 0
                },
                source: 'Direct API call with service account',
                method: 'Service Account'
              });
            } else {
              console.log('Service account method failed:', reviewsResponse.status, reviewsResponse.statusText);
            }
          }
        }
        
        // If direct methods fail, return information about what was tried
        return NextResponse.json({
          success: false,
          businessProfileId: accountId,
          storeId: locationId,
          error: 'Direct API call failed',
          message: 'Direct API call methods attempted but failed. You may need to:',
          attemptedMethods: [
            apiKey ? 'API Key method (failed)' : 'API Key method (not configured)',
            serviceAccountEmail && privateKey ? 'Service Account method (failed)' : 'Service Account method (not configured)'
          ],
          apis: {
            location: {
              endpoint: locationEndpoint,
              method: 'GET',
              description: 'Get location details using Business Information API v1',
              scope: 'https://www.googleapis.com/auth/business.manage'
            },
            reviews: {
              endpoint: reviewsEndpoint,
              method: 'GET',
              description: 'Get reviews using Google Business Profile API v4.9',
              scope: 'https://www.googleapis.com/auth/business.manage'
            }
          },
          nextSteps: [
            'Check if Google Business Profile API v4.9 is enabled in Google Cloud Console',
            'Verify the Business Profile ID and Store ID are correct',
            'Ensure proper authentication credentials are configured',
            'Try the OAuth flow in the Google Live tab first'
          ]
        });
        
      } catch (directError: any) {
        console.error('Direct API call error:', directError);
        return NextResponse.json({
          success: false,
          businessProfileId: accountId,
          storeId: locationId,
          error: 'Direct API call failed',
          details: directError.message || 'Unknown error during direct API call',
          apis: {
            location: {
              endpoint: locationEndpoint,
              method: 'GET',
              description: 'Get location details using Business Information API v1',
              scope: 'https://www.googleapis.com/auth/business.manage'
            },
            reviews: {
              endpoint: reviewsEndpoint,
              method: 'GET',
              description: 'Get reviews using Google Business Profile API v4.9',
              scope: 'https://www.googleapis.com/auth/business.manage'
            }
          }
        });
      }
    }
    
    // Check if we have OAuth tokens available
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    
    if (!refreshToken && !accessToken) {
      return NextResponse.json({
        success: false,
        businessProfileId: accountId,
        storeId: locationId,
        error: 'Authentication required',
        message: 'No OAuth tokens found. Please authenticate with Google Business Profile first.',
        apis: {
          location: {
            endpoint: locationEndpoint,
            method: 'GET',
            description: 'Get location details using Business Information API v1',
            scope: 'https://www.googleapis.com/auth/business.manage',
            documentation: 'https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations/get'
          },
          reviews: {
            endpoint: reviewsEndpoint,
            method: 'GET',
            description: 'Get reviews using Google Business Profile API v4.9',
            scope: 'https://www.googleapis.com/auth/business.manage',
            documentation: 'https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list'
          }
        },
        nextSteps: [
          'Go to the Google Live tab and authenticate with Google Business Profile',
          'Enable required APIs in Google Cloud Console',
          'Use the authenticated session to fetch real data',
          'Or try adding ?direct=true to the URL for direct API call'
        ]
      });
    }

    // Try to fetch real data using the authenticated session
    try {
      let token = accessToken;
      
      // If no access token, try to refresh
      if (!token && refreshToken) {
        // In a real implementation, you would refresh the token here
        // For now, we'll use the refresh token directly
        token = refreshToken;
      }

      // Fetch location details
      const locationResponse = await fetch(`${locationEndpoint}?readMask=name,title,storeCode,websiteUri,regularHours`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Fetch reviews
      const reviewsResponse = await fetch(`${reviewsEndpoint}?pageSize=50&orderBy=updateTime desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      let locationData = null;
      let reviewsData = null;
      let locationError = null;
      let reviewsError = null;

      if (locationResponse.ok) {
        locationData = await locationResponse.json();
      } else {
        locationError = `Location API error: ${locationResponse.status} - ${locationResponse.statusText}`;
      }

      if (reviewsResponse.ok) {
        reviewsData = await reviewsResponse.json();
      } else {
        reviewsError = `Reviews API error: ${reviewsResponse.status} - ${reviewsResponse.statusText}`;
      }

      return NextResponse.json({
        success: true,
        businessProfileId: accountId,
        storeId: locationId,
        message: 'Real-time data from Google Business Profile APIs',
        data: {
          location: locationData,
          reviews: reviewsData,
          totalReviews: reviewsData?.reviews?.length || 0
        },
        errors: {
          location: locationError,
          reviews: reviewsError
        },
        apis: {
          location: {
            endpoint: locationEndpoint,
            status: locationResponse.status,
            ok: locationResponse.ok
          },
          reviews: {
            endpoint: reviewsEndpoint,
            status: reviewsResponse.status,
            ok: reviewsResponse.ok
          }
        },
        source: 'Google Business Profile API v4.9 + Business Information API v1'
      });

    } catch (apiError: any) {
      console.error('API call error:', apiError);
      
      return NextResponse.json({
        success: false,
        businessProfileId: accountId,
        storeId: locationId,
        error: 'API call failed',
        details: apiError.message || 'Unknown API error',
        apis: {
          location: {
            endpoint: locationEndpoint,
            method: 'GET',
            description: 'Get location details using Business Information API v1',
            scope: 'https://www.googleapis.com/auth/business.manage'
          },
          reviews: {
            endpoint: reviewsEndpoint,
            method: 'GET',
            description: 'Get reviews using Google Business Profile API v4.9',
            scope: 'https://www.googleapis.com/auth/business.manage'
          }
        },
        troubleshooting: [
          'Verify the Business Profile ID and Store ID are correct',
          'Check if the APIs are enabled in Google Cloud Console',
          'Ensure the OAuth scope includes business.manage',
          'Verify the location exists and is accessible',
          'Try adding ?direct=true to the URL for direct API call'
        ]
      });
    }

  } catch (error) {
    console.error('Error in store-reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing request' }, 
      { status: 500 }
    );
  }
}
