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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Building,
  Star,
  MessageSquare,
  Search,
  Filter,
  Download,
  Reply,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Phone,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";
import { sampleReviews, sampleBrand } from "@/lib/mock-data";

interface Review {
  id: string;
  storeId: string;
  storeName: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  content: string;
  response?: string;
  status: 'published' | 'pending' | 'flagged' | 'hidden';
  source: 'google' | 'facebook' | 'yelp' | 'internal';
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(sampleReviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  // Filter reviews based on all criteria
  useEffect(() => {
    let filtered = reviews;

    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStore !== 'all') {
      filtered = filtered.filter(review => review.storeId === selectedStore);
    }

    if (selectedRating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(selectedRating));
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(review => review.status === selectedStatus);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(review => review.source === selectedSource);
    }

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, selectedStore, selectedRating, selectedStatus, selectedSource]);

  // Calculate metrics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const flaggedReviews = reviews.filter(r => r.status === 'flagged').length;
  const responseRate = (reviews.filter(r => r.response).length / totalReviews) * 100;

  const stores = sampleBrand.stores;

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    // Update review with response
    const updatedReviews = reviews.map(review =>
      review.id === selectedReview.id
        ? { ...review, response: replyText, updatedAt: new Date() }
        : review
    );

    setReviews(updatedReviews);
    setReplyText('');
    setIsReplyDialogOpen(false);
    setSelectedReview(null);
  };

  const handleStatusChange = async (reviewId: string, newStatus: Review['status']) => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId
        ? { ...review, status: newStatus, updatedAt: new Date() }
        : review
    );

    setReviews(updatedReviews);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: Review['status']) => {
    const variants = {
      published: 'default',
      pending: 'secondary',
      flagged: 'destructive',
      hidden: 'outline'
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getSourceBadge = (source: Review['source']) => {
    const colors = {
      google: 'bg-blue-100 text-blue-800',
      facebook: 'bg-indigo-100 text-indigo-800',
      yelp: 'bg-red-100 text-red-800',
      internal: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[source]} variant="secondary">
        {source.charAt(0).toUpperCase() + source.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground">
            Monitor and respond to customer feedback across all your stores
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-muted-foreground">{averageRating.toFixed(1)} avg rating</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {reviews.filter(r => r.response).length} of {totalReviews} responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedReviews}</div>
            <p className="text-xs text-muted-foreground">
              Require review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>Breakdown of customer ratings across all stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
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
                      style={{ width: `${(count / totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Average rating from {totalReviews} reviews
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Find specific reviews using the filters below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store._id} value={store._id}>
                    {store.storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger>
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="yelp">Yelp</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
              <CardDescription>
                Showing {filteredReviews.length} of {totalReviews} reviews
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filter
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
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="font-medium">{review.storeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {stores.find(s => s._id === review.storeId)?.address.city}, {stores.find(s => s._id === review.storeId)?.address.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{review.reviewerName}</div>
                      <div className="text-sm text-muted-foreground">{review.reviewerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 fill-current ${getRatingColor(review.rating)}`} />
                      <span className={`font-medium ${getRatingColor(review.rating)}`}>
                        {review.rating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{review.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {review.content}
                      </div>
                      {review.response && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong>Response:</strong> {review.response}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(review.status)}
                  </TableCell>
                  <TableCell>
                    {getSourceBadge(review.source)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Details</DialogTitle>
                            <DialogDescription>
                              Detailed view of the review and response options
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Store</Label>
                              <p className="font-medium">{review.storeName}</p>
                            </div>
                            <div>
                              <Label>Reviewer</Label>
                              <p className="font-medium">{review.reviewerName}</p>
                              <p className="text-sm text-muted-foreground">{review.reviewerEmail}</p>
                            </div>
                            <div>
                              <Label>Rating</Label>
                              <div className="flex items-center gap-1">
                                <Star className={`h-5 w-5 fill-current ${getRatingColor(review.rating)}`} />
                                <span className={`font-medium ${getRatingColor(review.rating)}`}>
                                  {review.rating} out of 5
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label>Title</Label>
                              <p className="font-medium">{review.title}</p>
                            </div>
                            <div>
                              <Label>Content</Label>
                              <p className="text-sm">{review.content}</p>
                            </div>
                            {review.response && (
                              <div>
                                <Label>Current Response</Label>
                                <p className="text-sm bg-blue-50 p-2 rounded">{review.response}</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedReview(review);
                                setReplyText(review.response || '');
                                setIsReplyDialogOpen(true);
                              }}
                            >
                              <Reply className="mr-2 h-4 w-4" />
                              {review.response ? 'Edit Response' : 'Reply'}
                            </Button>
                            <Select
                              value={review.status}
                              onValueChange={(value: Review['status']) => handleStatusChange(review.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="flagged">Flagged</SelectItem>
                                <SelectItem value="hidden">Hidden</SelectItem>
                              </SelectContent>
                            </Select>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setReplyText(review.response || '');
                          setIsReplyDialogOpen(true);
                        }}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to {selectedReview?.reviewerName}'s review for {selectedReview?.storeName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review</Label>
              <div className="p-3 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Star className={`h-4 w-4 fill-current ${getRatingColor(selectedReview?.rating || 0)}`} />
                  <span className="font-medium">{selectedReview?.rating}/5</span>
                </div>
                <div className="font-medium">{selectedReview?.title}</div>
                <div className="text-muted-foreground">{selectedReview?.content}</div>
              </div>
            </div>
            <div>
              <Label htmlFor="reply">Your Response</Label>
              <Textarea
                id="reply"
                placeholder="Write your response to this review..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReply}>
              <Reply className="mr-2 h-4 w-4" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
