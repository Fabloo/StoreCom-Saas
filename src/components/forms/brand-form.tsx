'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Globe, MapPin, Palette, Info, ShoppingBag, GalleryHorizontal, Trash2 } from 'lucide-react';
import { CreateBrandInput, UpdateBrandInput } from '@/lib/validation';
import type { BrandData } from '@/lib/validation';
import { ImageUpload } from '@/components/ui/image-upload';
import type { UploadResult } from '@/lib/firebase-storage';

interface BrandFormProps {
  brand?: BrandData;
  onSubmit: (data: CreateBrandInput | UpdateBrandInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const INDUSTRIES = [
  'Restaurant & Food Service',
  'Retail & Shopping',
  'Healthcare & Medical',
  'Automotive',
  'Real Estate',
  'Professional Services',
  'Entertainment & Recreation',
  'Education',
  'Technology',
  'Manufacturing',
  'Construction',
  'Other'
];

const CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Retail Store',
  'Medical Clinic',
  'Dental Office',
  'Auto Repair',
  'Real Estate Agency',
  'Law Firm',
  'Accounting Firm',
  'Gym',
  'Salon',
  'Pet Store',
  'Other'
];

const TEMPLATES = [
  { value: 'classic', label: 'Classic', description: 'Professional, clean layout' },
  { value: 'modern', label: 'Modern', description: 'Visually-driven with large images' },
  { value: 'bold', label: 'Bold', description: 'Minimalist with strong typography' }
];

export default function BrandForm({ brand, onSubmit, onCancel, loading = false }: BrandFormProps) {
  const [formData, setFormData] = useState<CreateBrandInput>({
    brandName: brand?.brandName || '',
    brandSlug: brand?.brandSlug || '',
    description: brand?.description || '',
    logo: brand?.logo || '',
    website: brand?.website || '',
    email: brand?.email || '',
    phone: brand?.phone || '',
    industry: brand?.industry || '',
    primaryCategory: brand?.primaryCategory || '',
    additionalCategories: brand?.additionalCategories || [],
    address: {
      line1: brand?.address.line1 || '',
      line2: brand?.address.line2 || '',
      locality: brand?.address.locality || '',
      city: brand?.address.city || '',
      state: brand?.address.state || '',
      postalCode: brand?.address.postalCode || '',
      country: brand?.address.country || '',
      latitude: brand?.address.latitude || '',
      longitude: brand?.address.longitude || '',
      placeId: brand?.address.placeId || '',
    },
    branding: {
      primaryColor: brand?.branding.primaryColor || '#2962FF',
      accentColor: brand?.branding.accentColor || '#FF9100',
      backgroundColor: brand?.branding.backgroundColor || '#E6EEFF',
      fontFamily: brand?.branding.fontFamily || 'Inter',
      template: brand?.branding.template || 'classic',
    },
    content: {
      aboutSection: brand?.content.aboutSection || '',
      missionStatement: brand?.content.missionStatement || '',
      valueProposition: brand?.content.valueProposition || '',
    },
    products: brand?.products || [],
    gallery: brand?.gallery || [],
    socialLinks: {
      facebook: brand?.socialLinks.facebook || '',
      twitter: brand?.socialLinks.twitter || '',
      instagram: brand?.socialLinks.instagram || '',
      linkedin: brand?.socialLinks.linkedin || '',
      youtube: brand?.socialLinks.youtube || '',
    },
    seo: {
      title: brand?.seo.title || '',
      description: brand?.seo.description || '',
      keywords: brand?.seo.keywords || '',
    },
    googleBusiness: {
      accountId: brand?.googleBusiness.accountId || '',
      locationId: brand?.googleBusiness.locationId || '',
      isConnected: brand?.googleBusiness.isConnected || false,
    },
    settings: {
      autoSyncWithGMB: brand?.settings.autoSyncWithGMB || false,
      reviewNotifications: brand?.settings.reviewNotifications || true,
      postNotifications: brand?.settings.postNotifications || true,
    },
  });

  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: '', description: '' });
  const [newGalleryImage, setNewGalleryImage] = useState({ src: '', alt: '', caption: '' });
  const [newCategory, setNewCategory] = useState('');

  // Calculate completion percentage for required fields
  const getCompletionPercentage = () => {
    const requiredFields = [
      formData.brandName.trim(),
      formData.brandSlug.trim(),
      formData.email.trim(),
      formData.industry.trim(),
      formData.primaryCategory.trim(),
      formData.address.line1.trim(),
      formData.address.locality.trim(),
      formData.address.city.trim(),
      formData.address.state.trim(),
      formData.address.postalCode.trim(),
      formData.address.country.trim(),
      formData.address.latitude.trim(),
      formData.address.longitude.trim(),
    ];

    const completedFields = requiredFields.filter(field => field).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = {
      brandName: formData.brandName.trim(),
      brandSlug: formData.brandSlug.trim(),
      email: formData.email.trim(),
      industry: formData.industry.trim(),
      primaryCategory: formData.primaryCategory.trim(),
      address: {
        line1: formData.address.line1.trim(),
        locality: formData.address.locality.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        postalCode: formData.address.postalCode.trim(),
        country: formData.address.country.trim(),
        latitude: formData.address.latitude.trim(),
        longitude: formData.address.longitude.trim(),
      }
    };

    // Check if all required fields have values
    const hasRequiredValues = 
      requiredFields.brandName &&
      requiredFields.brandSlug &&
      requiredFields.email &&
      requiredFields.industry &&
      requiredFields.primaryCategory &&
      requiredFields.address.line1 &&
      requiredFields.address.locality &&
      requiredFields.address.city &&
      requiredFields.address.state &&
      requiredFields.address.postalCode &&
      requiredFields.address.country &&
      requiredFields.address.latitude &&
      requiredFields.address.longitude;

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(requiredFields.email);

    // Check if brand slug follows the correct format (lowercase, hyphens, no spaces)
    const slugRegex = /^[a-z0-9-]+$/;
    const isSlugValid = slugRegex.test(requiredFields.brandSlug);

    // Check if coordinates are valid numbers
    const isLatitudeValid = !isNaN(Number(requiredFields.address.latitude)) && 
                           Number(requiredFields.address.latitude) >= -90 && 
                           Number(requiredFields.address.latitude) <= 90;
    const isLongitudeValid = !isNaN(Number(requiredFields.address.longitude)) && 
                             Number(requiredFields.address.longitude) >= -180 && 
                             Number(requiredFields.address.longitude) <= 180;

    return hasRequiredValues && isEmailValid && isSlugValid && isLatitudeValid && isLongitudeValid;
  };

  // Helper function to check if a specific field is valid
  const isFieldValid = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'email':
        return value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      case 'brandSlug':
        return value.trim() && /^[a-z0-9-]+$/.test(value.trim());
      case 'latitude':
        return value.trim() && !isNaN(Number(value)) && Number(value) >= -90 && Number(value) <= 90;
      case 'longitude':
        return value.trim() && !isNaN(Number(value)) && Number(value) >= -180 && Number(value) <= 180;
      default:
        return value.trim().length > 0;
    }
  };

  // Function to fill test data for easy testing
  const fillTestData = () => {
    const testData: CreateBrandInput = {
      brandName: "Test Brand Restaurant",
      brandSlug: "test-brand-restaurant",
      description: "A delicious test restaurant brand for microsite testing and development purposes.",
      logo: "",
      website: "https://testbrand.com",
      email: "test@testbrand.com",
      phone: "+1-555-123-4567",
      industry: "Restaurant & Food Service",
      primaryCategory: "Restaurant",
      additionalCategories: ["Cafe", "Fast Food"],
      address: {
        line1: "123 Test Street",
        line2: "Suite 100",
        locality: "Downtown",
        city: "Test City",
        state: "TS",
        postalCode: "12345",
        country: "United States",
        latitude: "40.7128",
        longitude: "-74.0060",
        placeId: "test-place-id-123",
      },
      branding: {
        primaryColor: "#FF6B35",
        accentColor: "#FFD23F",
        backgroundColor: "#FFF8E1",
        fontFamily: "Inter",
        template: "modern",
      },
      content: {
        aboutSection: "Test Brand Restaurant is a fictional establishment created for testing microsite functionality. We serve delicious test meals in a welcoming atmosphere.",
        missionStatement: "To provide the best testing experience for developers and designers",
        valueProposition: "Quality test data, fast development, excellent user experience",
      },
      products: [
        {
          name: "Test Burger",
          category: "Burgers",
          price: "$12.99",
          image: "https://placehold.co/300x200.png",
          description: "A delicious test burger with all the fixings",
        },
        {
          name: "Test Pizza",
          category: "Pizza",
          price: "$18.99",
          image: "https://placehold.co/300x200.png",
          description: "Fresh test pizza with premium toppings",
        },
        {
          name: "Test Salad",
          category: "Salads",
          price: "$9.99",
          image: "https://placehold.co/300x200.png",
          description: "Healthy test salad with fresh vegetables",
        },
      ],
      gallery: [
        // {
        //   src: "https://placehold.co/400x300.png",
        //   alt: "Restaurant Interior",
        //   caption: "Our cozy dining area",
        // },
        // {
        //   src: "https://placehold.co/400x300.png",
        //   alt: "Food Display",
        //   caption: "Delicious test meals",
        // },
        // {
        //   src: "https://placehold.co/400x300.png",
        //   alt: "Chef at Work",
        //   caption: "Our talented test chef",
        // },
      ],
      socialLinks: {
        facebook: "https://facebook.com/testbrand",
        twitter: "https://twitter.com/testbrand",
        instagram: "https://instagram.com/testbrand",
        linkedin: "https://linkedin.com/company/testbrand",
        youtube: "https://youtube.com/testbrand",
      },
      seo: {
        title: "Test Brand Restaurant - Best Food in Test City",
        description: "Visit Test Brand Restaurant for delicious test meals in Test City. Quality food, great service, and a welcoming atmosphere.",
        keywords: "test restaurant, test city, food, dining, burgers, pizza, salad",
      },
      googleBusiness: {
        accountId: "test-gmb-account-123",
        locationId: "test-gmb-location-456",
        isConnected: true,
        lastSync: new Date(),
      },
      settings: {
        autoSyncWithGMB: true,
        reviewNotifications: true,
        postNotifications: true,
      },
    };

    setFormData(testData);
  };

  // Function to clear form data
  const clearForm = () => {
    const emptyData: CreateBrandInput = {
      brandName: '',
      brandSlug: '',
      description: '',
      logo: '',
      website: '',
      email: '',
      phone: '',
      industry: '',
      primaryCategory: '',
      additionalCategories: [],
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
        placeId: '',
      },
      branding: {
        primaryColor: '#2962FF',
        accentColor: '#FF9100',
        backgroundColor: '#E6EEFF',
        fontFamily: 'Inter',
        template: 'classic',
      },
      content: {
        aboutSection: '',
        missionStatement: '',
        valueProposition: '',
      },
      products: [],
      gallery: [],
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
      },
      seo: {
        title: '',
        description: '',
        keywords: '',
      },
      googleBusiness: {
        accountId: '',
        locationId: '',
        isConnected: false,
        lastSync: undefined,
      },
      settings: {
        autoSyncWithGMB: false,
        reviewNotifications: true,
        postNotifications: true,
      },
    };

    setFormData(emptyData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleBrandingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const handleSocialLinksChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  const handleSEOChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleSettingsChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { ...newProduct }]
      }));
      setNewProduct({ name: '', category: '', price: '', image: '', description: '' });
    }
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const addGalleryImage = () => {
    if (newGalleryImage.src && newGalleryImage.alt) {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, { ...newGalleryImage }]
      }));
      setNewGalleryImage({ src: '', alt: '', caption: '' });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const addCategory = () => {
    if (newCategory && !formData.additionalCategories.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        additionalCategories: [...prev.additionalCategories, newCategory]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      additionalCategories: prev.additionalCategories.filter(c => c !== category)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Form Completion</span>
          <span className="text-sm text-gray-500">{getCompletionPercentage()}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">
          {getCompletionPercentage() === 100 ? 'All required fields completed! You can now create your brand.' : 'Complete all required fields to create your brand.'}
        </p>
      </div>

      {/* Test Data Button */}
      {!brand && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">Quick Testing</h3>
              <p className="text-sm text-blue-700">Fill all fields with test data to quickly test the microsite creation flow</p>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={fillTestData}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Fill Test Data
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={clearForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Clear Form
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential brand details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandSlug">Brand Slug *</Label>
                  <Input
                    id="brandSlug"
                    value={formData.brandSlug}
                    onChange={(e) => handleInputChange('brandSlug', e.target.value)}
                    placeholder="brand-slug"
                    required
                    className={formData.brandSlug ? (isFieldValid('brandSlug', formData.brandSlug) ? 'border-green-500' : 'border-red-500') : ''}
                  />
                  {formData.brandSlug && !isFieldValid('brandSlug', formData.brandSlug) && (
                    <p className="text-sm text-red-600">Brand slug must contain only lowercase letters, numbers, and hyphens</p>
                  )}
                  <p className="text-xs text-gray-500">Example: my-brand-name, brand123, company-name</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your brand"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <ImageUpload
                    onImagesUploaded={(images) => {
                      if (images.length > 0) {
                        handleInputChange('logo', images[0].url);
                      }
                    }}
                    multiple={false}
                    maxFiles={1}
                    folder="logos"
                    existingImages={formData.logo ? [formData.logo] : []}
                    className="w-full"
                  />
                  {formData.logo && (
                    <div className="mt-2">
                      <img 
                        src={formData.logo} 
                        alt="Brand logo" 
                        className="w-16 h-16 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@brand.com"
                    required
                    className={formData.email ? (isFieldValid('email', formData.email) ? 'border-green-500' : 'border-red-500') : ''}
                  />
                  {formData.email && !isFieldValid('email', formData.email) && (
                    <p className="text-sm text-red-600">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryCategory">Primary Category *</Label>
                  <Select value={formData.primaryCategory} onValueChange={(value) => handleInputChange('primaryCategory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Categories</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add category"
                  />
                  <Button type="button" onClick={addCategory} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.additionalCategories.map(category => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCategory(category)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Physical location and coordinates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={formData.address.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.address.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  placeholder="Suite 100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locality">Locality *</Label>
                  <Input
                    id="locality"
                    value={formData.address.locality}
                    onChange={(e) => handleAddressChange('locality', e.target.value)}
                    placeholder="Downtown"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="New York"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="NY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="10001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    value={formData.address.latitude}
                    onChange={(e) => handleAddressChange('latitude', e.target.value)}
                    placeholder="40.7128"
                    required
                    className={formData.address.latitude ? (isFieldValid('latitude', formData.address.latitude) ? 'border-green-500' : 'border-red-500') : ''}
                  />
                  {formData.address.latitude && !isFieldValid('latitude', formData.address.latitude) && (
                    <p className="text-sm text-red-600">Latitude must be a valid number between -90 and 90</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    value={formData.address.longitude}
                    onChange={(e) => handleAddressChange('longitude', e.target.value)}
                    placeholder="-74.0060"
                    required
                    className={formData.address.longitude ? (isFieldValid('longitude', formData.address.longitude) ? 'border-green-500' : 'border-red-500') : ''}
                  />
                  {formData.address.longitude && !isFieldValid('longitude', formData.address.longitude) && (
                    <p className="text-sm text-red-600">Longitude must be a valid number between -180 and 180</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Design</CardTitle>
              <CardDescription>Visual identity and design preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      placeholder="#2962FF"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.branding.accentColor}
                      onChange={(e) => handleBrandingChange('accentColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.branding.accentColor}
                      onChange={(e) => handleBrandingChange('accentColor', e.target.value)}
                      placeholder="#FF9100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.branding.backgroundColor}
                      onChange={(e) => handleBrandingChange('backgroundColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.branding.backgroundColor}
                      onChange={(e) => handleBrandingChange('backgroundColor', e.target.value)}
                      placeholder="#E6EEFF"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Input
                    id="fontFamily"
                    value={formData.branding.fontFamily}
                    onChange={(e) => handleBrandingChange('fontFamily', e.target.value)}
                    placeholder="Inter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={formData.branding.template} onValueChange={(value) => handleBrandingChange('template', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map(template => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label} - {template.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content & Messaging</CardTitle>
              <CardDescription>Brand content and messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutSection">About Section</Label>
                <Textarea
                  id="aboutSection"
                  value={formData.content.aboutSection}
                  onChange={(e) => handleContentChange('aboutSection', e.target.value)}
                  placeholder="Tell your brand story..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="missionStatement">Mission Statement</Label>
                <Textarea
                  id="missionStatement"
                  value={formData.content.missionStatement}
                  onChange={(e) => handleContentChange('missionStatement', e.target.value)}
                  placeholder="Your brand's mission..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valueProposition">Value Proposition</Label>
                <Textarea
                  id="valueProposition"
                  value={formData.content.valueProposition}
                  onChange={(e) => handleContentChange('valueProposition', e.target.value)}
                  placeholder="What makes your brand unique..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
              <CardDescription>Add your products and services catalog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add New Product</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Product category"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="$10.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={newProduct.image}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                    rows={2}
                  />
                </div>
                <Button type="button" onClick={addProduct} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Current Products</Label>
                <div className="space-y-2">
                  {formData.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category} • {product.price}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>Upload and manage brand images for your microsite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Firebase Image Upload */}
              <div className="space-y-4">
                <Label>Upload Images</Label>
                <ImageUpload
                  onImagesUploaded={(images) => {
                    const newGalleryItems = images.map(img => ({
                      src: img.url,
                      alt: img.name,
                      caption: ''
                    }));
                    setFormData(prev => ({
                      ...prev,
                      gallery: [...prev.gallery, ...newGalleryItems]
                    }));
                  }}
                  onImagesRemoved={(imagePaths) => {
                    // Remove images from gallery that match the deleted paths
                    setFormData(prev => ({
                      ...prev,
                      gallery: prev.gallery.filter(item => 
                        !imagePaths.some(path => item.src.includes(path))
                      )
                    }));
                  }}
                  multiple={true}
                  maxFiles={20}
                  folder="brands"
                  existingImages={formData.gallery.map(item => item.src)}
                  className="w-full"
                />
              </div>

              {/* Gallery Management */}
              {formData.gallery.length > 0 && (
                <div className="space-y-4">
                  <Label>Gallery Images ({formData.gallery.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.gallery.map((item, index) => (
                      <Card key={index} className="relative group">
                        <CardContent className="p-2">
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 space-y-2">
                            <Input
                              placeholder="Alt text"
                              value={item.alt}
                              onChange={(e) => {
                                const newGallery = [...formData.gallery];
                                newGallery[index].alt = e.target.value;
                                setFormData(prev => ({ ...prev, gallery: newGallery }));
                              }}
                              className="text-xs"
                            />
                            <Input
                              placeholder="Caption (optional)"
                              value={item.caption || ''}
                              onChange={(e) => {
                                const newGallery = [...formData.gallery];
                                newGallery[index].caption = e.target.value;
                                setFormData(prev => ({ ...prev, gallery: newGallery }));
                              }}
                              className="text-xs"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings & Integration</CardTitle>
              <CardDescription>Configure brand settings and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Google My Business Integration</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Connect to Google My Business</Label>
                    <p className="text-sm text-gray-500">Automatically sync brand information with Google My Business</p>
                  </div>
                  <Switch
                    checked={formData.googleBusiness.isConnected}
                    onCheckedChange={(checked) => handleInputChange('googleBusiness', { ...formData.googleBusiness, isConnected: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Automation Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-sync with Google My Business</Label>
                      <p className="text-sm text-gray-500">Automatically sync changes with Google My Business</p>
                    </div>
                    <Switch
                      checked={formData.settings.autoSyncWithGMB}
                      onCheckedChange={(checked) => handleSettingsChange('autoSyncWithGMB', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Review Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications for new reviews</p>
                    </div>
                    <Switch
                      checked={formData.settings.reviewNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('reviewNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Post Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications for new posts</p>
                    </div>
                    <Switch
                      checked={formData.settings.postNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('postNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">SEO Settings</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seo.title}
                      onChange={(e) => handleSEOChange('title', e.target.value)}
                      placeholder="Brand Name - Primary Category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seo.description}
                      onChange={(e) => handleSEOChange('description', e.target.value)}
                      placeholder="Brief description for search engines"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoKeywords">SEO Keywords</Label>
                    <Input
                      id="seoKeywords"
                      value={formData.seo.keywords}
                      onChange={(e) => handleSEOChange('keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialLinks.facebook}
                      onChange={(e) => handleSocialLinksChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialLinksChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialLinksChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialLinksChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.socialLinks.youtube}
                      onChange={(e) => handleSocialLinksChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/brand"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Summary */}
      {!isFormValid() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Complete Required Fields
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please fill in all required fields marked with * to create your brand:</p>
                <ul className="mt-2 space-y-1">
                  {!formData.brandName.trim() && <li>• Brand Name</li>}
                  {!formData.brandSlug.trim() && <li>• Brand Slug</li>}
                  {!formData.email.trim() && <li>• Email Address</li>}
                  {!formData.industry.trim() && <li>• Industry</li>}
                  {!formData.primaryCategory.trim() && <li>• Primary Category</li>}
                  {!formData.address.line1.trim() && <li>• Address Line 1</li>}
                  {!formData.address.locality.trim() && <li>• Locality</li>}
                  {!formData.address.city.trim() && <li>• City</li>}
                  {!formData.address.state.trim() && <li>• State</li>}
                  {!formData.address.postalCode.trim() && <li>• Postal Code</li>}
                  {!formData.address.country.trim() && <li>• Country</li>}
                  {!formData.address.latitude.trim() && <li>• Latitude</li>}
                  {!formData.address.longitude.trim() && <li>• Longitude</li>}
                </ul>
                {formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && (
                  <p className="mt-2">• Email format is invalid</p>
                )}
                {formData.brandSlug.trim() && !/^[a-z0-9-]+$/.test(formData.brandSlug.trim()) && (
                  <p className="mt-2">• Brand slug must contain only lowercase letters, numbers, and hyphens</p>
                )}
                {formData.address.latitude.trim() && (isNaN(Number(formData.address.latitude)) || Number(formData.address.latitude) < -90 || Number(formData.address.latitude) > 90) && (
                  <p className="mt-2">• Latitude must be a valid number between -90 and 90</p>
                )}
                {formData.address.longitude.trim() && (isNaN(Number(formData.address.longitude)) || Number(formData.address.longitude) < -180 || Number(formData.address.longitude) > 180) && (
                  <p className="mt-2">• Longitude must be a valid number between -180 and 180</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !isFormValid()}>
          {loading ? 'Saving...' : brand ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </form>
  );
} 