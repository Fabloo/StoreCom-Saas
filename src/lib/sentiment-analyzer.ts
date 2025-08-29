// Review Sentiment Analysis System
// Analyzes review content and calculates sentiment trends over flexible time periods

export interface ReviewData {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  storeName: string;
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  overall: number; // -1 to 1 scale
}

export interface MonthlySentiment {
  month: string;
  positive: number;
  negative: number;
  neutral: number;
  totalReviews: number;
  averageRating: number;
}

export interface SentimentTrends {
  monthlyData: MonthlySentiment[];
  overallTrend: 'improving' | 'declining' | 'stable';
  keyInsights: string[];
  recommendations: string[];
  selectedPeriod: number; // Number of months
}

export type TimelinePeriod = 1 | 2 | 3 | 4 | 5 | 6;

export class SentimentAnalyzer {
  
  // Positive and negative word dictionaries for sentiment analysis
  private static positiveWords = [
    'excellent', 'amazing', 'great', 'good', 'wonderful', 'fantastic', 'outstanding',
    'perfect', 'brilliant', 'superb', 'terrific', 'awesome', 'fabulous', 'incredible',
    'love', 'enjoy', 'satisfied', 'happy', 'pleased', 'delighted', 'impressed',
    'clean', 'comfortable', 'convenient', 'affordable', 'friendly', 'helpful',
    'professional', 'efficient', 'reliable', 'trustworthy', 'quality', 'value',
    'recommend', 'best', 'top', 'exceeded', 'surpassed', 'wow', 'stunning'
  ];

  private static negativeWords = [
    'terrible', 'awful', 'horrible', 'bad', 'poor', 'disappointing', 'frustrating',
    'annoying', 'upset', 'angry', 'disgusted', 'hate', 'worst', 'useless',
    'dirty', 'uncomfortable', 'expensive', 'rude', 'unhelpful', 'unprofessional',
    'slow', 'unreliable', 'untrustworthy', 'cheap', 'broken', 'damaged',
    'noisy', 'crowded', 'messy', 'smelly', 'cold', 'hot', 'difficult',
    'complicated', 'confusing', 'waste', 'regret', 'avoid', 'never'
  ];

  private static neutralWords = [
    'okay', 'fine', 'average', 'decent', 'acceptable', 'reasonable', 'standard',
    'normal', 'usual', 'typical', 'moderate', 'adequate', 'sufficient'
  ];

  /**
   * Analyze sentiment of a single review
   */
  static analyzeReviewSentiment(review: ReviewData): SentimentScore {
    const content = review.content.toLowerCase();
    const words = content.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    // Count sentiment words
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.positiveWords.includes(cleanWord)) {
        positiveCount++;
      } else if (this.negativeWords.includes(cleanWord)) {
        negativeCount++;
      } else if (this.neutralWords.includes(cleanWord)) {
        neutralCount++;
      }
    });
    
    // Calculate sentiment based on rating and word analysis
    const ratingSentiment = (review.rating - 3) / 2; // Convert 1-5 to -1 to 1 scale
    const wordSentiment = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
    
    // Weight: 70% rating, 30% word analysis
    const overallSentiment = (ratingSentiment * 0.7) + (wordSentiment * 0.3);
    
    // Convert to positive/negative/neutral percentages
    const total = positiveCount + negativeCount + neutralCount;
    const positive = total > 0 ? (positiveCount / total) * 100 : 0;
    const negative = total > 0 ? (negativeCount / total) * 100 : 0;
    const neutral = total > 0 ? (neutralCount / total) * 100 : 100;
    
    return {
      positive: Math.round(positive),
      negative: Math.round(negative),
      neutral: Math.round(neutral),
      overall: Math.max(-1, Math.min(1, overallSentiment))
    };
  }

  /**
   * Analyze sentiment trends over flexible time periods
   */
  static analyzeSentimentTrends(reviews: ReviewData[], period: TimelinePeriod = 6): SentimentTrends {
    // Filter reviews to selected period
    const filteredReviews = this.filterReviewsByPeriod(reviews, period);
    
    // Group reviews by month
    const monthlyGroups = this.groupReviewsByMonth(filteredReviews);
    
    // Calculate monthly sentiment data
    const monthlyData: MonthlySentiment[] = monthlyGroups.map(group => {
      const monthSentiments = group.reviews.map(review => this.analyzeReviewSentiment(review));
      
      const totalPositive = monthSentiments.reduce((sum, s) => sum + s.positive, 0);
      const totalNegative = monthSentiments.reduce((sum, s) => sum + s.negative, 0);
      const totalNeutral = monthSentiments.reduce((sum, s) => sum + s.neutral, 0);
      const totalReviews = group.reviews.length;
      
      const averageRating = group.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      
      return {
        month: group.month,
        positive: Math.round(totalPositive / totalReviews),
        negative: Math.round(totalNegative / totalReviews),
        neutral: Math.round(totalNeutral / totalReviews),
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10
      };
    });

    // Determine overall trend
    const overallTrend = this.determineOverallTrend(monthlyData);
    
    // Generate insights and recommendations
    const keyInsights = this.generateKeyInsights(monthlyData, period);
    const recommendations = this.generateRecommendations(monthlyData, overallTrend, period);

    return {
      monthlyData,
      overallTrend,
      keyInsights,
      recommendations,
      selectedPeriod: period
    };
  }

  /**
   * Filter reviews by selected time period
   */
  private static filterReviewsByPeriod(reviews: ReviewData[], period: TimelinePeriod): ReviewData[] {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - period);
    
    return reviews.filter(review => review.createdAt >= cutoffDate);
  }

  /**
   * Group reviews by month
   */
  private static groupReviewsByMonth(reviews: ReviewData[]): Array<{ month: string; reviews: ReviewData[] }> {
    const groups: { [key: string]: ReviewData[] } = {};
    
    reviews.forEach(review => {
      const date = new Date(review.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(review);
    });

    // Sort by month and convert to array
    return Object.keys(groups)
      .sort()
      .map(monthKey => ({
        month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        reviews: groups[monthKey]
      }));
  }

  /**
   * Determine overall sentiment trend
   */
  private static determineOverallTrend(monthlyData: MonthlySentiment[]): 'improving' | 'declining' | 'stable' {
    if (monthlyData.length < 2) return 'stable';
    
    const firstHalf = monthlyData.slice(0, Math.ceil(monthlyData.length / 2));
    const secondHalf = monthlyData.slice(Math.ceil(monthlyData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.positive - m.negative, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.positive - m.negative, 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }

  /**
   * Generate key insights from sentiment data
   */
  private static generateKeyInsights(monthlyData: MonthlySentiment[], period: TimelinePeriod): string[] {
    const insights: string[] = [];
    
    if (monthlyData.length === 0) return insights;
    
    // Period-specific insights
    if (period === 1) {
      insights.push(`Analyzing sentiment for the last ${period} month`);
    } else {
      insights.push(`Analyzing sentiment trends over the last ${period} months`);
    }
    
    // Find best and worst months
    const bestMonth = monthlyData.reduce((best, current) => 
      (current.positive - current.negative) > (best.positive - best.negative) ? current : best
    );
    
    const worstMonth = monthlyData.reduce((worst, current) => 
      (current.positive - current.negative) < (worst.positive - worst.negative) ? current : worst
    );
    
    insights.push(`Best sentiment month: ${bestMonth.month} (${bestMonth.positive}% positive)`);
    insights.push(`Challenging month: ${worstMonth.month} (${worstMonth.negative}% negative)`);
    
    // Overall positive sentiment
    const overallPositive = monthlyData.reduce((sum, m) => sum + m.positive, 0) / monthlyData.length;
    if (overallPositive > 70) {
      insights.push(`Strong positive sentiment maintained (${Math.round(overallPositive)}% average)`);
    } else if (overallPositive < 50) {
      insights.push(`Need to improve positive sentiment (${Math.round(overallPositive)}% average)`);
    }
    
    // Trend analysis
    const recentMonths = monthlyData.slice(-3);
    if (recentMonths.length >= 2) {
      const recentTrend = recentMonths[recentMonths.length - 1].positive - recentMonths[0].positive;
      if (recentTrend > 10) {
        insights.push('Recent improvement in sentiment trends');
      } else if (recentTrend < -10) {
        insights.push('Recent decline in sentiment - immediate attention needed');
      }
    }
    
    return insights;
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(monthlyData: MonthlySentiment[], trend: string, period: TimelinePeriod): string[] {
    const recommendations: string[] = [];
    
    if (monthlyData.length === 0) return recommendations;
    
    const latestMonth = monthlyData[monthlyData.length - 1];
    
    // Period-specific recommendations
    if (period === 1) {
      recommendations.push('Monitor daily sentiment changes for immediate response opportunities');
    } else if (period <= 3) {
      recommendations.push('Focus on short-term sentiment improvements and quick wins');
    } else {
      recommendations.push('Implement long-term strategies for sustained sentiment improvement');
    }
    
    // Based on current sentiment
    if (latestMonth.negative > 30) {
      recommendations.push('Address negative feedback immediately to prevent sentiment decline');
    }
    
    if (latestMonth.positive < 60) {
      recommendations.push('Implement strategies to boost positive customer experiences');
    }
    
    // Based on trend
    if (trend === 'declining') {
      recommendations.push('Review recent changes that may have impacted customer satisfaction');
      recommendations.push('Increase proactive customer outreach and feedback collection');
    } else if (trend === 'improving') {
      recommendations.push('Maintain current positive practices and customer service standards');
    }
    
    // Based on review volume
    if (latestMonth.totalReviews < 10) {
      recommendations.push('Encourage more customer reviews to get better sentiment insights');
    }
    
    // General recommendations
    recommendations.push('Respond to all reviews within 24 hours to show customer care');
    recommendations.push('Use negative feedback to identify and fix operational issues');
    
    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get sentiment distribution for chart display
   */
  static getChartData(monthlyData: MonthlySentiment[]) {
    return monthlyData.map(month => ({
      month: month.month,
      positive: month.positive,
      negative: month.negative,
      neutral: month.neutral,
      total: month.totalReviews,
      averageRating: month.averageRating
    }));
  }

  /**
   * Get available timeline periods
   */
  static getTimelineOptions(): Array<{ value: TimelinePeriod; label: string }> {
    return [
      { value: 1, label: '1 Month' },
      { value: 2, label: '2 Months' },
      { value: 3, label: '3 Months' },
      { value: 4, label: '4 Months' },
      { value: 5, label: '5 Months' },
      { value: 6, label: '6 Months' }
    ];
  }
}

// Sample data for testing
export const sampleReviewData: ReviewData[] = [
  {
    id: '1',
    content: 'Excellent accommodation! Clean rooms, great food, and friendly staff. Highly recommend!',
    rating: 5,
    createdAt: new Date('2024-01-15'),
    storeName: 'Colive 918 Cape Town'
  },
  {
    id: '2',
    content: 'Good place but could be better. Rooms are clean and food is decent. Some amenities could be improved.',
    rating: 4,
    createdAt: new Date('2024-01-20'),
    storeName: 'Colive 918 Cape Town'
  },
  {
    id: '3',
    content: 'Amazing place! Great location near tech parks, modern amenities, and very professional staff.',
    rating: 5,
    createdAt: new Date('2024-02-10'),
    storeName: 'Colive 1180 Columbus'
  },
  {
    id: '4',
    content: 'The place is okay but the food quality has gone down recently. Staff is helpful though.',
    rating: 3,
    createdAt: new Date('2024-02-15'),
    storeName: 'Colive 1180 Columbus'
  },
  {
    id: '5',
    content: 'Terrible experience! Dirty rooms and unprofessional staff. Would not recommend.',
    rating: 2,
    createdAt: new Date('2024-03-05'),
    storeName: 'Colive 918 Cape Town'
  },
  {
    id: '6',
    content: 'Wonderful stay! Everything exceeded expectations. Clean, comfortable, and great value.',
    rating: 5,
    createdAt: new Date('2024-03-20'),
    storeName: 'Colive 1180 Columbus'
  },
  {
    id: '7',
    content: 'Average experience. Nothing special but not bad either. Decent for the price.',
    rating: 3,
    createdAt: new Date('2024-04-10'),
    storeName: 'Colive 918 Cape Town'
  },
  {
    id: '8',
    content: 'Fantastic service! The staff went above and beyond to make our stay comfortable.',
    rating: 5,
    createdAt: new Date('2024-04-25'),
    storeName: 'Colive 1180 Columbus'
  },
  {
    id: '9',
    content: 'Great improvement! Much better than before. Clean facilities and friendly atmosphere.',
    rating: 4,
    createdAt: new Date('2024-05-15'),
    storeName: 'Colive 918 Cape Town'
  },
  {
    id: '10',
    content: 'Outstanding experience! Best accommodation we\'ve stayed at. Highly recommend!',
    rating: 5,
    createdAt: new Date('2024-05-30'),
    storeName: 'Colive 1180 Columbus'
  },
  {
    id: '11',
    content: 'Excellent value for money. Clean rooms, good location, and helpful staff.',
    rating: 5,
    createdAt: new Date('2024-06-10'),
    storeName: 'Colive 918 Cape Town'
  },
  {
    id: '12',
    content: 'Superb service and facilities. Couldn\'t ask for more. Will definitely return!',
    rating: 5,
    createdAt: new Date('2024-06-25'),
    storeName: 'Colive 1180 Columbus'
  }
]; 