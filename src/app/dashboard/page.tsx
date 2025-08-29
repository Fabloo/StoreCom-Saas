

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  MessageSquare,
  Eye,
  MousePointerClick,
  Phone,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  PhoneIncoming,
  PhoneOff,
  ExternalLink,
  FileText,
  Ticket,
  CheckCircle,
  XCircle
} from "lucide-react";
import { sampleBrand, sampleDashboardMetrics, sampleReviews } from "@/lib/mock-data";
import { LocalVisibilityScoreCalculator, sampleVisibilityData } from "@/lib/visibility-score-calculator";
import { SentimentAnalyzer, sampleReviewData, TimelinePeriod } from "@/lib/sentiment-analyzer";

interface DashboardMetrics {
  totalStores: number;
  totalReviews: number;
  averageRating: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topPerformingStore: string;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
    storeName: string;
  }>;
  // New metrics from the reference image
  localVisibilityScore: number;
  gmbImpressions: number;
  ctrGmbToMicrosite: number;
  phoneCalls: {
    total: number;
    answered: number;
    missed: number;
  };
  websiteClicks: number;
  formSubmissions: number;
  offerClicks: number;
  topKeywords: string[];
}

export default function DashboardPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('colive-brand-001');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentimentPeriod, setSentimentPeriod] = useState<TimelinePeriod>(6);

  // Calculate real visibility score
  const visibilityScore = LocalVisibilityScoreCalculator.calculateScore(sampleVisibilityData);
  
  // Calculate sentiment trends with selected period
  const sentimentTrends = SentimentAnalyzer.analyzeSentimentTrends(sampleReviewData, sentimentPeriod);
  const chartData = SentimentAnalyzer.getChartData(sentimentTrends.monthlyData);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ...sampleDashboardMetrics,
    // Enhanced metrics based on the reference image
    localVisibilityScore: visibilityScore.totalScore, // Now using real calculated score
    gmbImpressions: 143000,
    ctrGmbToMicrosite: 3.6,
    phoneCalls: {
      total: 892,
      answered: 780,
      missed: 112
    },
    websiteClicks: 2345,
    formSubmissions: 189,
    offerClicks: 45,
    topKeywords: ['cake shop near me', 'anand sweets bangalore', 'colive pg bangalore', 'student accommodation']
  });
  const [reviews, setReviews] = useState(sampleReviews);
  const [brands] = useState([sampleBrand]);

  // Filter reviews based on search query
  const filteredReviews = reviews.filter(review =>
    review.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate additional metrics
  const totalLocations = brands.reduce((acc, brand) => acc + brand.stores.length, 0);
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Visibility Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.localVisibilityScore}/100</div>
            <p className="text-xs text-green-600">+1.2% from last month</p>
            <div className="mt-2 text-xs text-muted-foreground">
              GMB: {visibilityScore.breakdown.gmb.score} | Reviews: {visibilityScore.breakdown.reviews.score} | SEO: {visibilityScore.breakdown.seo.score}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating (All Stores)</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">{averageRating.toFixed(1)} <Star className="h-5 w-5 ml-1 text-yellow-400 fill-yellow-400" /></div>
            <p className="text-xs text-green-600">+0.1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews This Month</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReviews}</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR (GMB → Microsite)</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ctrGmbToMicrosite}%</div>
            <p className="text-xs text-green-600">+0.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GMB Impressions (30d)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.gmbImpressions)}</div>
            <p className="text-xs text-red-600">-5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Keywords Tracked</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {metrics.topKeywords.slice(0, 2).map((keyword, index) => (
                <Badge key={index} variant="secondary">{keyword}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Local Visibility Score Breakdown</CardTitle>
          <CardDescription>Detailed analysis of your local visibility performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Component Scores</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Google My Business (40%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${visibilityScore.breakdown.gmb.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{visibilityScore.breakdown.gmb.score}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Review Performance (30%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${visibilityScore.breakdown.reviews.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{visibilityScore.breakdown.reviews.score}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Local SEO (20%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${visibilityScore.breakdown.seo.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{visibilityScore.breakdown.seo.score}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Engagement (10%)</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${visibilityScore.breakdown.engagement.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{visibilityScore.breakdown.engagement.score}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Top Recommendations</h4>
              <div className="space-y-2">
                {visibilityScore.recommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Metrics Section */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Conversion Metrics (30d)</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.phoneCalls.total}</div>
              <p className="text-xs text-green-600">+15% from last month</p>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500"/>
                  <span>Answered</span>
                </div>
                <span>{metrics.phoneCalls.answered}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500"/>
                  <span>Missed</span>
                </div>
                <span>{metrics.phoneCalls.missed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" /> Website Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.websiteClicks)}</div>
              <p className="text-xs text-green-600">+8.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Form Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.formSubmissions}</div>
              <p className="text-xs text-green-600">+22% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Offer Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.offerClicks}</div>
              <p className="text-xs text-muted-foreground">New offer launched</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              Across {brands.length} brand{brands.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReviews}</div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-muted-foreground">{averageRating.toFixed(1)} avg rating</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center gap-1 text-sm">
              {getGrowthIcon(metrics.monthlyGrowth)}
              <span className={getGrowthColor(metrics.monthlyGrowth)}>
                {Math.abs(metrics.monthlyGrowth)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              {brands.filter(b => b.status === 'active').length} active brands
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Review Sentiment Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review Sentiment Trends</CardTitle>
              <CardDescription>
                Positive vs. negative review sentiment over the selected time period.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sentiment-period" className="text-sm font-medium">
                Timeline:
              </Label>
              <Select value={sentimentPeriod.toString()} onValueChange={(value) => setSentimentPeriod(parseInt(value) as TimelinePeriod)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SentimentAnalyzer.getTimelineOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sentiment Chart */}
            <div className="h-80 w-full">
              <div className="relative h-full w-full">
                {/* Chart Container */}
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                  {chartData.map((month, index) => {
                    const totalHeight = 100; // 100% height
                    const positiveHeight = month.positive;
                    const negativeHeight = month.negative;
                    const neutralHeight = month.neutral;
                    
                    return (
                      <div key={month.month} className="flex flex-col items-center">
                        {/* Month Label */}
                        <div className="text-xs text-muted-foreground mb-2">
                          {month.month}
                        </div>
                        
                        {/* Sentiment Bars */}
                        <div className="relative w-16 h-64 flex flex-col-reverse">
                          {/* Positive Sentiment (Blue) */}
                          <div 
                            className="bg-blue-500 rounded-t-sm"
                            style={{ 
                              height: `${(positiveHeight / 100) * 240}px`,
                              minHeight: '4px'
                            }}
                            title={`${month.positive}% positive`}
                          />
                          
                          {/* Neutral Sentiment (Gray) */}
                          <div 
                            className="bg-gray-300"
                            style={{ 
                              height: `${(neutralHeight / 100) * 240}px`,
                              minHeight: '4px'
                            }}
                            title={`${month.neutral}% neutral`}
                          />
                          
                          {/* Negative Sentiment (Red) */}
                          <div 
                            className="bg-red-500 rounded-b-sm"
                            style={{ 
                              height: `${(negativeHeight / 100) * 240}px`,
                              minHeight: '4px'
                            }}
                            title={`${month.negative}% negative`}
                          />
                        </div>
                        
                        {/* Review Count */}
                        <div className="text-xs text-muted-foreground mt-2 text-center">
                          {month.total} reviews
                        </div>
                        
                        {/* Average Rating */}
                        <div className="text-xs font-medium mt-1 text-center">
                          ⭐ {month.averageRating}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4 text-xs text-muted-foreground">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
              </div>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Negative</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Insights</CardTitle>
            <CardDescription>Key findings from sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentimentTrends.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Recommendations</CardTitle>
            <CardDescription>Actionable steps to improve sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentimentTrends.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of customer ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(ratingDistribution).reverse().map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(count / reviews.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Store</CardTitle>
            <CardDescription>Store with highest rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.topPerformingStore}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">4.8</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.filter(r => r.storeName === metrics.topPerformingStore).length} reviews
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your stores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.storeName}</span>
                      <span>•</span>
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add New Store
              </Button>
              <Button variant="outline" className="justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                View All Reviews
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest customer feedback and ratings</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="font-medium">{review.storeName}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.reviewerName}</div>
                      <div className="text-sm text-muted-foreground">{review.reviewerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{review.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {review.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
