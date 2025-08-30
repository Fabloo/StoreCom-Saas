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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  MessageSquare,
  BarChart3,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Phone,
  Globe,
  Calendar,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleBusinessAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  state: string;
  profilePhotoUri?: string;
  accountNumber?: string;
}

interface GoogleBusinessLocation {
  name: string;
  locationName?: string;
  title?: string;
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
  profile?: {
    description?: string;
    phoneNumbers?: {
      primaryPhone?: string;
    };
    websiteUri?: string;
  };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
}

interface GoogleBusinessPost {
  name: string;
  summary?: string;
  callToAction?: {
    actionType: string;
    url?: string;
  };
  topicType: string;
  createTime?: string;
  state: string;
  offer?: {
    title: string;
    summary?: string;
  };
  event?: {
    title: string;
    summary?: string;
  };
}

interface GoogleBusinessInsights {
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

export default function GoogleBusinessPage() {
  const [accounts, setAccounts] = useState<GoogleBusinessAccount[]>([]);
  const [locations, setLocations] = useState<GoogleBusinessLocation[]>([]);
  const [posts, setPosts] = useState<GoogleBusinessPost[]>([]);
  const [insights, setInsights] = useState<GoogleBusinessInsights | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPost, setNewPost] = useState({
    summary: '',
    topicType: 'STANDARD',
    callToAction: {
      actionType: 'LEARN_MORE',
      url: ''
    }
  });
  const { toast } = useToast();

  // Check authentication status (no auto-fetch or redirect)
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check via accounts endpoint so OAuth cookie is respected; do not auto-redirect
      const response = await fetch('/api/google-business/accounts');
      console.log('[GBP UI] Accounts fetch (auth check) response.ok', response.ok);
      if (!response.ok) {
        setIsAuthenticated(false);
        return;
      }
      const data = await response.json();
      console.log('[GBP UI] Auth status via accounts', data);
      setIsAuthenticated(Boolean(data.success));
    } catch (error) {
      console.error('[GBP UI] Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      // Always request OAuth URL explicitly, never auto-detect service account here
      const returnTo = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : encodeURIComponent('/google-business');
      const response = await fetch(`/api/google-business/auth?mode=oauth&returnTo=${returnTo}`);
      const data = await response.json();
      console.log('[GBP UI] Auth URL response', data);
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to start authentication process.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/google-business/accounts');
      const data = await response.json();
      console.log('[GBP UI] Accounts response', data);
      
      // Do not auto-redirect. If auth is required, just reflect unauthenticated state.
      if (data?.requireAuth) {
        setIsAuthenticated(false);
        return;
      }

      if (data.success) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          const selectedAccount = data.accounts[0].name;
          setSelectedAccount(selectedAccount);
          
          // Automatically fetch locations for the selected account
          await fetchLocations(selectedAccount);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Google Business accounts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async (accountName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/locations?accountName=${accountName}`);
      const data = await response.json();
      console.log('[GBP UI] Locations response', data);
      if (data.success) {
        setLocations(data.locations);
        if (data.locations.length > 0) {
          setSelectedLocation(data.locations[0].name);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch locations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async (locationName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/posts?locationName=${locationName}`);
      const data = await response.json();
      console.log('[GBP UI] Posts response', data);
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async (locationName: string) => {
    try {
      setIsLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(`/api/google-business/insights?locationName=${locationName}&startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      console.log('[GBP UI] Insights response', data);
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch insights.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!selectedLocation || !newPost.summary) {
      toast({
        title: "Error",
        description: "Please select a location and enter post content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/posts?locationName=${selectedLocation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
        setNewPost({
          summary: '',
          topicType: 'STANDARD',
          callToAction: {
            actionType: 'LEARN_MORE',
            url: ''
          }
        });
        fetchPosts(selectedLocation);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncReviewsFromGoogle = async (locationName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/reviews?locationName=${locationName}&sync=true`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Reviews synced successfully",
        });
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

  // Do not auto-fetch accounts on auth; only fetch on button click

  useEffect(() => {
    if (selectedAccount) {
      fetchLocations(selectedAccount);
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (selectedLocation) {
      fetchPosts(selectedLocation);
      fetchInsights(selectedLocation);
    }
  }, [selectedLocation]);


  console.log('[GBP UI] isAuthenticated', isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Google Business Profile
            </CardTitle>
            <CardDescription>
              Connect your Google Business account to manage your locations, posts, and insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Your Google Business Account</h3>
              <p className="text-muted-foreground mb-6">
                To access your Google Business Profile data, you need to authenticate with Google.
              </p>
              <Button onClick={handleAuth} disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Google Business
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-5 w-5" />
            Google Business Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your Google Business locations, posts, and insights
          </p>
        </div>
        <Button onClick={() => fetchAccounts()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.name} value={account.name}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.name} value={location.name}>
                    {location.title || location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedLocation && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Website Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">567</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Phone Calls</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                {locations.find(loc => loc.name === selectedLocation) && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Business Name</Label>
                        <p className="text-sm text-muted-foreground">
                          {locations.find(loc => loc.name === selectedLocation)?.title || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <p className="text-sm text-muted-foreground">
                          {locations.find(loc => loc.name === selectedLocation)?.primaryCategory?.displayName || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          {locations.find(loc => loc.name === selectedLocation)?.phoneNumbers?.primaryPhone || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label>Website</Label>
                        <p className="text-sm text-muted-foreground">
                          {locations.find(loc => loc.name === selectedLocation)?.websiteUri || 'Not set'}
                        </p>
                      </div>
                    </div>
                    {locations.find(loc => loc.name === selectedLocation)?.description && (
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm text-muted-foreground">
                          {locations.find(loc => loc.name === selectedLocation)?.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
                <CardDescription>
                  Create a new post for your Google Business Profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="post-content">Post Content</Label>
                  <Textarea
                    id="post-content"
                    placeholder="What would you like to share with your customers?"
                    value={newPost.summary}
                    onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="post-type">Post Type</Label>
                    <Select value={newPost.topicType} onValueChange={(value) => setNewPost({ ...newPost, topicType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard Post</SelectItem>
                        <SelectItem value="OFFER">Offer</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                        <SelectItem value="ALERT">Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="call-to-action">Call to Action</Label>
                    <Select value={newPost.callToAction.actionType} onValueChange={(value) => setNewPost({ ...newPost, callToAction: { ...newPost.callToAction, actionType: value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                        <SelectItem value="BOOK">Book</SelectItem>
                        <SelectItem value="ORDER_ONLINE">Order Online</SelectItem>
                        <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                        <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                        <SelectItem value="CALL_NOW">Call Now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newPost.callToAction.actionType !== 'CALL_NOW' && (
                  <div>
                    <Label htmlFor="action-url">Action URL (optional)</Label>
                    <Input
                      id="action-url"
                      type="url"
                      placeholder="https://example.com"
                      value={newPost.callToAction.url}
                      onChange={(e) => setNewPost({ ...newPost, callToAction: { ...newPost.callToAction, url: e.target.value } })}
                    />
                  </div>
                )}
                <Button onClick={createPost} disabled={isLoading || !newPost.summary}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.name}>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {post.summary || post.offer?.title || post.event?.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {post.topicType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.state === 'LIVE' ? 'default' : 'secondary'}>
                            {post.state}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.createTime ? new Date(post.createTime).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key metrics for your Google Business Profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Profile Views</span>
                    </div>
                    <div className="text-2xl font-bold">1,234</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +12%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Website Clicks</span>
                    </div>
                    <div className="text-2xl font-bold">567</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +8%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Phone Calls</span>
                    </div>
                    <div className="text-2xl font-bold">89</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +15%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Direction Requests</span>
                    </div>
                    <div className="text-2xl font-bold">234</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +5%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Photo Views</span>
                    </div>
                    <div className="text-2xl font-bold">3,456</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +20%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Post Views</span>
                    </div>
                    <div className="text-2xl font-bold">789</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +25%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Reviews</CardTitle>
                    <CardDescription>
                      Customer reviews and ratings for this location
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => syncReviewsFromGoogle(selectedLocation)}
                    disabled={isLoading || !selectedLocation}
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Reviews
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedLocation ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Click "Sync Reviews" to fetch reviews from Google Business Profile
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Select a location to view and sync reviews
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 