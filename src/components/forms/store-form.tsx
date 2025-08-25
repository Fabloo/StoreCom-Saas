"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Globe, Image as ImageIcon, MapPin, Search, Store, Info, Clock, Link as LinkIcon, Briefcase } from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStoreSchema, CreateStoreInput } from "@/lib/validation";
import { useStores } from "@/hooks/use-stores";
import { useBrands } from "@/hooks/use-brands";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define a more detailed type for store data
type StoreData = {
    id?: string;
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
    additionalCategories?: string;
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
};

export function StoreForm({ 
  storeData, 
  onSubmit,
  brandId
}: { 
  storeData?: Partial<StoreData>;
  onSubmit?: (data: CreateStoreInput) => Promise<void>;
  brandId?: string;
}) {
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const isEditing = !!storeData;
  const { createStore, updateStore, loading } = useStores();
  const { brands, getBrands } = useBrands();
  const router = useRouter();
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Load brands on component mount
  useEffect(() => {
    getBrands();
  }, [getBrands]);

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      brandId: storeData?.brandId || brandId || "",
      storeCode: storeData?.storeCode || "",
      storeName: storeData?.storeName || "",
      storeSlug: storeData?.storeSlug || "",
      email: storeData?.email || "",
      phone: storeData?.phone || "",
      address: {
        line1: storeData?.address?.line1 || "",
        line2: storeData?.address?.line2 || "",
        locality: storeData?.address?.locality || "",
        city: storeData?.address?.city || "",
        state: storeData?.address?.state || "",
        postalCode: storeData?.address?.postalCode || "",
        country: storeData?.address?.country || "",
        latitude: storeData?.address?.latitude || "",
        longitude: storeData?.address?.longitude || "",
        placeId: storeData?.address?.placeId || "",
      },
      primaryCategory: storeData?.primaryCategory || "",
      additionalCategories: storeData?.additionalCategories || "",
      tags: storeData?.tags || [],
      amenities: {
        parking: storeData?.amenities?.parking || false,
        delivery: storeData?.amenities?.delivery || false,
      },
      hours: storeData?.hours || {
        Monday: { open: "09:00", close: "17:00", closed: false },
        Tuesday: { open: "09:00", close: "17:00", closed: false },
        Wednesday: { open: "09:00", close: "17:00", closed: false },
        Thursday: { open: "09:00", close: "17:00", closed: false },
        Friday: { open: "09:00", close: "17:00", closed: false },
        Saturday: { open: "09:00", close: "17:00", closed: false },
        Sunday: { open: "09:00", close: "17:00", closed: false },
      },
      microsite: {
        heroImage: storeData?.microsite?.heroImage || "https://placehold.co/1200x600.png",
        heroHint: storeData?.microsite?.heroHint || "",
        tagline: storeData?.microsite?.tagline || "",
      },
      socialLinks: {
        facebook: storeData?.socialLinks?.facebook || "",
        twitter: storeData?.socialLinks?.twitter || "",
        instagram: storeData?.socialLinks?.instagram || "",
        yelp: storeData?.socialLinks?.yelp || "",
        website: storeData?.socialLinks?.website || "",
      },
      seo: {
        title: storeData?.seo?.title || "",
        description: storeData?.seo?.description || "",
        keywords: storeData?.seo?.keywords || "",
      },
    },
  });

  // Quick testing helpers
  const fillTestData = () => {
    const currentBrandId = form.getValues('brandId') || brandId || '';
    const testData: CreateStoreInput = {
      brandId: currentBrandId,
      storeCode: 'NYC-001',
      storeName: "Test Store - Midtown",
      storeSlug: 'test-store-midtown',
      email: 'contact@teststore.com',
      phone: '+1-212-555-0123',
      address: {
        line1: '123 Test Ave',
        line2: 'Suite 200',
        locality: 'Midtown',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        latitude: '40.7549',
        longitude: '-73.9840',
        placeId: 'test-place-id-nyc-001'
      },
      primaryCategory: 'Restaurant',
      additionalCategories: 'Cafe, Bakery',
      tags: ['Outdoor Seating', 'Free WiFi', 'Family Friendly'],
      amenities: {
        parking: true,
        delivery: true
      },
      hours: {
        Monday: { open: '09:00', close: '17:00', closed: false },
        Tuesday: { open: '09:00', close: '17:00', closed: false },
        Wednesday: { open: '09:00', close: '17:00', closed: false },
        Thursday: { open: '09:00', close: '17:00', closed: false },
        Friday: { open: '09:00', close: '17:00', closed: false },
        Saturday: { open: '10:00', close: '16:00', closed: false },
        Sunday: { open: '10:00', close: '16:00', closed: true }
      },
      microsite: {
        heroImage: '',
        heroHint: 'storefront',
        tagline: 'Your neighborhood favorite.'
      },
      socialLinks: {
        facebook: 'https://facebook.com/teststore',
        twitter: 'https://twitter.com/teststore',
        instagram: 'https://instagram.com/teststore',
        yelp: '',
        website: 'https://teststore.example.com'
      },
      seo: {
        title: 'Test Store Midtown | Best Eats in NYC',
        description: 'Visit Test Store in Midtown, NYC for great food and friendly service.',
        keywords: 'test store, midtown nyc, restaurant, cafe, bakery'
      }
    };
    form.reset(testData);
  };

  const clearForm = () => {
    const currentBrandId = brandId || '';
    form.reset({
      brandId: currentBrandId,
      storeCode: '',
      storeName: '',
      storeSlug: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        locality: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        latitude: '',
        longitude: '',
        placeId: ''
      },
      primaryCategory: '',
      additionalCategories: '',
      tags: [],
      amenities: {
        parking: false,
        delivery: false
      },
      hours: {
        Monday: { open: '09:00', close: '17:00', closed: false },
        Tuesday: { open: '09:00', close: '17:00', closed: false },
        Wednesday: { open: '09:00', close: '17:00', closed: false },
        Thursday: { open: '09:00', close: '17:00', closed: false },
        Friday: { open: '09:00', close: '17:00', closed: false },
        Saturday: { open: '09:00', close: '17:00', closed: false },
        Sunday: { open: '09:00', close: '17:00', closed: false }
      },
      microsite: {
        heroImage: '',
        heroHint: '',
        tagline: ''
      },
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        yelp: '',
        website: ''
      },
      seo: {
        title: '',
        description: '',
        keywords: ''
      }
    });
  };

  const handleSubmit = async (data: CreateStoreInput) => {
    try {
      if (onSubmit) {
        // Use custom onSubmit if provided (for brand page integration)
        await onSubmit(data);
      } else {
        // Default behavior - use the hooks directly
        if (isEditing && storeData?.id) {
          await updateStore(storeData.id, data);
        } else {
          await createStore(data);
        }
        router.push('/stores');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save store. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle tags input
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    form.setValue('tags', tags);
  };

  // Handle hours changes
  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const currentHours = form.getValues('hours');
    const updatedHours = {
      ...currentHours,
      [day]: {
        ...currentHours[day],
        [field]: value
      }
    };
    form.setValue('hours', updatedHours);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/40">
          <Label htmlFor="gmb-search">Find on Google Maps</Label>
          <div className="flex gap-2">
            <Input id="gmb-search" placeholder="Search by business name or address to auto-fill details..." />
            <Button type="button" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Find
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">This can help you quickly populate the address, contact, and category information.</p>
        </div>
        
        {/* Quick Testing */}
        {!isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Quick Testing</h3>
                <p className="text-sm text-blue-700">Fill all fields with test data to quickly add a sample store</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={fillTestData} className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Fill Test Data
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearForm} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  Clear Form
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto">
                <TabsTrigger value="details"><Store className="mr-2"/>Details</TabsTrigger>
                <TabsTrigger value="business-info"><Briefcase className="mr-2"/>Business Info</TabsTrigger>
                <TabsTrigger value="microsite"><ImageIcon className="mr-2"/>Microsite</TabsTrigger>
                <TabsTrigger value="social"><LinkIcon className="mr-2"/>Social & Web</TabsTrigger>
                <TabsTrigger value="seo"><Globe className="mr-2"/>SEO</TabsTrigger>
            </TabsList>
            
            <div className="pt-6">
                <TabsContent value="details">
                     <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                           <div>
                            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                            <div className="grid gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="brand">Brand *</Label>
                                        <Select 
                                          value={form.watch("brandId")} 
                                          onValueChange={(value) => form.setValue("brandId", value)}
                                        >
                                            <SelectTrigger id="brand">
                                                <SelectValue placeholder="Select brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brands.map((brand) => {
                                                  const id = (brand as any).id ?? (brand as any)._id ?? '';
                                                  const idStr = String(id);
                                                  return (
                                                    <SelectItem key={idStr} value={idStr}>
                                                      {brand.brandName}
                                                    </SelectItem>
                                                  );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.brandId && (
                                            <p className="text-sm text-red-500">{form.formState.errors.brandId.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="store-code">Store Code *</Label>
                                        <Input 
                                            id="store-code" 
                                            placeholder="e.g. NYC-001" 
                                            {...form.register("storeCode")}
                                        />
                                        {form.formState.errors.storeCode && (
                                            <p className="text-sm text-red-500">{form.formState.errors.storeCode.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="store-name">Store Name *</Label>
                                        <Input 
                                            id="store-name" 
                                            placeholder="Main Street Branch" 
                                            {...form.register("storeName")}
                                        />
                                        {form.formState.errors.storeName && (
                                            <p className="text-sm text-red-500">{form.formState.errors.storeName.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="store-slug">Store Slug *</Label>
                                        <Input 
                                            id="store-slug" 
                                            placeholder="main-street-branch" 
                                            {...form.register("storeSlug")}
                                        />
                                        {form.formState.errors.storeSlug && (
                                            <p className="text-sm text-red-500">{form.formState.errors.storeSlug.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            placeholder="contact@store.com" 
                                            {...form.register("email")}
                                        />
                                        {form.formState.errors.email && (
                                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Landline Phone Number</Label>
                                        <Input 
                                            id="phone" 
                                            type="tel" 
                                            placeholder="+1-212-555-0123" 
                                            {...form.register("phone")}
                                        />
                                        {form.formState.errors.phone && (
                                            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                           </div>

                            <Separator />
                            
                            <div>
                                <h3 className="text-lg font-medium mb-4">Address</h3>
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="address-1">Address Line 1 *</Label>
                                            <Input 
                                              id="address-1" 
                                              placeholder="123 Main St" 
                                              {...form.register("address.line1")}
                                            />
                                            {form.formState.errors.address?.line1 && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.line1.message}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="address-2">Address Line 2</Label>
                                            <Input 
                                              id="address-2" 
                                              placeholder="Suite 100" 
                                              {...form.register("address.line2")}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="locality">Locality *</Label>
                                            <Input 
                                              id="locality" 
                                              placeholder="Midtown" 
                                              {...form.register("address.locality")}
                                            />
                                            {form.formState.errors.address?.locality && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.locality.message}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input 
                                              id="city" 
                                              placeholder="New York" 
                                              {...form.register("address.city")}
                                            />
                                            {form.formState.errors.address?.city && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.city.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="postal-code">Postal Code *</Label>
                                            <Input 
                                              id="postal-code" 
                                              placeholder="10001" 
                                              {...form.register("address.postalCode")}
                                            />
                                            {form.formState.errors.address?.postalCode && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.postalCode.message}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input 
                                              id="state" 
                                              placeholder="NY" 
                                              {...form.register("address.state")}
                                            />
                                            {form.formState.errors.address?.state && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.state.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="country-code">Country Code *</Label>
                                            <Input 
                                              id="country-code" 
                                              placeholder="US" 
                                              {...form.register("address.country")}
                                            />
                                            {form.formState.errors.address?.country && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.country.message}</p>
                                            )}
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="place-id">Place ID</Label>
                                            <Input 
                                              id="place-id" 
                                              placeholder="Google Place ID" 
                                              {...form.register("address.placeId")}
                                            />
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="latitude">Latitude *</Label>
                                            <Input 
                                              id="latitude" 
                                              placeholder="40.7128" 
                                              {...form.register("address.latitude")}
                                            />
                                            {form.formState.errors.address?.latitude && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.latitude.message}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="longitude">Longitude *</Label>
                                            <Input 
                                              id="longitude" 
                                              placeholder="-74.0060" 
                                              {...form.register("address.longitude")}
                                            />
                                            {form.formState.errors.address?.longitude && (
                                                <p className="text-sm text-red-500">{form.formState.errors.address.longitude.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-96 md:h-full bg-muted rounded-lg sticky top-24">
                            <Image 
                                src="https://placehold.co/600x800.png" 
                                alt="Store location on map" 
                                width={600} 
                                height={800} 
                                className="w-full h-full object-cover rounded-lg"
                                data-ai-hint="map location"
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="business-info">
                     <div className="grid lg:grid-cols-2 gap-12">
                        <div className="grid gap-6">
                            <h3 className="text-lg font-medium">Business Categories & Tags</h3>
                            <div className="grid gap-2">
                                <Label htmlFor="primary-category">Primary Category *</Label>
                                <Input 
                                  id="primary-category" 
                                  placeholder="e.g., Restaurant" 
                                  {...form.register("primaryCategory")}
                                />
                                {form.formState.errors.primaryCategory && (
                                    <p className="text-sm text-red-500">{form.formState.errors.primaryCategory.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="additional-category">Additional Categories</Label>
                                <Input 
                                  id="additional-category" 
                                  placeholder="e.g., Cafe, Bakery (comma-separated)" 
                                  {...form.register("additionalCategories")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input 
                                  id="tags" 
                                  placeholder="e.g., Outdoor Seating, Free WiFi (comma-separated)" 
                                  value={form.watch("tags").join(', ')}
                                  onChange={(e) => handleTagsChange(e.target.value)}
                                />
                            </div>

                            <Separator className="my-4" />

                            <h3 className="text-lg font-medium">Amenities</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label htmlFor="parking" className="flex flex-col space-y-1">
                                        <span>Parking Available</span>
                                        <span className="font-normal leading-snug text-muted-foreground">
                                        Does the location have parking?
                                        </span>
                                    </Label>
                                    <Switch 
                                      id="parking" 
                                      checked={form.watch("amenities.parking")}
                                      onCheckedChange={(checked) => form.setValue("amenities.parking", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <Label htmlFor="delivery" className="flex flex-col space-y-1">
                                        <span>Delivery Option</span>
                                        <span className="font-normal leading-snug text-muted-foreground">
                                        Does the location offer delivery?
                                        </span>
                                    </Label>
                                    <Switch 
                                      id="delivery" 
                                      checked={form.watch("amenities.delivery")}
                                      onCheckedChange={(checked) => form.setValue("amenities.delivery", checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <h3 className="text-lg font-medium">Hours of Operation</h3>
                            <div className="space-y-4">
                                {weekDays.map(day => (
                                    <div key={day} className="flex items-center gap-4">
                                        <Label className="w-24">{day}</Label>
                                        <Input 
                                          type="time" 
                                          value={form.watch(`hours.${day}.open`)}
                                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                        />
                                        <span>-</span>
                                        <Input 
                                          type="time" 
                                          value={form.watch(`hours.${day}.close`)}
                                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                        />
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Switch 
                                              id={`closed-${day.toLowerCase()}`} 
                                              checked={form.watch(`hours.${day}.closed`)}
                                              onCheckedChange={(checked) => handleHoursChange(day, 'closed', checked)}
                                            />
                                            <Label htmlFor={`closed-${day.toLowerCase()}`}>Closed</Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="microsite">
                    <div className="grid max-w-2xl gap-6">
                        <h3 className="text-lg font-medium">Microsite Content</h3>
                         <div className="grid gap-2">
                            <Label htmlFor="tagline">Tagline / Slogan</Label>
                            <Input 
                              id="tagline" 
                              placeholder="A short, catchy phrase for this location" 
                              {...form.register("microsite.tagline")}
                            />
                            {form.formState.errors.microsite?.tagline && (
                                <p className="text-sm text-red-500">{form.formState.errors.microsite.tagline.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Hero Image</Label>
                            <div className="flex items-center gap-4">
                                <Image 
                                  src={form.watch("microsite.heroImage") || "https://placehold.co/200x100.png"} 
                                  alt="Hero image preview" 
                                  width={200} 
                                  height={100} 
                                  className="rounded-md border object-cover" 
                                  data-ai-hint="storefront" 
                                />
                                <Button type="button" variant="outline">Upload Image</Button>
                            </div>
                             <p className="text-xs text-muted-foreground">Recommended size: 1200x600px.</p>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="social">
                    <div className="grid max-w-2xl gap-6">
                        <h3 className="text-lg font-medium">Social Media & Website Links</h3>
                         <div className="grid gap-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input 
                              id="website" 
                              type="url" 
                              placeholder="https://yourstore.com" 
                              {...form.register("socialLinks.website")}
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="facebook">Facebook URL</Label>
                            <Input 
                              id="facebook" 
                              type="url" 
                              placeholder="https://facebook.com/yourstore" 
                              {...form.register("socialLinks.facebook")}
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="instagram">Instagram URL</Label>
                            <Input 
                              id="instagram" 
                              type="url" 
                              placeholder="https://instagram.com/yourstore" 
                              {...form.register("socialLinks.instagram")}
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="twitter">Twitter / X URL</Label>
                            <Input 
                              id="twitter" 
                              type="url" 
                              placeholder="https://twitter.com/yourstore" 
                              {...form.register("socialLinks.twitter")}
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="yelp">Yelp URL</Label>
                            <Input 
                              id="yelp" 
                              type="url" 
                              placeholder="https://yelp.com/biz/yourstore" 
                              {...form.register("socialLinks.yelp")}
                            />
                        </div>
                    </div>
                </TabsContent>

                 <TabsContent value="seo">
                     <div className="grid max-w-2xl gap-6">
                        <h3 className="text-lg font-medium">SEO Metadata</h3>
                        <p className="text-sm text-muted-foreground -mt-4">This information helps search engines understand and rank your microsite page.</p>
                         <div className="grid gap-2">
                            <Label htmlFor="seo-title">Meta Title *</Label>
                            <Input 
                              id="seo-title" 
                              placeholder="Your Store Name | City, State" 
                              {...form.register("seo.title")}
                            />
                            <p className="text-xs text-muted-foreground">Recommended length: 50-60 characters.</p>
                            {form.formState.errors.seo?.title && (
                                <p className="text-sm text-red-500">{form.formState.errors.seo.title.message}</p>
                            )}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="seo-description">Meta Description *</Label>
                            <Textarea 
                              id="seo-description" 
                              placeholder="A brief, compelling description of your store." 
                              {...form.register("seo.description")}
                            />
                             <p className="text-xs text-muted-foreground">Recommended length: 150-160 characters.</p>
                            {form.formState.errors.seo?.description && (
                                <p className="text-sm text-red-500">{form.formState.errors.seo.description.message}</p>
                            )}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="seo-keywords">Keywords *</Label>
                            <Input 
                              id="seo-keywords" 
                              placeholder="keyword one, keyword two, keyword three" 
                              {...form.register("seo.keywords")}
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated keywords relevant to your business and location.</p>
                            {form.formState.errors.seo?.keywords && (
                                <p className="text-sm text-red-500">{form.formState.errors.seo.keywords.message}</p>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
      
        <div className="mt-8 pt-6 border-t flex justify-end">
            <Button size="lg" type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEditing ? "Update Store" : "Add Store")}
            </Button>
        </div>
    </form>
  );
}
