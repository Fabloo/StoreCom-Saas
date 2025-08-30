import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';
import { googleBusinessAPI } from '@/lib/google-business-api';
import { reviewOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');
    const syncWithGoogle = searchParams.get('sync') === 'true';

    // If sync is requested, locationName is required
    if (syncWithGoogle && !locationName) {
      return NextResponse.json(
        { error: 'Location name is required for syncing reviews' }, 
        { status: 400 }
      );
    }

    // If sync is requested, fetch from Google and save to DB
    if (syncWithGoogle) {
      try {
        // Try OAuth first
        const rawRefresh = request.cookies.get('gbp_refresh_token')?.value;
        const rawAccess = request.cookies.get('gbp_access_token')?.value;
        
        if (rawRefresh || rawAccess) {
          try {
            googleBusinessAPI.setAuthMode('oauth');
            if (rawRefresh) {
              googleBusinessAPI.setRefreshToken(rawRefresh);
            } else if (rawAccess) {
              googleBusinessAPI.setCredentials({ access_token: rawAccess } as any);
            }
            
            const googleReviews = await googleBusinessAPI.getReviews(locationName!);
            await syncReviewsToDatabase(locationName!, googleReviews);
            return NextResponse.json({ 
              success: true, 
              message: 'Reviews synced from Google Business Profile',
              reviews: googleReviews 
            });
          } catch (oauthErr: any) {
            console.log('OAuth failed, falling back to service account');
          }
        }

        // Fallback to service account
        const googleReviews = await googleBusinessServiceAccountAPI.getReviews(locationName!);
        await syncReviewsToDatabase(locationName!, googleReviews);
        return NextResponse.json({ 
          success: true, 
          message: 'Reviews synced from Google Business Profile',
          reviews: googleReviews 
        });
      } catch (error) {
        console.error('Error syncing reviews from Google:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
          { error: 'Failed to sync reviews from Google', details: errorMessage }, 
          { status: 500 }
        );
      }
    }

    // Return reviews from database
    try {
      let dbReviews;
      if (locationName) {
        // Get reviews for specific location
        dbReviews = await reviewOperations.getReviewsByLocation(locationName);
      } else {
        // Get all reviews if no location specified
        dbReviews = await reviewOperations.getAllReviews();
      }
      
      return NextResponse.json({ 
        success: true, 
        reviews: dbReviews,
        source: 'database'
      });
    } catch (error) {
      console.error('Error fetching reviews from database:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews from database' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');
    const body = await request.json();
    const { action, reviewId, replyComment } = body;

    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' }, 
        { status: 400 }
      );
    }

    switch (action) {
      case 'reply':
        if (!reviewId || !replyComment) {
          return NextResponse.json(
            { error: 'Review ID and reply comment are required' }, 
            { status: 400 }
          );
        }
        
        try {
          // Add reply to database
          await reviewOperations.addReviewReply(reviewId, replyComment);
          
          // Try to post reply to Google Business Profile
          try {
            const rawRefresh = request.cookies.get('gbp_refresh_token')?.value;
            const rawAccess = request.cookies.get('gbp_access_token')?.value;
            
            if (rawRefresh || rawAccess) {
              googleBusinessAPI.setAuthMode('oauth');
              if (rawRefresh) {
                googleBusinessAPI.setRefreshToken(rawRefresh);
              } else if (rawAccess) {
                googleBusinessAPI.setCredentials({ access_token: rawAccess } as any);
              }
              
              await googleBusinessAPI.replyToReview(reviewId, replyComment);
            } else {
              await googleBusinessServiceAccountAPI.replyToReview(reviewId, replyComment);
            }
          } catch (googleError) {
            console.warn('Failed to post reply to Google, but saved to database:', googleError);
          }
          
          return NextResponse.json({ 
            success: true, 
            message: 'Reply added successfully' 
          });
        } catch (error) {
          console.error('Error adding reply:', error);
          return NextResponse.json(
            { error: 'Failed to add reply' }, 
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in reviews POST API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

// Helper function to sync reviews from Google to database
async function syncReviewsToDatabase(locationName: string, googleReviews: any[]) {
  try {
    console.log(`Syncing ${googleReviews.length} reviews for location: ${locationName}`);
    
    for (const googleReview of googleReviews) {
      // Check if review already exists
      const existingReview = await reviewOperations.getReviewsByLocation(locationName);
      const reviewExists = existingReview.some(r => r.reviewId === googleReview.name);
      
      if (!reviewExists) {
        // Extract location ID from locationName (e.g., "locations/123" -> "123")
        const locationId = locationName.replace('locations/', '');
        
        // Create review object for database
        const reviewData = {
          locationId,
          locationName,
          reviewId: googleReview.name,
          reviewerName: googleReview.reviewer?.displayName || 'Anonymous',
          rating: googleReview.starRating || 0,
          comment: googleReview.comment || '',
          reviewTime: new Date(googleReview.createTime),
          updateTime: googleReview.updateTime ? new Date(googleReview.updateTime) : undefined,
          reviewReply: googleReview.reviewReply ? {
            comment: googleReview.reviewReply.comment,
            updateTime: new Date(googleReview.reviewReply.updateTime)
          } : undefined,
          sentiment: analyzeSentiment(googleReview.starRating, googleReview.comment),
          keywords: extractKeywords(googleReview.comment),
          source: 'google_business' as const,
          isResolved: false,
          tags: []
        };
        
        await reviewOperations.createReview(reviewData);
        console.log(`Saved review: ${googleReview.name}`);
      }
    }
    
    console.log(`Review sync completed for location: ${locationName}`);
  } catch (error) {
    console.error('Error syncing reviews to database:', error);
    throw error;
  }
}

// Simple sentiment analysis based on rating and comment
function analyzeSentiment(rating: number, comment: string): 'positive' | 'negative' | 'neutral' {
  if (rating >= 4) return 'positive';
  if (rating <= 2) return 'negative';
  return 'neutral';
}

// Extract keywords from comment (simple implementation)
function extractKeywords(comment: string): string[] {
  if (!comment) return [];
  
  // Simple keyword extraction - split by spaces and filter common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
  
  return comment
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5); // Limit to 5 keywords
} 