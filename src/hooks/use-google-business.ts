import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

export function useGoogleBusiness() {
  const [accounts, setAccounts] = useState<GoogleBusinessAccount[]>([]);
  const [locations, setLocations] = useState<GoogleBusinessLocation[]>([]);
  const [posts, setPosts] = useState<GoogleBusinessPost[]>([]);
  const [insights, setInsights] = useState<GoogleBusinessInsights | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/google-business/auth');
      const data = await response.json();
      setIsAuthenticated(data.success || false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  }, []);

  // Handle authentication
  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const returnTo = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : encodeURIComponent('/google-business');
      const response = await fetch(`/api/google-business/auth?mode=oauth&returnTo=${returnTo}`);
      const data = await response.json();
      
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
  }, [toast]);

  // Fetch verification status for a location
  const fetchVerifications = useCallback(async (locationName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/verifications?locationName=${locationName}`);
      const data = await response.json();
      if (data.success) {
        setVerifications(data.verifications || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch verification status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch notifications for an account
  const fetchNotifications = useCallback(async (accountName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/notifications?accountName=${accountName}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const returnTo = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : encodeURIComponent('/google-business');
      const response = await fetch(`/api/google-business/accounts?returnTo=${returnTo}`);
      const data = await response.json();
      
      if (data?.requireAuth && data?.authUrl) {
        window.location.href = data.authUrl;
        return;
      }

      if (data.success) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0].name);
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
  }, [toast]);

  // Fetch locations for an account
  const fetchLocations = useCallback(async (accountName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/locations?accountName=${accountName}`);
      const data = await response.json();
      
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
  }, [toast]);

  // Fetch posts for a location
  const fetchPosts = useCallback(async (locationName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/posts?locationName=${locationName}`);
      const data = await response.json();
      
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
  }, [toast]);

  // Fetch insights for a location
  const fetchInsights = useCallback(async (locationName: string, days: number = 30) => {
    try {
      setIsLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(`/api/google-business/insights?locationName=${locationName}&startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      
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
  }, [toast]);

  // Create a new post
  const createPost = useCallback(async (locationName: string, postData: Partial<GoogleBusinessPost>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/posts?locationName=${locationName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
        // Refresh posts
        await fetchPosts(locationName);
        return data.post;
      } else {
        throw new Error(data.error || 'Failed to create post');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchPosts]);

  // Delete a post
  const deletePost = useCallback(async (postName: string, locationName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/posts?postName=${postName}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Post deleted successfully!",
        });
        // Refresh posts
        await fetchPosts(locationName);
      } else {
        throw new Error(data.error || 'Failed to delete post');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchPosts]);

  // Update location information
  const updateLocation = useCallback(async (locationName: string, updateData: Partial<GoogleBusinessLocation>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/google-business/locations?locationName=${locationName}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Location updated successfully!",
        });
        return data.location;
      } else {
        throw new Error(data.error || 'Failed to update location');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated, fetchAccounts]);

  // Fetch locations when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchLocations(selectedAccount);
      fetchNotifications(selectedAccount);
    }
  }, [selectedAccount, fetchLocations, fetchNotifications]);

  // Fetch posts and insights when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetchPosts(selectedLocation);
      fetchInsights(selectedLocation);
      fetchVerifications(selectedLocation);
    }
  }, [selectedLocation, fetchPosts, fetchInsights, fetchVerifications]);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    // State
    accounts,
    locations,
    posts,
    insights,
    verifications,
    notifications,
    selectedAccount,
    selectedLocation,
    isLoading,
    isAuthenticated,
    
    // Actions
    setSelectedAccount,
    setSelectedLocation,
    handleAuth,
    fetchAccounts,
    fetchLocations,
    fetchPosts,
    fetchInsights,
    fetchVerifications,
    fetchNotifications,
    createPost,
    deletePost,
    updateLocation,
    checkAuthStatus,
  };
} 