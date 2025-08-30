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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Star,
  RefreshCw,
  Filter,
  Search,
  Reply,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Download,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  _id?: string;
  locationId: string;
  locationName: string;
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewTime: Date;
  updateTime?: Date;
  reviewReply?: {
    comment: string;
    updateTime: Date;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  source: 'google_business' | 'manual';
  isResolved: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  positiveReviews: number;
  negativeReviews: number;
  neutralReviews: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, selectedLocation, selectedSentiment, searchTerm]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/google-business/reviews');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        // Extract unique locations
        const uniqueLocations = [...new Set(data.reviews.map((r: Review) => r.locationName))];
        setLocations(uniqueLocations.filter(Boolean) as string[]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await fetch('/api/reviews/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    }
  };

  const syncReviewsFromGoogle = async (locationName?: string) => {
    try {
      setIsLoading(true);
      
      if (!locationName) {
        // If no specific location, sync from all available locations
        if (locations.length === 0) {
          toast({
            title: "No Locations Available",
            description: "Please sync locations from Google Business Profile first.",
            variant: "destructive",
          });
          return;
        }
        
        // Sync from all locations
        let totalSynced = 0;
        for (const location of locations) {
          try {
            const response = await fetch(`/api/google-business/reviews?locationName=${location}&sync=true`);
            const data = await response.json();
            if (data.success) {
              totalSynced++;
            }
          } catch (error) {
            console.error(`Failed to sync reviews for location ${location}:`, error);
          }
        }
        
        if (totalSynced > 0) {
          toast({
            title: "Sync Completed",
            description: `Successfully synced reviews from ${totalSynced} locations`,
          });
          await fetchReviews();
          await fetchReviewStats();
      } else {
          toast({
            title: "Sync Failed",
            description: "Failed to sync reviews from any locations",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Sync from specific location
      const response = await fetch(`/api/google-business/reviews?locationName=${locationName}&sync=true`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Reviews synced successfully",
        });
        await fetchReviews();
        await fetchReviewStats();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to sync reviews",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync reviews from Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(review => review.locationName === selectedLocation);
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(review => review.sentiment === selectedSentiment);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.locationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/google-business/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reply',
          reviewId,
          replyComment: replyText
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Reply added successfully",
        });
        setReplyText('');
        setReplyingTo(null);
        await fetchReviews();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply.",
        variant: "destructive",
      });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      case 'neutral': return <Minus className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer reviews from all locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => syncReviewsFromGoogle()} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {locations.length > 0 ? 'Sync All Locations' : 'Sync from Google'}
                    </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.positiveReviews}</div>
            </CardContent>
          </Card>
                            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neutral</CardTitle>
              <Minus className="h-4 w-4 text-gray-600" />
                                </CardHeader>
                                <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.neutralReviews}</div>
                                </CardContent>
                            </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negative</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.negativeReviews}</div>
              </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
           <Card>
              <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
              </CardHeader>
              <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
        </div>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
            <div>
              <Label>Sentiment</Label>
              <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                <SelectTrigger>
                  <SelectValue placeholder="All sentiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSelectedLocation('all');
                  setSelectedSentiment('all');
                  setSearchTerm('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
                </CardContent>
            </Card>

      {/* Reviews Table */}
            <Card>
                <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
          <CardDescription>
            Customer reviews from all locations with sentiment analysis
          </CardDescription>
                </CardHeader>
                <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found. Try adjusting your filters or syncing from Google.
        </div>
          ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {review.reviewerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({review.rating})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm">{review.comment}</p>
                        {review.reviewReply && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Reply:</strong> {review.reviewReply.comment}
                          </div>
                        )}
        </div>
                    </TableCell>
                                <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{review.locationName}</span>
                      </div>
                                </TableCell>
                                <TableCell>
                      <Badge className={getSentimentColor(review.sentiment || 'neutral')}>
                        <div className="flex items-center gap-1">
                          {getSentimentIcon(review.sentiment || 'neutral')}
                          {review.sentiment || 'neutral'}
                        </div>
                      </Badge>
                                </TableCell>
                                <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(review.reviewTime).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {!review.reviewReply ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTo(review.reviewId)}
                        >
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                                            </Button>
                      ) : (
                        <Badge variant="secondary">Replied</Badge>
                      )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
          )}
            </CardContent>
        </Card>

      {/* Reply Dialog */}
      {replyingTo && (
        <Card className="fixed inset-4 z-50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Reply to Review</CardTitle>
            <CardDescription>
              Your reply will be posted to Google Business Profile and saved locally
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reply-text">Reply Comment</Label>
              <Textarea
                id="reply-text"
                placeholder="Enter your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
                </div>
            <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                Cancel
                    </Button>
                    <Button 
                onClick={() => handleReply(replyingTo)}
                disabled={!replyText.trim()}
                    >
                Post Reply
                    </Button>
                  </div>
          </CardContent>
        </Card>
      )}
                    </div>
  );
}
