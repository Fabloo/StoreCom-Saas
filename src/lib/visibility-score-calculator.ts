// Local Visibility Score Calculator
// This calculates a comprehensive score (0-100) for business local visibility

export interface GMBMetrics {
  profileCompletion: number; // 0-100
  postsLast30Days: number; // Target: 4+
  photosCount: number; // Target: 10+
  questionsAnswered: number; // Target: 10+
  impressionsLast30Days: number;
  ctr: number; // Click-through rate percentage
}

export interface ReviewMetrics {
  averageRating: number; // 0-5
  totalReviews: number;
  newReviewsLast30Days: number; // Target: 50+
  responseRate: number; // 0-100
  responseTime: number; // Average response time in hours
}

export interface LocalSEOMetrics {
  hasTitle: boolean;
  hasDescription: boolean;
  hasH1: boolean;
  hasSchema: boolean;
  imageAltTagsCoverage: number; // 0-100
  localKeywords: string[];
  localKeywordRankings: { keyword: string; rank: number }[];
}

export interface EngagementMetrics {
  websiteClicks: number;
  phoneCalls: number;
  directionRequests: number;
  formSubmissions: number;
}

export interface VisibilityScoreInput {
  gmb: GMBMetrics;
  reviews: ReviewMetrics;
  localSEO: LocalSEOMetrics;
  engagement: EngagementMetrics;
}

export interface VisibilityScoreBreakdown {
  totalScore: number;
  gmbScore: number;
  reviewScore: number;
  seoScore: number;
  engagementScore: number;
  breakdown: {
    gmb: { score: number; details: string[] };
    reviews: { score: number; details: string[] };
    seo: { score: number; details: string[] };
    engagement: { score: number; details: string[] };
  };
  recommendations: string[];
}

export class LocalVisibilityScoreCalculator {
  
  /**
   * Calculate the overall Local Visibility Score
   */
  static calculateScore(input: VisibilityScoreInput): VisibilityScoreBreakdown {
    
    // 1. GMB Profile Strength (40% weight)
    const gmbScore = this.calculateGMBScore(input.gmb);
    
    // 2. Review Performance (30% weight)
    const reviewScore = this.calculateReviewScore(input.reviews);
    
    // 3. Local SEO Health (20% weight)
    const seoScore = this.calculateLocalSEOScore(input.localSEO);
    
    // 4. Engagement Metrics (10% weight)
    const engagementScore = this.calculateEngagementScore(input.engagement);
    
    // Calculate weighted total score
    const totalScore = Math.round(
      (gmbScore * 0.4) + 
      (reviewScore * 0.3) + 
      (seoScore * 0.2) + 
      (engagementScore * 0.1)
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      gmb: input.gmb,
      reviews: input.reviews,
      localSEO: input.localSEO,
      engagement: input.engagement
    });
    
    return {
      totalScore,
      gmbScore,
      reviewScore,
      seoScore,
      engagementScore,
      breakdown: {
        gmb: { score: gmbScore, details: this.getGMBDetails(input.gmb) },
        reviews: { score: reviewScore, details: this.getReviewDetails(input.reviews) },
        seo: { score: seoScore, details: this.getSEODetails(input.localSEO) },
        engagement: { score: engagementScore, details: this.getEngagementDetails(input.engagement) }
      },
      recommendations
    };
  }
  
  /**
   * Calculate GMB Profile Strength Score (0-100)
   */
  private static calculateGMBScore(gmb: GMBMetrics): number {
    let score = 0;
    
    // Profile completion (30 points)
    score += (gmb.profileCompletion * 0.3);
    
    // Posts in last 30 days (25 points)
    const postScore = Math.min(gmb.postsLast30Days / 4, 1) * 25;
    score += postScore;
    
    // Photos count (25 points)
    const photoScore = Math.min(gmb.photosCount / 10, 1) * 25;
    score += photoScore;
    
    // Questions answered (20 points)
    const qaScore = Math.min(gmb.questionsAnswered / 10, 1) * 20;
    score += qaScore;
    
    return Math.round(score);
  }
  
  /**
   * Calculate Review Performance Score (0-100)
   */
  private static calculateReviewScore(reviews: ReviewMetrics): number {
    let score = 0;
    
    // Average rating (40 points)
    const ratingScore = (reviews.averageRating / 5) * 40;
    score += ratingScore;
    
    // Review volume (25 points)
    const volumeScore = Math.min(reviews.totalReviews / 500, 1) * 25;
    score += volumeScore;
    
    // Recent reviews (20 points)
    const recencyScore = Math.min(reviews.newReviewsLast30Days / 50, 1) * 20;
    score += recencyScore;
    
    // Response rate (15 points)
    score += (reviews.responseRate * 0.15);
    
    return Math.round(score);
  }
  
  /**
   * Calculate Local SEO Health Score (0-100)
   */
  private static calculateLocalSEOScore(seo: LocalSEOMetrics): number {
    let score = 0;
    
    // Basic SEO elements (40 points)
    const basicElements = [seo.hasTitle, seo.hasDescription, seo.hasH1, seo.hasSchema];
    const basicScore = (basicElements.filter(Boolean).length / basicElements.length) * 40;
    score += basicScore;
    
    // Image optimization (30 points)
    score += (seo.imageAltTagsCoverage * 0.3);
    
    // Local keyword performance (30 points)
    if (seo.localKeywordRankings.length > 0) {
      const avgRank = seo.localKeywordRankings.reduce((sum, kw) => sum + kw.rank, 0) / seo.localKeywordRankings.length;
      // Lower rank is better, so invert the score
      const keywordScore = Math.max(0, (10 - avgRank) / 9) * 30;
      score += keywordScore;
    }
    
    return Math.round(score);
  }
  
  /**
   * Calculate Engagement Metrics Score (0-100)
   */
  private static calculateEngagementScore(engagement: EngagementMetrics): number {
    let score = 0;
    
    // Website clicks (40 points)
    const clickScore = Math.min(engagement.websiteClicks / 1000, 1) * 40;
    score += clickScore;
    
    // Phone calls (30 points)
    const callScore = Math.min(engagement.phoneCalls / 500, 1) * 30;
    score += callScore;
    
    // Direction requests (20 points)
    const directionScore = Math.min(engagement.directionRequests / 200, 1) * 20;
    score += directionScore;
    
    // Form submissions (10 points)
    const formScore = Math.min(engagement.formSubmissions / 100, 1) * 10;
    score += formScore;
    
    return Math.round(score);
  }
  
  /**
   * Get detailed breakdown for GMB
   */
  private static getGMBDetails(gmb: GMBMetrics): string[] {
    const details: string[] = [];
    
    if (gmb.profileCompletion < 100) {
      details.push(`Complete your GMB profile (currently ${gmb.profileCompletion}%)`);
    }
    
    if (gmb.postsLast30Days < 4) {
      details.push(`Post more frequently (${gmb.postsLast30Days}/4 posts this month)`);
    }
    
    if (gmb.photosCount < 10) {
      details.push(`Add more photos (${gmb.photosCount}/10 minimum)`);
    }
    
    if (gmb.questionsAnswered < 10) {
      details.push(`Answer more customer questions (${gmb.questionsAnswered}/10)`);
    }
    
    return details;
  }
  
  /**
   * Get detailed breakdown for reviews
   */
  private static getReviewDetails(reviews: ReviewMetrics): string[] {
    const details: string[] = [];
    
    if (reviews.averageRating < 4.0) {
      details.push(`Improve customer satisfaction (current rating: ${reviews.averageRating.toFixed(1)})`);
    }
    
    if (reviews.totalReviews < 100) {
      details.push(`Encourage more reviews (${reviews.totalReviews}/100 minimum)`);
    }
    
    if (reviews.responseRate < 90) {
      details.push(`Respond to more reviews (${reviews.responseRate}% response rate)`);
    }
    
    if (reviews.newReviewsLast30Days < 10) {
      details.push(`Generate more recent reviews (${reviews.newReviewsLast30Days} this month)`);
    }
    
    return details;
  }
  
  /**
   * Get detailed breakdown for SEO
   */
  private static getSEODetails(seo: LocalSEOMetrics): string[] {
    const details: string[] = [];
    
    if (!seo.hasTitle) details.push('Add a compelling page title');
    if (!seo.hasDescription) details.push('Add a meta description');
    if (!seo.hasH1) details.push('Include an H1 heading');
    if (!seo.hasSchema) details.push('Add structured data markup');
    
    if (seo.imageAltTagsCoverage < 90) {
      details.push(`Optimize image alt tags (${seo.imageAltTagsCoverage}% coverage)`);
    }
    
    if (seo.localKeywordRankings.length > 0) {
      const poorRankings = seo.localKeywordRankings.filter(kw => kw.rank > 5);
      if (poorRankings.length > 0) {
        details.push(`Improve rankings for: ${poorRankings.slice(0, 3).map(kw => kw.keyword).join(', ')}`);
      }
    }
    
    return details;
  }
  
  /**
   * Get detailed breakdown for engagement
   */
  private static getEngagementDetails(engagement: EngagementMetrics): string[] {
    const details: string[] = [];
    
    if (engagement.websiteClicks < 500) {
      details.push('Increase website clicks from GMB');
    }
    
    if (engagement.phoneCalls < 200) {
      details.push('Generate more phone call leads');
    }
    
    if (engagement.directionRequests < 100) {
      details.push('Encourage more direction requests');
    }
    
    if (engagement.formSubmissions < 50) {
      details.push('Improve form submission conversion');
    }
    
    return details;
  }
  
  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(input: {
    gmb: GMBMetrics;
    reviews: ReviewMetrics;
    localSEO: LocalSEOMetrics;
    engagement: EngagementMetrics;
  }): string[] {
    const recommendations: string[] = [];
    
    // GMB recommendations
    if (input.gmb.profileCompletion < 100) {
      recommendations.push('Complete your Google My Business profile to improve local visibility');
    }
    
    if (input.gmb.postsLast30Days < 4) {
      recommendations.push('Post at least 4 times per month to keep your GMB profile active');
    }
    
    // Review recommendations
    if (input.reviews.responseRate < 90) {
      recommendations.push('Respond to customer reviews within 24 hours to improve engagement');
    }
    
    if (input.reviews.averageRating < 4.0) {
      recommendations.push('Focus on improving customer experience to boost ratings');
    }
    
    // SEO recommendations
    if (!input.localSEO.hasSchema) {
      recommendations.push('Add structured data markup to help search engines understand your business');
    }
    
    if (input.localSEO.imageAltTagsCoverage < 90) {
      recommendations.push('Optimize image alt tags for better local SEO performance');
    }
    // Engagement recommendations
    if (input.engagement.websiteClicks / input.gmb.impressionsLast30Days * 100 < 3.0) {
      recommendations.push('Improve your GMB profile to increase click-through rates');
    }
    
    return recommendations.slice(0, 5); // Top 5 recommendations
  }
}

// Sample data for testing
export const sampleVisibilityData: VisibilityScoreInput = {
  gmb: {
    profileCompletion: 85,
    postsLast30Days: 3,
    photosCount: 15,
    questionsAnswered: 8,
    impressionsLast30Days: 143000,
    ctr: 3.6
  },
  reviews: {
    averageRating: 4.25,
    totalReviews: 4,
    newReviewsLast30Days: 15,
    responseRate: 90,
    responseTime: 4
  },
  localSEO: {
    hasTitle: true,
    hasDescription: true,
    hasH1: true,
    hasSchema: true,
    imageAltTagsCoverage: 95,
    localKeywords: ['colive pg bangalore', 'student accommodation bangalore', 'pg near tech park'],
    localKeywordRankings: [
      { keyword: 'colive pg bangalore', rank: 2 },
      { keyword: 'student accommodation bangalore', rank: 4 },
      { keyword: 'pg near tech park', rank: 7 }
    ]
  },
  engagement: {
    websiteClicks: 2345,
    phoneCalls: 892,
    directionRequests: 156,
    formSubmissions: 189
  }
}; 