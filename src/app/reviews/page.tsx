
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { AreaChart, CartesianGrid, LineChart, XAxis, YAxis, Area, Line } from "recharts"
import { Star, MessageSquare, Tag, MapPin, CheckCircle2, Circle, MoreHorizontal, ListFilter, TrendingUp, TrendingDown, AlertTriangle, Wand2, BookText, Clock, Target, User, Check, Ban, Download, Loader2, Settings, FileText, RefreshCw, Zap } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { addDays, format, parseISO, isAfter } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { reviews as allReviews } from "@/lib/mock-data"
import { generateReviewReply } from "@/ai/flows/generate-review-reply"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"


const stores = Array.from(new Set(allReviews.map(r => r.store)));

const actionItems = [
    {
        task: "Deep clean the main seating area.",
        review: "The store was not clean...",
        assignedTo: "Manager, South Beach",
        dueDate: "2024-07-25",
        status: "Pending",
    },
    {
        task: "Conduct refresher training on customer service.",
        review: "...the staff was rude.",
        assignedTo: "Manager, South Beach",
        dueDate: "2024-07-28",
        status: "Pending",
    },
    {
        task: "Investigate technician's performance.",
        review: "...didn't seem to know what he was doing.",
        assignedTo: "Manager, Westwood Store",
        dueDate: "2024-07-24",
        status: "In Progress",
    },
    {
        task: "Follow-up with customer about unresolved issue.",
        review: "The problem is still not fixed.",
        assignedTo: "Support, Westwood Store",
        dueDate: "2024-07-22",
        status: "Resolved",
    },
];

const sentimentChartData = [
  { month: "Jan", positive: 75, neutral: 15, negative: 10 },
  { month: "Feb", positive: 80, neutral: 10, negative: 10 },
  { month: "Mar", positive: 70, neutral: 18, negative: 12 },
  { month: "Apr", positive: 85, neutral: 10, negative: 5 },
  { month: "May", positive: 88, neutral: 8, negative: 4 },
  { month: "Jun", positive: 82, neutral: 12, negative: 6 },
]

const recentReports = [
    { name: "Monthly All Stores Report - June", date: "2024-07-01", type: "Store-wise", format: "PDF" },
    { name: "Westwood Store - Q2 Complaints", date: "2024-06-30", type: "Category Report", format: "CSV" },
    { name: "SLA Report - June", date: "2024-07-01", type: "SLA Report", format: "CSV" },
]

const initialTemplates = {
    1: "We are so sorry to hear about your experience. This is not the standard we strive for. Please contact us at [Contact Email/Phone] so we can make things right.\n\n- The Management",
    2: "We are sorry to hear you had a less than satisfactory experience. We appreciate your feedback and will use it to improve.\n\n- The Management",
    3: "Thank you for your feedback. We appreciate you taking the time to share your thoughts with us as we work to improve our services.\n\n- The Management",
    4: "Thank you for the positive feedback! We're happy you had a good experience and hope to see you again soon.\n\n- The Management",
    5: "Thank you so much for your kind words! We're thrilled to hear you had a great experience and look forward to seeing you again soon.\n\n- The Management",
}


const chartConfig = {
  rating: {
    label: "Avg. Rating",
    color: "hsl(var(--primary))",
  },
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-2))",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-4))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--destructive))",
  },
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
      />
    ))}
  </div>
);

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'Replied') {
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground" />;
};

const getFilteredInsights = (store?: string) => {
    const filteredReviews = store ? allReviews.filter(r => r.store === store) : allReviews;
    
    const keywordCloud = filteredReviews.flatMap(r => r.tags).reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topComplaints = filteredReviews.flatMap(r => r.complaints).reduce((acc, complaint) => {
        if(complaint) acc[complaint] = (acc[complaint] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const productFeedback = filteredReviews.flatMap(r => r.feedback).reduce((acc, fb) => {
        if(fb) acc[fb] = (acc[fb] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        keywordCloud: Object.entries(keywordCloud).sort((a, b) => b[1] - a[1]),
        topComplaints: Object.entries(topComplaints).sort((a, b) => b[1] - a[1]),
        productFeedback: Object.entries(productFeedback).sort((a, b) => b[1] - a[1]),
    };
};


export default function ReviewsPage() {
  const [reviews, setReviews] = useState(allReviews);
  const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);
  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [brandTone, setBrandTone] = useState<'Professional' | 'Friendly' | 'Humorous'>('Friendly');
  const [brandSOP, setBrandSOP] = useState("If the rating is 1 or 2 stars, offer a 10% discount on their next visit.");

  const unrepliedReviews = useMemo(() => reviews.filter(r => r.status === 'Not Replied'), [reviews]);
  const [selectedReview, setSelectedReview] = useState<(typeof unrepliedReviews)[0] | null>(unrepliedReviews[0] || null);
  
  const insights = useMemo(() => getFilteredInsights(selectedStore), [selectedStore]);
   const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const [replyTemplates, setReplyTemplates] = useState(initialTemplates);
  const { toast } = useToast();

  // ----- Google Business Profile (Live) -----
  type GbpAccount = { name?: string; accountName?: string };
  type GbpLocation = { name?: string; locationName?: string };
  type GbpReview = {
    name?: string;
    reviewId?: string;
    reviewer?: { displayName?: string; profilePhotoUrl?: string };
    starRating?: string | number;
    comment?: string;
    createTime?: string;
    updateTime?: string;
  };

  const [gbpReady, setGbpReady] = useState(false);
  const [gbpLoading, setGbpLoading] = useState(false);
  const [gbpError, setGbpError] = useState<string | null>(null);
  const [gbpAccounts, setGbpAccounts] = useState<GbpAccount[]>([]);
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [gbpLocations, setGbpLocations] = useState<GbpLocation[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [gbpReviews, setGbpReviews] = useState<GbpReview[]>([]);
  
  // Store-specific reviews state
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [storeReviewsLoading, setStoreReviewsLoading] = useState(false);
  const [storeReviewsError, setStoreReviewsError] = useState<string | null>(null);
  const [storeStats, setStoreStats] = useState<{totalReviews: number, averageRating?: string} | null>(null);

  useEffect(() => setGbpReady(true), []);

  // Load store-specific reviews on component mount
  useEffect(() => {
    loadStoreReviews();
  }, []);

  // Auto-load accounts after redirect from OAuth when we land on /reviews with cookies set
  useEffect(() => {
    if (!gbpReady || gbpAccounts.length) return;
    // Attempt a lightweight check to populate accounts without clicking
    (async () => {
      try {
        const res = await fetch(`/api/google-business/accounts?returnTo=${encodeURIComponent('/reviews')}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.accounts)) {
          setGbpAccounts(data.accounts);
        }
      } catch {}
    })();
  }, [gbpReady, gbpAccounts.length]);

  // When accounts are available and none selected, auto-select the first and load locations
  useEffect(() => {
    if (!gbpAccounts.length || selectedAccountName) return;
    const first = gbpAccounts[0]?.name || '';
    if (first) {
      setSelectedAccountName(first);
      setGbpLocations([]);
      setGbpReviews([]);
      loadGbpLocations(first);
    }
  }, [gbpAccounts, selectedAccountName]);

  // When locations are available and none selected, auto-select the first and load reviews
  useEffect(() => {
    if (!gbpLocations.length || selectedLocationName) return;
    const first = gbpLocations[0]?.name || '';
    if (first) {
      setSelectedLocationName(first);
      setGbpReviews([]);
      loadGbpReviews(first);
    }
  }, [gbpLocations, selectedLocationName]);

  function mapStar(star?: string | number): number {
    if (typeof star === 'number') return Math.max(0, Math.min(5, star));
    switch (star) {
      case 'ONE': return 1;
      case 'TWO': return 2;
      case 'THREE': return 3;
      case 'FOUR': return 4;
      case 'FIVE': return 5;
      default: return 0;
    }
  }

  const gbpAccountOptions = useMemo(() => (
    gbpAccounts.map(a => ({ id: a.name || '', label: a.accountName || (a.name || '') }))
  ), [gbpAccounts]);

  const gbpLocationOptions = useMemo(() => (
    gbpLocations.map(l => ({ id: l.name || '', label: l.locationName || (l.name || '') }))
  ), [gbpLocations]);

  async function connectGoogle() {
    setGbpLoading(true);
    setGbpError(null);
    try {
      const res = await fetch(`/api/google-business/accounts?returnTo=${encodeURIComponent('/reviews')}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        if (data?.authUrl) {
          window.location.href = data.authUrl;
          return;
        }
        throw new Error(data?.error || 'Failed to load accounts');
      }
      if (data?.requireAuth && data?.authUrl) {
        window.location.href = data.authUrl;
        return;
      }
      setGbpAccounts(data.accounts || []);
    } catch (e: any) {
      setGbpError(e?.message || 'Failed to connect Google');
    } finally {
      setGbpLoading(false);
    }
  }

  async function loadGbpLocations(accountName: string) {
    setGbpLoading(true);
    setGbpError(null);
    try {
      const qp = new URLSearchParams();
      qp.set('accountName', accountName);
      const res = await fetch(`/api/google-business/locations?${qp.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load locations');
      setGbpLocations(data.locations || []);
    } catch (e: any) {
      setGbpError(e?.message || 'Failed to load locations');
    } finally {
      setGbpLoading(false);
    }
  }

  async function loadGbpReviews(locationName: string) {
    setGbpLoading(true);
    setGbpError(null);
    try {
      const qp = new URLSearchParams();
      qp.set('locationName', locationName);
      const res = await fetch(`/api/google-business/reviews?${qp.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load reviews');
      setGbpReviews(data.reviews || []);
    } catch (e: any) {
      setGbpError(e?.message || 'Failed to load reviews');
    } finally {
      setGbpLoading(false);
    }
  }

  async function loadStoreReviews() {
    setStoreReviewsLoading(true);
    setStoreReviewsError(null);
    try {
      const qp = new URLSearchParams();
      qp.set('businessProfileId', '16058076381455815546');
      qp.set('storeId', '11007263269570993027');
      const res = await fetch(`/api/store-reviews?${qp.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load store reviews');
      setStoreReviews(data.reviews || []);
      // Handle the new API response format
      if (data.success && data.data) {
        const reviews = data.data.reviews?.reviews || [];
        const totalReviews = data.data.totalReviews || reviews.length;
        
        // Calculate average rating from reviews data
        const avgRating = reviews.length > 0 
          ? (reviews.reduce((sum: number, review: any) => sum + mapStar(review.starRating), 0) / reviews.length).toFixed(1)
          : 'N/A';
        
        setStoreStats({
          totalReviews,
          averageRating: avgRating
        });
        
        // Transform the reviews data to match our expected format
        const transformedReviews = reviews.map((review: any) => ({
          id: review.name || review.reviewId || Math.random().toString(),
          reviewerName: review.reviewer?.displayName || 'Anonymous',
          reviewerProfilePhotoUrl: review.reviewer?.profilePhotoUrl || '',
          rating: mapStar(review.starRating),
          comment: review.comment || '',
          createTime: review.createTime || new Date().toISOString(),
          updateTime: review.updateTime || review.createTime || new Date().toISOString(),
          source: 'Google Business Profile',
          status: 'Not Replied',
          store: `Store ID: 11007263269570993027`,
          sentiment: mapStar(review.starRating) >= 4 ? 'Positive' : mapStar(review.starRating) <= 2 ? 'Negative' : 'Neutral',
          tags: [],
          complaints: null,
          feedback: null
        }));
        
        setStoreReviews(transformedReviews);
      } else {
        // Handle error case
        setStoreStats({
          totalReviews: 0,
          averageRating: 'N/A'
        });
        setStoreReviews([]);
      }
    } catch (e: any) {
      setStoreReviewsError(e?.message || 'Failed to load store reviews');
    } finally {
      setStoreReviewsLoading(false);
    }
  }

  async function loadStoreReviewsDirect() {
    setStoreReviewsLoading(true);
    setStoreReviewsError(null);
    try {
      const qp = new URLSearchParams();
      qp.set('businessProfileId', '16058076381455815546');
      qp.set('storeId', '11007263269570993027');
      qp.set('direct', 'true');
      const res = await fetch(`/api/store-reviews?${qp.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success && data.data) {
        const reviews = data.data.reviews?.reviews || [];
        const totalReviews = data.data.totalReviews || reviews.length;
        
        // Calculate average rating from reviews data
        const avgRating = reviews.length > 0 
          ? (reviews.reduce((sum: number, review: any) => sum + mapStar(review.starRating), 0) / reviews.length).toFixed(1)
          : 'N/A';
        
        setStoreStats({
          totalReviews,
          averageRating: avgRating
        });
        
        // Transform the reviews data to match our expected format
        const transformedReviews = reviews.map((review: any) => ({
          id: review.name || review.reviewId || Math.random().toString(),
          reviewerName: review.reviewer?.displayName || 'Anonymous',
          reviewerProfilePhotoUrl: review.reviewer?.profilePhotoUrl || '',
          rating: mapStar(review.starRating),
          comment: review.comment || '',
          createTime: review.createTime || new Date().toISOString(),
          updateTime: review.updateTime || review.createTime || new Date().toISOString(),
          source: 'Google Business Profile',
          status: 'Not Replied',
          store: `Store ID: 11007263269570993027`,
          sentiment: mapStar(review.starRating) >= 4 ? 'Positive' : mapStar(review.starRating) <= 2 ? 'Negative' : 'Neutral',
          tags: [],
          complaints: null,
          feedback: null
        }));
        
        setStoreReviews(transformedReviews);
        setStoreReviewsError(null);
      } else {
        // Handle error case
        setStoreStats({
          totalReviews: 0,
          averageRating: 'N/A'
        });
        setStoreReviews([]);
        setStoreReviewsError(data.error || data.message || 'Direct API call failed');
      }
    } catch (e: any) {
      setStoreReviewsError(e?.message || 'Failed to load store reviews via direct API call');
    } finally {
      setStoreReviewsLoading(false);
    }
  }

  const ratingChartData = useMemo(() => {
    const monthlyData: { [key: string]: { total: number; count: number } } = {};

    reviews.forEach(review => {
      const month = format(parseISO(review.date), 'MMM');
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += review.rating;
      monthlyData[month].count += 1;
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        rating: parseFloat((data.total / data.count).toFixed(2)),
      }))
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
  }, [reviews]);


  const handleTemplateChange = (rating: number, text: string) => {
      setReplyTemplates(prev => ({...prev, [rating]: text}));
  }

  const applyTemplate = () => {
      if (selectedReview) {
          const template = replyTemplates[selectedReview.rating as keyof typeof replyTemplates];
          setReplyText(template);
      }
  }

  const getSentimentBadgeVariant = (sentiment?: string) => {
    switch (sentiment) {
      case 'Positive': return 'default';
      case 'Negative': return 'destructive';
      case 'Neutral': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Pending': return 'destructive';
        case 'In Progress': return 'secondary';
        case 'Resolved': return 'default';
        default: return 'outline';
    }
  }

  const handleSelectReview = (review: (typeof unrepliedReviews)[0]) => {
    setSelectedReview(review);
    setReplyText("");
  }

  const handleGenerateReply = async () => {
    if (!selectedReview) return;
    setIsGenerating(true);
    setReplyText("");
    try {
        const result = await generateReviewReply({
            reviewText: selectedReview.text,
            rating: selectedReview.rating,
            brandTone: brandTone,
            brandSOP: brandSOP
        });
        setReplyText(result.suggestedReply);
    } catch (error) {
        console.error("Failed to generate reply", error);
        setReplyText("Sorry, I couldn't generate a reply. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  }
  
  const handleSendReply = () => {
    if (!selectedReview) return;

    // Simulate sending reply by updating the review's status
    setReviews(prevReviews => 
        prevReviews.map(r => 
            r.text === selectedReview.text && r.customer === selectedReview.customer ? { ...r, status: 'Replied' } : r
        )
    );

    // Clear the current selection and reply
    setReplyText("");
    const nextReviewIndex = unrepliedReviews.findIndex(r => r.text === selectedReview.text) + 1;
    setSelectedReview(unrepliedReviews[nextReviewIndex] || null);
  }

    const bestPerformingStores = useMemo(() => {
        const storeStats: Record<string, { totalRating: number, reviewCount: number, name: string }> = {};

        allReviews.forEach(review => {
            if (!storeStats[review.store]) {
                storeStats[review.store] = { totalRating: 0, reviewCount: 0, name: review.store };
            }
            storeStats[review.store].totalRating += review.rating;
            storeStats[review.store].reviewCount += 1;
        });

        return Object.values(storeStats)
            .map(store => ({
                ...store,
                avgRating: store.reviewCount > 0 ? parseFloat((store.totalRating / store.reviewCount).toFixed(1)) : 0,
            }))
            .filter(store => store.avgRating >= 4.8 && store.reviewCount > 10)
            .sort((a, b) => b.avgRating - a.avgRating);
    }, [allReviews]);

    const atRiskStores = useMemo(() => {
        const sevenDaysAgo = addDays(new Date(), -7);
        const recentNegativeReviews = allReviews.filter(review =>
            review.sentiment === 'Negative' && isAfter(parseISO(review.date), sevenDaysAgo)
        );

        const storeNegativeCounts: Record<string, { count: number, name: string }> = {};

        recentNegativeReviews.forEach(review => {
            if (!storeNegativeCounts[review.store]) {
                storeNegativeCounts[review.store] = { count: 0, name: review.store };
            }
            storeNegativeCounts[review.store].count += 1;
        });

        return Object.values(storeNegativeCounts)
            .filter(store => store.count > 2)
            .sort((a, b) => b.count - a.count);
    }, [allReviews]);

    const handleGenerateReport = () => {
        toast({
            title: "Report Generation Started",
            description: "Your report is being generated and will be sent to your email shortly.",
        });
    }

  return (
    <Tabs defaultValue="review-feed">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="review-feed">Review Feed</TabsTrigger>
          <TabsTrigger value="reply-manager">Reply Manager</TabsTrigger>
          <TabsTrigger value="insights">Insights &amp; Trends</TabsTrigger>
          <TabsTrigger value="action-tracker">Action Tracker</TabsTrigger>
          <TabsTrigger value="reports">Export / Reports</TabsTrigger>
          <TabsTrigger value="google-live">Google Live</TabsTrigger>
          <TabsTrigger value="store-reviews">Store Reviews</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                        Star Rating
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Store</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Tag</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Response Status</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <TabsContent value="review-feed">
        <Card>
          <CardHeader>
            <CardTitle>Review Feed</CardTitle>
            <CardDescription>Central inbox for all GMB and manual reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead className="w-[180px]">Store</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviews.map((review, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <StarRating rating={review.rating} />
                            </TableCell>
                            <TableCell>
                                <p className="font-medium">{review.text}</p>
                                <div className="text-sm text-muted-foreground mt-2 flex items-center flex-wrap gap-x-4 gap-y-1">
                                    <span>{review.customer}</span>
                                    <div className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {review.date}</div>
                                    <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {review.source}</div>
                                </div>
                                <div className="mt-2 flex gap-2 flex-wrap">
                                    {review.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{review.store}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={review.status} />
                                    <span>{review.status}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Reply</DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Target className="mr-2 h-4 w-4" />
                                            Assign Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="google-live">
        <Card>
          <CardHeader>
            <CardTitle>Google Business Profile (Live)</CardTitle>
            <CardDescription>Authenticate and fetch real reviews from your Google locations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gbpError && <div className="text-red-600 text-sm">{gbpError}</div>}
            <div className="flex items-center gap-2">
              <Button onClick={connectGoogle} disabled={gbpLoading}>
                {gbpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                {gbpAccounts.length ? 'Reconnect Google' : 'Connect Google'}
              </Button>
              {!!gbpAccounts.length && <Badge variant="secondary">{gbpAccounts.length} account(s)</Badge>}
            </div>

            {!!gbpAccounts.length && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Account</Label>
                  <Select value={selectedAccountName} onValueChange={(val) => {
                    setSelectedAccountName(val);
                    setSelectedLocationName('');
                    setGbpLocations([]);
                    setGbpReviews([]);
                    if (val) loadGbpLocations(val);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {gbpAccountOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Select value={selectedLocationName} onValueChange={(val) => {
                    setSelectedLocationName(val);
                    setGbpReviews([]);
                    if (val) loadGbpReviews(val);
                  }} disabled={!selectedAccountName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {gbpLocationOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Reviews</h3>
              {!selectedLocationName ? (
                <div className="text-muted-foreground text-sm">Select a location to load reviews.</div>
              ) : gbpLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : gbpReviews.length === 0 ? (
                <div className="text-muted-foreground text-sm">No reviews found.</div>
              ) : (
                <div className="space-y-3">
                  {gbpReviews.map((r) => (
                    <div key={r.reviewId || r.name} className="border rounded p-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.reviewer?.profilePhotoUrl || ''} alt={r.reviewer?.displayName || 'Reviewer'} className="h-8 w-8 rounded-full object-cover bg-muted" />
                        <div className="font-medium">{r.reviewer?.displayName || 'Anonymous'}</div>
                        <div className="ml-auto text-yellow-600">
                          {'★'.repeat(mapStar(r.starRating))}
                          <span className="text-gray-300">{'★'.repeat(Math.max(0, 5 - mapStar(r.starRating)))}</span>
                        </div>
                      </div>
                      {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                      <div className="mt-1 text-xs text-muted-foreground">
                        {r.updateTime ? new Date(r.updateTime).toLocaleString() : r.createTime ? new Date(r.createTime).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reply-manager">
        <Card>
            <CardHeader>
                <CardTitle>Smart Reply Manager</CardTitle>
                <CardDescription>Use templates and AI to reply to reviews quickly, aligned with your brand voice.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1 flex flex-col gap-2 h-[750px] overflow-y-auto pr-2">
                        {unrepliedReviews.length > 0 ? unrepliedReviews.map((review, index) => (
                            <button key={index} onClick={() => handleSelectReview(review)} className={cn('p-3 rounded-lg text-left block w-full', selectedReview?.text === review.text && selectedReview?.customer === review.customer ? 'bg-muted' : 'hover:bg-muted/50')}>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{review.customer}</span>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{review.text}</p>
                                <span className="text-xs text-muted-foreground">{review.store} - {review.date}</span>
                            </button>
                        )) : (
                           <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground text-center p-4">No unreplied reviews. Great job!</p>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        {selectedReview ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{selectedReview.customer}</CardTitle>
                                            <CardDescription>{selectedReview.store} - {selectedReview.date}</CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <StarRating rating={selectedReview.rating} />
                                            <Badge variant={getSentimentBadgeVariant(selectedReview.sentiment)}>{selectedReview.sentiment}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4">{selectedReview.text}</p>
                                    
                                    <Separator className="my-4" />
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="flex items-center text-sm font-semibold"><Settings className="mr-2 h-4 w-4" /> AI & Template Settings</h4>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Manage Templates</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Manage Reply Templates</DialogTitle>
                                                            <DialogDescription>Set a custom template for each star rating.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                                            {[5,4,3,2,1].map(rating => (
                                                                <div key={rating} className="grid gap-2">
                                                                    <Label htmlFor={`template-${rating}`} className="flex items-center gap-2">Template for {rating}-Star Reviews <StarRating rating={rating} /></Label>
                                                                    <Textarea
                                                                        id={`template-${rating}`}
                                                                        value={replyTemplates[rating as keyof typeof replyTemplates]}
                                                                        onChange={(e) => handleTemplateChange(rating, e.target.value)}
                                                                        className="min-h-[100px]"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button>Save Templates</Button>
                                                            </DialogClose>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="brand-tone">Brand Tone</Label>
                                                    <Select onValueChange={(value: 'Professional' | 'Friendly' | 'Humorous') => setBrandTone(value)} defaultValue={brandTone}>
                                                        <SelectTrigger id="brand-tone">
                                                            <SelectValue placeholder="Select tone" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Professional">Professional</SelectItem>
                                                            <SelectItem value="Friendly">Friendly</SelectItem>
                                                            <SelectItem value="Humorous">Humorous</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="brand-sop">Brand SOP for Replies</Label>
                                                <Textarea id="brand-sop" placeholder="e.g., Always offer a discount for negative reviews." value={brandSOP} onChange={e => setBrandSOP(e.target.value)} />
                                            </div>
                                        </div>

                                        <Textarea placeholder="Write your reply..." className="min-h-[120px]" value={replyText} onChange={(e) => setReplyText(e.target.value)} disabled={isGenerating}/>
                                        <div className="flex flex-wrap gap-2 justify-between items-center">
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={applyTemplate} disabled={isGenerating || !selectedReview}>
                                                    <BookText className="mr-2 h-4 w-4" /> Use Template
                                                </Button>

                                                <Button variant="outline" onClick={handleGenerateReply} disabled={isGenerating}>
                                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                                    Generate with AI
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Avg. Reply Time: 2h</span>
                                                </div>
                                                <Button onClick={handleSendReply} disabled={!replyText || isGenerating}>Send Reply</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">Select a review to reply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="insights" className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle>Rating Over Time</CardTitle>
                  <CardDescription>Average rating per month.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <LineChart data={ratingChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis domain={[1, 5]} tickLine={false} axisLine={false} tickMargin={8} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                          <Line type="monotone" dataKey="rating" stroke="var(--color-rating)" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ChartContainer>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle>Sentiment Trend</CardTitle>
                  <CardDescription>Positive, neutral, and negative sentiment over time.</CardDescription>
              </CardHeader>
              <CardContent>
                   <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <AreaChart data={sentimentChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Area dataKey="positive" type="natural" fill="var(--color-positive)" fillOpacity={0.4} stroke="var(--color-positive)" stackId="a" />
                          <Area dataKey="neutral" type="natural" fill="var(--color-neutral)" fillOpacity={0.4} stroke="var(--color-neutral)" stackId="a" />
                          <Area dataKey="negative" type="natural" fill="var(--color-negative)" fillOpacity={0.4} stroke="var(--color-negative)" stackId="a" />
                      </AreaChart>
                  </ChartContainer>
              </CardContent>
          </Card>
        </div>
        <div className="flex justify-end">
            <Select onValueChange={(value) => setSelectedStore(value === 'all' ? undefined : value)} defaultValue="all">
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map(store => (
                        <SelectItem key={store} value={store}>{store}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle>Keyword Cloud</CardTitle>
                     <CardDescription>Most frequent words in reviews.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {insights.keywordCloud.map(([tag, count]) => (
                        <Badge key={tag} variant="outline">{tag} ({count})</Badge>
                    ))}
                    {insights.keywordCloud.length === 0 && <p className="text-sm text-muted-foreground">No data for selected store.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Top Complaints</CardTitle>
                    <CardDescription>Aggregated issues from negative reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        {insights.topComplaints.map(([complaint, count]) => (
                            <li key={complaint} className="flex justify-between"><span>{complaint}</span> <span>{count}</span></li>
                        ))}
                        {insights.topComplaints.length === 0 && <p className="text-sm text-muted-foreground">No complaints for selected store.</p>}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Product Feedback</CardTitle>
                    <CardDescription>Common tags related to products.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {insights.productFeedback.map(([feedback, count]) => (
                        <Badge key={feedback} variant="secondary">{feedback} ({count})</Badge>
                    ))}
                    {insights.productFeedback.length === 0 && <p className="text-sm text-muted-foreground">No product feedback for selected store.</p>}
                </CardContent>
            </Card>
        </div>
         <div className="grid gap-6 md:grid-cols-2">
             <Card>
                <CardHeader>
                    <CardTitle>🔥 Best Performing Stores</CardTitle>
                    <CardDescription>Stores with 4.8+ rating &gt; 10 reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store</TableHead>
                                <TableHead className="text-right">Avg. Rating</TableHead>
                                <TableHead className="text-right">Total Reviews</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                             {bestPerformingStores.map(store => (
                                <TableRow key={store.name}>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell className="text-right">{store.avgRating}</TableCell>
                                    <TableCell className="text-right">{store.reviewCount}</TableCell>
                                </TableRow>
                             ))}
                             {bestPerformingStores.length === 0 && (
                                 <TableRow>
                                     <TableCell colSpan={3} className="text-center text-muted-foreground">No stores meet the criteria.</TableCell>
                                 </TableRow>
                             )}
                         </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive h-5 w-5" /> At-Risk Stores</CardTitle>
                    <CardDescription>Stores with &gt;2 negative reviews in last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store</TableHead>
                                <TableHead className="text-right">Negative Reviews (7d)</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                             {atRiskStores.map(store => (
                                <TableRow key={store.name}>
                                    <TableCell>{store.name}</TableCell>
                                    <TableCell className="text-right">{store.count}</TableCell>
                                </TableRow>
                             ))}
                            {atRiskStores.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No stores are currently at risk.</TableCell>
                                </TableRow>
                            )}
                         </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
       <TabsContent value="action-tracker">
        <Card>
            <CardHeader>
                <CardTitle>Review Action Tracker</CardTitle>
                <CardDescription>Assign and track tasks based on customer reviews.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {actionItems.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="font-medium">{item.task}</div>
                                    <div className="text-sm text-muted-foreground">From review: "{item.review}"</div>
                                </TableCell>
                                <TableCell>{item.assignedTo}</TableCell>
                                <TableCell>{item.dueDate}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem><Check className="mr-2 h-4 w-4" /> Mark as Resolved</DropdownMenuItem>
                                            <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Re-assign</DropdownMenuItem>
                                            <DropdownMenuItem><CalendarIcon className="mr-2 h-4 w-4" /> Change Due Date</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600"><Ban className="mr-2 h-4 w-4" /> Cancel Task</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
            </TabsContent>
      <TabsContent value="store-reviews">
        <Card>
          <CardHeader>
            <CardTitle>Store Reviews</CardTitle>
            <CardDescription>
              Real reviews from Google Business Profile for Business Profile ID: 16058076381455815546, Store ID: 11007263269570993027
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeReviewsError && (
              <div className="text-red-600 text-sm p-4 border border-red-200 rounded-lg bg-red-50">
                <strong>Error:</strong> {storeReviewsError}
                <div className="mt-2 text-xs">
                  <p>To fetch real reviews, you need to:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to the "Google Live" tab and authenticate with Google Business Profile</li>
                    <li>Ensure the Business Profile ID and Store ID are correct</li>
                    <li>Check that the required APIs are enabled in Google Cloud Console</li>
                  </ol>
                </div>
              </div>
            )}
            
            {storeStats && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{storeStats.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {storeStats.averageRating || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            )}

            {storeReviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading reviews from Google Business Profile...</span>
              </div>
            ) : storeReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {storeReviewsError ? 'Failed to load reviews' : 'No reviews found for this store'}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Recent Reviews</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={loadStoreReviews}
                      disabled={storeReviewsLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => loadStoreReviewsDirect()}
                      disabled={storeReviewsLoading}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Direct API Call
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {storeReviews.map((review) => (
                    <div key={review.name || review.reviewId} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {review.reviewer?.profilePhotoUrl && (
                          <img 
                            src={review.reviewer.profilePhotoUrl} 
                            alt={review.reviewer.displayName || 'Reviewer'} 
                            className="h-10 w-10 rounded-full object-cover bg-muted"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              {review.reviewer?.displayName || 'Anonymous'}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-yellow-600">
                                {'★'.repeat(mapStar(review.starRating))}
                                <span className="text-gray-300">
                                  {'★'.repeat(Math.max(0, 5 - mapStar(review.starRating)))}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {mapStar(review.starRating)} stars
                              </Badge>
                            </div>
                          </div>
                          
                          {review.comment && (
                            <p className="text-sm mb-2">{review.comment}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {review.updateTime 
                                ? new Date(review.updateTime).toLocaleString() 
                                : review.createTime 
                                  ? new Date(review.createTime).toLocaleString() 
                                  : 'Unknown date'
                              }
                            </span>
                            <span>
                              <MessageSquare className="h-3 w-3 inline mr-1" />
                              Google Business Profile
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
            <CardHeader>
                <CardTitle>Export / Reports</CardTitle>
                <CardDescription>Download monthly review reports with filters and trends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="grid gap-2">
                        <Label>Report Type</Label>
                        <Select defaultValue="store-wise">
                            <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="store-wise">Store-wise Review Report</SelectItem>
                                <SelectItem value="category">Category Report</SelectItem>
                                <SelectItem value="sla">SLA Report</SelectItem>
                                <SelectItem value="sentiment">Sentiment Snapshot</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label>Store</Label>
                        <Select defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stores</SelectItem>
                                {stores.map(store => (
                                    <SelectItem key={store} value={store}>{store}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                         <Label>Date range</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label>File Format</Label>
                        <Select defaultValue="csv">
                            <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
                 <Button className="w-full lg:w-auto" onClick={handleGenerateReport}>Generate Report</Button>
                 
                 <div>
                    <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report Name</TableHead>
                                <TableHead>Date Generated</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentReports.map(report => (
                                <TableRow key={report.name}>
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell>{report.type}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download {report.format}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
