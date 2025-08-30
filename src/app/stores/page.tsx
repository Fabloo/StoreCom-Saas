'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  Star,
  MessageSquare,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Globe,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  ImageIcon,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { sampleBrand, sampleReviews } from "@/lib/mock-data";

interface Store {
  _id: string;
  brandId: string;
  storeCode: string;
  storeName: string;
  storeSlug: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: string;
    longitude: string;
    placeId?: string;
  };
  primaryCategory: string;
  additionalCategories?: string[];
  tags: string[];
  amenities: {
    parking: boolean;
    delivery: boolean;
  };
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  microsite: {
    heroImage: string;
    heroHint?: string;
    tagline: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    yelp?: string;
    website?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'live' | 'archived';
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>(sampleBrand.stores);
  const [filteredStores, setFilteredStores] = useState<Store[]>(sampleBrand.stores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);

  // Filter stores based on criteria
  useEffect(() => {
    let filtered = stores;

    if (searchQuery) {
      filtered = filtered.filter(store =>
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.storeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(store => store.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store => store.primaryCategory === selectedCategory);
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(store => store.address.city === selectedCity);
    }

    setFilteredStores(filtered);
  }, [stores, searchQuery, selectedStatus, selectedCategory, selectedCity]);

  // Calculate metrics
  const totalStores = stores.length;
  const liveStores = stores.filter(s => s.status === 'live').length;
  const draftStores = stores.filter(s => s.status === 'draft').length;
  const archivedStores = stores.filter(s => s.status === 'archived').length;
  
  // Get unique categories and cities for filters
  const categories = Array.from(new Set(stores.map(s => s.primaryCategory)));
  const cities = Array.from(new Set(stores.map(s => s.address.city)));

  // Calculate store performance metrics
  const getStoreMetrics = (storeId: string) => {
    const storeReviews = sampleReviews.filter(r => r.storeId === storeId);
    if (storeReviews.length === 0) return { rating: 0, reviews: 0, responseRate: 0 };
    
    const rating = storeReviews.reduce((acc, r) => acc + r.rating, 0) / storeReviews.length;
    const reviews = storeReviews.length;
    const responseRate = (storeReviews.filter(r => r.response).length / reviews) * 100;
    
    return { rating, reviews, responseRate };
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleStatusChange = async (storeId: string, newStatus: Store['status']) => {
    const updatedStores = stores.map(store =>
      store._id === storeId
        ? { ...store, status: newStatus, updatedAt: new Date() }
        : store
    );

    setStores(updatedStores);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: Store['status']) => {
    const variants = {
      live: 'default',
      draft: 'secondary',
      archived: 'outline'
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getStatusIcon = (status: Store['status']) => {
    switch (status) {
      case 'live':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'archived':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

    return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores Management</h1>
          <p className="text-muted-foreground">
            Manage all your store locations, microsites, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/stores/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Store
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Stores</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStores}</div>
            <p className="text-xs text-muted-foreground">
              {((liveStores / totalStores) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Stores</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftStores}</div>
            <p className="text-xs text-muted-foreground">
              Pending publication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Stores</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedStores}</div>
            <p className="text-xs text-muted-foreground">
              No longer active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Store Performance Overview</CardTitle>
          <CardDescription>Rating and review metrics across all stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Top Performing Stores</h4>
              {stores
                .map(store => ({ ...store, ...getStoreMetrics(store._id) }))
                .filter(store => store.reviews > 0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((store, index) => (
                  <div key={store._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{store.storeName}</div>
                        <div className="text-sm text-muted-foreground">{store.address.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{store.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{store.reviews} reviews</div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Category Distribution</h4>
              <div className="space-y-3">
                {categories.map(category => {
                  const count = stores.filter(s => s.primaryCategory === category).length;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / totalStores) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Find specific stores using the filters below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
    <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
        <div>
              <CardTitle>Stores ({filteredStores.length})</CardTitle>
            <CardDescription>
                Showing {filteredStores.length} of {totalStores} stores
            </CardDescription>
        </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filter
            </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => {
                const metrics = getStoreMetrics(store._id);
                return (
                  <TableRow key={store._id}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                    <div className="font-medium">{store.storeName}</div>
                    <div className="text-sm text-muted-foreground">{store.storeCode}</div>
                        </div>
                      </div>
                  </TableCell>
                  <TableCell>
                      <div>
                        <div className="font-medium">{store.address.city}, {store.address.state}</div>
                        <div className="text-sm text-muted-foreground">{store.address.line1}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <div>
                        <Badge variant="secondary">{store.primaryCategory}</Badge>
                        {store.additionalCategories && store.additionalCategories.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            +{store.additionalCategories.length} more
                          </div>
                        )}
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="text-center">
                        {metrics.reviews > 0 ? (
                          <>
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{metrics.rating.toFixed(1)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">{metrics.reviews} reviews</div>
                            <div className="text-xs text-muted-foreground">{metrics.responseRate.toFixed(0)}% response</div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">No reviews yet</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(store.status)}
                        {getStatusBadge(store.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(store.updatedAt)}
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
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Store Details - {store.storeName}</DialogTitle>
                              <DialogDescription>
                                Comprehensive view of store information and settings
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div>
                                  <Label>Store Information</Label>
                                  <div className="space-y-2 mt-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Store Code:</span>
                                      <span className="text-sm font-medium">{store.storeCode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Email:</span>
                                      <span className="text-sm font-medium">{store.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Phone:</span>
                                      <span className="text-sm font-medium">{store.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Category:</span>
                                      <span className="text-sm font-medium">{store.primaryCategory}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label>Address</Label>
                                  <div className="mt-2 text-sm">
                                    <p>{store.address.line1}</p>
                                    {store.address.line2 && <p>{store.address.line2}</p>}
                                    <p>{store.address.locality}, {store.address.city}</p>
                                    <p>{store.address.state} {store.address.postalCode}</p>
                                    <p>{store.address.country}</p>
                                  </div>
                                </div>

                                <div>
                                  <Label>Amenities</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant={store.amenities.parking ? 'default' : 'secondary'}>
                                      {store.amenities.parking ? 'Parking' : 'No Parking'}
                                    </Badge>
                                    <Badge variant={store.amenities.delivery ? 'default' : 'secondary'}>
                                      {store.amenities.delivery ? 'Delivery' : 'No Delivery'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label>Performance Metrics</Label>
                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="text-center p-3 bg-gray-50 rounded">
                                      <div className="text-2xl font-bold text-yellow-600">
                                        {metrics.rating > 0 ? metrics.rating.toFixed(1) : 'N/A'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Rating</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {metrics.reviews}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Reviews</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded">
                                      <div className="text-2xl font-bold text-green-600">
                                        {metrics.responseRate.toFixed(0)}%
                                      </div>
                                      <div className="text-sm text-muted-foreground">Response Rate</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded">
                                      <div className="text-2xl font-bold text-purple-600">
                                        {store.tags.length}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Tags</div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label>Quick Actions</Label>
                                  <div className="grid gap-2 mt-2">
                                    <Button variant="outline" size="sm" className="justify-start">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Store
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start">
                                      <BarChart3 className="mr-2 h-4 w-4" />
                                      View Analytics
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start">
                                      <Globe className="mr-2 h-4 w-4" />
                                      View Microsite
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start">
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      View Reviews
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedStore(store);
                                  setIsEditStoreDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Store
                              </Button>
                              <Select
                                value={store.status}
                                onValueChange={(value: Store['status']) => handleStatusChange(store._id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="live">Live</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStore(store);
                            setIsEditStoreDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


    </div>
  );
}
