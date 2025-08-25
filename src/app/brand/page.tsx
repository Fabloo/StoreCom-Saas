"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Palette, Info, ShoppingBag, GalleryHorizontal, PlusCircle, Upload, LayoutTemplate, Save, Loader2, ArrowLeft, Store, Globe, MapPin, Users, Settings } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBrands } from "@/hooks/use-brands";
import { useStores } from "@/hooks/use-stores";
import { useState, useEffect, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BrandData, CreateStoreInput, StoreData } from "@/lib/validation";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrandSelector } from "@/components/ui/brand-selector";
import { StoreForm } from "@/components/forms/store-form";

function BrandPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get('brand');
  
  const { getBrand, updateBrand, loading, error } = useBrands();
  const { getStores, createStore, updateStore, deleteStore } = useStores();
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [showBrandSelector, setShowBrandSelector] = useState(!brandId);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    branding: {
      primaryColor: "#2962FF",
      accentColor: "#FF9100",
      backgroundColor: "#E6EEFF",
      fontFamily: "Inter",
      template: "classic" as "classic" | "modern" | "bold",
    },
    content: {
      aboutSection: "",
    },
    products: [] as Array<{
      name: string;
      category: string;
      price: string;
      image: string;
      description?: string;
    }>,
    gallery: [] as Array<{
      src: string;
      alt: string;
      caption?: string;
    }>,
  });

  // Load brand data when brandId changes
  useEffect(() => {
    if (brandId) {
      loadBrand(brandId);
      loadStores(brandId);
    }
  }, [brandId]);

  const loadBrand = async (id: string) => {
    try {
      const brandData = await getBrand(id);
      if (brandData) {
        setBrand(brandData);
        setFormData({
          branding: {
            primaryColor: brandData.branding.primaryColor || "#2962FF",
            accentColor: brandData.branding.accentColor || "#FF9100",
            backgroundColor: brandData.branding.backgroundColor || "#E6EEFF",
            fontFamily: brandData.branding.fontFamily || "Inter",
            template: brandData.branding.template || "classic",
          },
          content: {
            aboutSection: brandData.content.aboutSection || "",
          },
          products: brandData.products || [],
          gallery: brandData.gallery || [],
        });
        setShowBrandSelector(false);
      } else {
        toast({
          title: "Error",
          description: "Brand not found",
          variant: "destructive",
        });
        setShowBrandSelector(true);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load brand data",
        variant: "destructive",
      });
      setShowBrandSelector(true);
    }
  };

  const loadStores = async (brandId: string) => {
    try {
      const storesData = await getStores(brandId);
      setStores(storesData);
    } catch (err) {
      console.error('Failed to load stores:', err);
    }
  };

  const handleBrandSelect = (selectedBrand: BrandData) => {
    setBrand(selectedBrand);
    setShowBrandSelector(false);
    router.push(`/brand?brand=${selectedBrand.id}`);
  };

  // Handle form updates
  const updateFormData = (section: keyof typeof formData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle product updates
  const updateProduct = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  // Add new product
  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        name: "",
        category: "",
        price: "",
        image: "https://placehold.co/100x100.png",
        description: "",
      }],
    }));
  };

  // Remove product
  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // Add gallery image
  const addGalleryImage = () => {
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, {
        src: "https://placehold.co/400x300.png",
        alt: "",
        caption: "",
      }],
    }));
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  // Save changes
  const saveChanges = async () => {
    if (!brand) return;

    setIsSaving(true);
    try {
              await updateBrand(brand.id!.toString(), {
        branding: formData.branding,
        content: formData.content,
        products: formData.products,
        gallery: formData.gallery,
      });

      toast({
        title: "Success",
        description: "Brand settings saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save brand settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Store management functions
  const handleCreateStore = async (storeData: CreateStoreInput) => {
    try {
      await createStore(storeData);
      await loadStores(brandId!);
      setShowStoreForm(false);
      toast({
        title: "Success",
        description: "Store created successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create store",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStore = async (storeId: string, storeData: CreateStoreInput) => {
    try {
      await updateStore(storeId, storeData);
      await loadStores(brandId!);
      setEditingStore(null);
      toast({
        title: "Success",
        description: "Store updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update store",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(storeId);
        await loadStores(brandId!);
        toast({
          title: "Success",
          description: "Store deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete store",
          variant: "destructive",
        });
      }
    }
  };

  const openStoreForm = (store?: StoreData) => {
    if (store) {
      setEditingStore(store);
    } else {
      setEditingStore(null);
    }
    setShowStoreForm(true);
  };

  // Show brand selector if no brand is selected
  if (showBrandSelector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brand Settings</h1>
            <p className="text-gray-600">Manage brand-wide assets, content, and appearance</p>
          </div>
        </div>
        <BrandSelector onBrandSelect={handleBrandSelect} selectedBrand={brand} />
      </div>
    );
  }

  if (loading && !brand) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading brand data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && !brand) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load brand data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show store form if needed
  if (showStoreForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStoreForm(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Brand
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </h1>
              <p className="text-gray-600">
                {editingStore ? 'Update store information' : 'Create a new store for your brand'}
              </p>
            </div>
          </div>
        </div>
        
        <StoreForm 
          storeData={editingStore || undefined} 
          brandId={brandId || undefined}
          onSubmit={editingStore ? 
            (data) => handleUpdateStore(editingStore.id!, data) : 
            handleCreateStore
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBrandSelector(true)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Brand
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Brand Settings</h1>
            <p className="text-gray-600">
              Managing settings for {brand?.brandName}
            </p>
          </div>
        </div>
        <Button onClick={saveChanges} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 h-auto">
              <TabsTrigger value="identity"><Palette className="mr-2"/>Identity</TabsTrigger>
              <TabsTrigger value="content"><Info className="mr-2"/>Content</TabsTrigger>
              <TabsTrigger value="products"><ShoppingBag className="mr-2"/>Products & Services</TabsTrigger>
              <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2"/>Gallery</TabsTrigger>
              <TabsTrigger value="microsite"><Store className="mr-2"/>Microsite & Stores</TabsTrigger>
            </TabsList>

            <div className="pt-6">
              <TabsContent value="identity">
                  <div className="grid lg:grid-cols-3 gap-12">
                      <div className="lg:col-span-2 grid gap-6">
                          <h3 className="text-lg font-medium">Logo</h3>
                           <div className="flex items-center gap-6">
                              <Image 
                                src={brand?.logo || "https://placehold.co/100x100.png"} 
                                alt="Brand Logo" 
                                width={100} 
                                height={100} 
                                className="rounded-lg border p-2" 
                                data-ai-hint="logo" 
                              />
                              <div>
                                   <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Upload New Logo</Button>
                                   <p className="text-xs text-muted-foreground mt-2">Recommended size: 200x200px, PNG format.</p>
                              </div>
                           </div>
                          <Separator />
                          <h3 className="text-lg font-medium">Colors & Fonts</h3>
                          <div className="grid sm:grid-cols-2 gap-6">
                              <div className="grid gap-2">
                                  <Label>Primary Color</Label>
                                  <Input 
                                    type="color" 
                                    value={formData.branding.primaryColor}
                                    onChange={(e) => updateFormData('branding', 'primaryColor', e.target.value)}
                                    className="h-12" 
                                  />
                              </div>
                              <div className="grid gap-2">
                                  <Label>Accent Color</Label>
                                  <Input 
                                    type="color" 
                                    value={formData.branding.accentColor}
                                    onChange={(e) => updateFormData('branding', 'accentColor', e.target.value)}
                                    className="h-12" 
                                  />
                              </div>
                               <div className="grid gap-2">
                                  <Label>Background Color</Label>
                                  <Input 
                                    type="color" 
                                    value={formData.branding.backgroundColor}
                                    onChange={(e) => updateFormData('branding', 'backgroundColor', e.target.value)}
                                    className="h-12" 
                                  />
                              </div>
                              <div className="grid gap-2">
                                  <Label>Font Family</Label>
                                  <Input 
                                    value={formData.branding.fontFamily}
                                    onChange={(e) => updateFormData('branding', 'fontFamily', e.target.value)}
                                  />
                              </div>
                          </div>
                          <Separator />
                          <h3 className="text-lg font-medium">Microsite Template</h3>
                          <RadioGroup 
                            value={formData.branding.template} 
                            onValueChange={(value) => updateFormData('branding', 'template', value)}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                          >
                              <div>
                                  <RadioGroupItem value="classic" id="template-classic" className="peer sr-only" />
                                  <Label htmlFor="template-classic" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                      <LayoutTemplate className="mb-3 h-6 w-6" />
                                      Classic
                                       <Image src="https://placehold.co/200x150.png" alt="Classic Template Preview" width={200} height={150} className="rounded-md object-cover mt-2 aspect-video" data-ai-hint="website template" />
                                      <span className="text-xs text-center text-muted-foreground mt-2">A professional, clean layout. Good for service-based businesses.</span>
                                  </Label>
                              </div>
                               <div>
                                  <RadioGroupItem value="modern" id="template-modern" className="peer sr-only" />
                                  <Label htmlFor="template-modern" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                      <LayoutTemplate className="mb-3 h-6 w-6" />
                                      Modern
                                      <Image src="https://placehold.co/200x150.png" alt="Modern Template Preview" width={200} height={150} className="rounded-md object-cover mt-2 aspect-video" data-ai-hint="modern website" />
                                       <span className="text-xs text-center text-muted-foreground mt-2">Visually-driven layout with large images. Great for restaurants or retail.</span>
                                  </Label>
                              </div>
                               <div>
                                  <RadioGroupItem value="bold" id="template-bold" className="peer sr-only" />
                                  <Label htmlFor="template-bold" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                      <LayoutTemplate className="mb-3 h-6 w-6" />
                                      Bold
                                       <Image src="https://placehold.co/200x150.png" alt="Bold Template Preview" width={200} height={150} className="rounded-md object-cover mt-2 aspect-video" data-ai-hint="minimalist website" />
                                       <span className="text-xs text-center text-muted-foreground mt-2">A minimalist layout with strong typography. Ideal for boutique brands.</span>
                                  </Label>
                              </div>
                          </RadioGroup>
                      </div>
                       <div className="bg-muted/40 p-6 rounded-lg">
                          <h4 className="font-semibold mb-2">Theme Preview</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                              Changes here will apply globally to all microsites.
                          </p>
                          <div className="border bg-background p-4 rounded-lg">
                              <h3 className="font-bold text-lg" style={{ color: formData.branding.primaryColor, fontFamily: formData.branding.fontFamily }}>Microsite Title</h3>
                              <p className="text-sm mt-1" style={{ fontFamily: formData.branding.fontFamily }}>This is how your body text will look.</p>
                              <Button className="mt-4" style={{ backgroundColor: formData.branding.accentColor, color: 'white', fontFamily: formData.branding.fontFamily }}>Call to Action</Button>
                          </div>
                      </div>
                  </div>
              </TabsContent>
              
              <TabsContent value="content">
                  <h3 className="text-lg font-medium mb-4">Brand-Level Content</h3>
                   <div className="grid gap-6">
                      <div className="grid gap-2">
                          <Label htmlFor="about-section">Main "About" Section</Label>
                          <Textarea 
                            id="about-section" 
                            placeholder="Write a compelling story about your brand..." 
                            rows={12}
                            value={formData.content.aboutSection}
                            onChange={(e) => updateFormData('content', 'aboutSection', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">This content will appear on all store microsites.</p>
                      </div>
                  </div>
              </TabsContent>

              <TabsContent value="products">
                  <div className="flex justify-between items-center mb-4">
                      <div>
                          <h3 className="text-lg font-medium">Product & Service Catalog</h3>
                          <p className="text-sm text-muted-foreground">This catalog is available to all stores.</p>
                      </div>
                      <Button onClick={addProduct}><PlusCircle className="mr-2 h-4 w-4"/> Add Product</Button>
                  </div>
                  <div className="border rounded-lg">
                       <table className="w-full">
                          <thead className="bg-muted/50">
                              <tr className="border-b">
                                  <th className="p-3 text-left">Product Name</th>
                                  <th className="p-3 text-left hidden sm:table-cell">Category</th>
                                  <th className="p-3 text-left">Price</th>
                                  <th className="p-3 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {formData.products.map((product, index) => (
                                  <tr key={index} className="border-b last:border-0">
                                      <td className="p-3 font-medium flex items-center gap-3">
                                          <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" data-ai-hint="product" />
                                          <Input
                                            value={product.name}
                                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                            placeholder="Product name"
                                            className="border-0 p-0 h-auto"
                                          />
                                      </td>
                                      <td className="p-3 hidden sm:table-cell">
                                          <Input
                                            value={product.category}
                                            onChange={(e) => updateProduct(index, 'category', e.target.value)}
                                            placeholder="Category"
                                            className="border-0 p-0 h-auto"
                                          />
                                      </td>
                                      <td className="p-3">
                                          <Input
                                            value={product.price}
                                            onChange={(e) => updateProduct(index, 'price', e.target.value)}
                                            placeholder="Price"
                                            className="border-0 p-0 h-auto"
                                          />
                                      </td>
                                      <td className="p-3 text-right">
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => removeProduct(index)}
                                          >
                                            Remove
                                          </Button>
                                      </td>
                                  </tr>
                              ))}
                              {formData.products.length === 0 && (
                                  <tr>
                                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                          No products added yet. Click "Add Product" to get started.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                       </table>
                  </div>
              </TabsContent>
              
              <TabsContent value="gallery">
                   <div className="flex justify-between items-center mb-4">
                      <div>
                          <h3 className="text-lg font-medium">Brand Gallery</h3>
                          <p className="text-sm text-muted-foreground">These images are available to all store microsites.</p>
                      </div>
                      <Button onClick={addGalleryImage}><Upload className="mr-2 h-4 w-4"/> Add Image</Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.gallery.map((image, index) => (
                          <div key={index} className="relative group">
                              <Image src={image.src} alt={image.alt} width={400} height={300} className="rounded-lg object-cover aspect-[4/3]" data-ai-hint="gallery" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => removeGalleryImage(index)}
                                  >
                                    Delete
                                  </Button>
                              </div>
                              <div className="mt-2">
                                  <Input
                                    value={image.alt}
                                    onChange={(e) => {
                                      const newGallery = [...formData.gallery];
                                      newGallery[index].alt = e.target.value;
                                      setFormData(prev => ({ ...prev, gallery: newGallery }));
                                    }}
                                    placeholder="Alt text"
                                    className="text-xs"
                                  />
                              </div>
                          </div>
                      ))}
                      {formData.gallery.length === 0 && (
                          <div className="col-span-full p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                              <Upload className="mx-auto h-12 w-12 mb-4 opacity-50" />
                              <p>No gallery images yet. Click "Add Image" to get started.</p>
                          </div>
                      )}
                  </div>
              </TabsContent>

              <TabsContent value="microsite">
                  <div className="space-y-8">
                      {/* Microsite Overview */}
                      <div className="grid lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                  <div>
                                      <h3 className="text-lg font-medium">Microsite Overview</h3>
                                      <p className="text-sm text-muted-foreground">
                                          Manage your brand's microsite and individual store locations
                                      </p>
                                  </div>
                                  <Button onClick={() => openStoreForm()}>
                                      <PlusCircle className="mr-2 h-4 w-4" />
                                      Add Store
                                  </Button>
                              </div>
                              
                              {/* Microsite Preview Card */}
                              <Card className="mb-6">
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                          <Globe className="h-5 w-5" />
                                          {brand?.brandName} Microsite
                                      </CardTitle>
                                      <CardDescription>
                                          Your brand's main microsite with {stores.length} store locations
                                      </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                              <span className="font-medium">Template:</span>
                                              <span className="ml-2 capitalize">{formData.branding.template}</span>
                                          </div>
                                          <div>
                                              <span className="font-medium">Primary Color:</span>
                                              <div className="flex items-center gap-2 mt-1">
                                                  <div 
                                                    className="w-4 h-4 rounded border" 
                                                    style={{ backgroundColor: formData.branding.primaryColor }}
                                                  />
                                                  <span>{formData.branding.primaryColor}</span>
                                              </div>
                                          </div>
                                          <div>
                                              <span className="font-medium">Font:</span>
                                              <span className="ml-2">{formData.branding.fontFamily}</span>
                                          </div>
                                          <div>
                                              <span className="font-medium">Products:</span>
                                              <span className="ml-2">{formData.products.length} items</span>
                                          </div>
                                      </div>
                                      <div className="mt-4 pt-4 border-t">
                                          <Link href={`/brand/microsite-preview?brand=${brandId}`}>
                                              <Button variant="outline" className="w-full">
                                                  <Globe className="mr-2 h-4 w-4" />
                                                  Preview Microsite
                                              </Button>
                                          </Link>
                                      </div>
                                  </CardContent>
                              </Card>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="space-y-4">
                              <Card>
                                  <CardContent className="pt-6">
                                      <div className="text-center">
                                          <div className="text-3xl font-bold text-primary">{stores.length}</div>
                                          <div className="text-sm text-muted-foreground">Store Locations</div>
                                      </div>
                                  </CardContent>
                              </Card>
                              
                              <Card>
                                  <CardContent className="pt-6">
                                      <div className="text-center">
                                          <div className="text-3xl font-bold text-primary">{formData.products.length}</div>
                                          <div className="text-sm text-muted-foreground">Products</div>
                                      </div>
                                  </CardContent>
                              </Card>
                              
                              <Card>
                                  <CardContent className="pt-6">
                                      <div className="text-center">
                                          <div className="text-3xl font-bold text-primary">{formData.gallery.length}</div>
                                          <div className="text-sm text-muted-foreground">Gallery Images</div>
                                      </div>
                                  </CardContent>
                              </Card>
                          </div>
                      </div>

                      {/* Stores Management */}
                      <div>
                          <h3 className="text-lg font-medium mb-4">Store Locations</h3>
                          {stores.length === 0 ? (
                              <Card>
                                  <CardContent className="py-12">
                                      <div className="text-center">
                                          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                          <h4 className="text-lg font-medium mb-2">No stores yet</h4>
                                          <p className="text-muted-foreground mb-4">
                                              Start building your microsite by adding your first store location
                                          </p>
                                          <Button onClick={() => openStoreForm()}>
                                              <PlusCircle className="mr-2 h-4 w-4" />
                                              Add Your First Store
                                          </Button>
                                      </div>
                                  </CardContent>
                              </Card>
                          ) : (
                              <div className="grid gap-4">
                                  {stores.map((store) => (
                                      <Card key={store.id}>
                                          <CardContent className="pt-6">
                                              <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-4">
                                                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                                          <Store className="h-8 w-8 text-muted-foreground" />
                                                      </div>
                                                      <div>
                                                          <h4 className="font-medium">{store.storeName}</h4>
                                                          <p className="text-sm text-muted-foreground">
                                                              {store.address.city}, {store.address.state}
                                                          </p>
                                                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                              <span className="flex items-center gap-1">
                                                                  <MapPin className="h-3 w-3" />
                                                                  {store.storeCode}
                                                              </span>
                                                              <span className="flex items-center gap-1">
                                                                  <Users className="h-3 w-3" />
                                                                  {store.primaryCategory}
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => openStoreForm(store)}
                                                      >
                                                          <Settings className="mr-2 h-3 w-3" />
                                                          Edit
                                                      </Button>
                                                      <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => window.open(`/store/${store.storeSlug}`, '_blank')}
                                                      >
                                                          <Globe className="mr-2 h-3 w-3" />
                                                          View
                                                      </Button>
                                                      <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => handleDeleteStore(store.id)}
                                                      >
                                                          Delete
                                                      </Button>
                                                  </div>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BrandPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading brand settings...</p>
        </div>
      </div>
    }>
      <BrandPageContent />
    </Suspense>
  );
}
