"use client";

import { useSearchParams } from "next/navigation";
import { useBrands } from "@/hooks/use-brands";
import { useStores } from "@/hooks/use-stores";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Star, Store, Users, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function MicrositePreviewContent() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get('brand');
  
  const { getBrand } = useBrands();
  const { getStores } = useStores();
  const [brand, setBrand] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandId) {
      loadData();
    }
  }, [brandId]);

  const loadData = async () => {
    try {
      const [brandData, storesData] = await Promise.all([
        getBrand(brandId!),
        getStores(brandId!)
      ]);
      setBrand(brandData);
      setStores(storesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading microsite preview...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Brand not found</h1>
          <Link href="/brand">
            <Button>Back to Brand Settings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: brand.branding?.backgroundColor || '#ffffff',
      fontFamily: brand.branding?.fontFamily || 'Inter'
    }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/brand?brand=${brandId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Image 
                  src={brand.logo || "https://placehold.co/40x40.png"} 
                  alt={brand.brandName} 
                  width={40} 
                  height={40} 
                  className="rounded-lg"
                />
                <h1 className="text-xl font-bold" style={{ color: brand.branding?.primaryColor }}>
                  {brand.brandName}
                </h1>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Microsite Preview
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20" style={{ backgroundColor: brand.branding?.primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to {brand.brandName}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {brand.description || "Discover our amazing products and services"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                style={{ backgroundColor: brand.branding?.accentColor, color: 'white' }}
              >
                Find a Store
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                View Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {brand.content?.aboutSection && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brand.branding?.primaryColor }}>
              About {brand.brandName}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {brand.content.aboutSection}
            </p>
          </div>
        </section>
      )}

      {/* Products Section */}
      {brand.products && brand.products.length > 0 && (
        <section className="py-16" style={{ backgroundColor: brand.branding?.backgroundColor || '#f8f9fa' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: brand.branding?.primaryColor }}>
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brand.products.map((product: any, index: number) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold" style={{ color: brand.branding?.accentColor }}>
                        {product.price}
                      </span>
                      <Button size="sm" style={{ backgroundColor: brand.branding?.primaryColor }}>
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stores Section */}
      {stores.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: brand.branding?.primaryColor }}>
              Find a Store Near You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" style={{ color: brand.branding?.primaryColor }} />
                      {store.storeName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <p>{store.address.line1}</p>
                        <p className="text-muted-foreground">
                          {store.address.city}, {store.address.state} {store.address.postalCode}
                        </p>
                      </div>
                    </div>
                    
                    {store.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{store.phone}</span>
                      </div>
                    )}
                    
                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{store.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{store.primaryCategory}</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="sm"
                      style={{ backgroundColor: brand.branding?.primaryColor }}
                    >
                      View Store Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {brand.gallery && brand.gallery.length > 0 && (
        <section className="py-16" style={{ backgroundColor: brand.branding?.backgroundColor || '#f8f9fa' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: brand.branding?.primaryColor }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brand.gallery.map((image: any, index: number) => (
                <div key={index} className="aspect-square relative group overflow-hidden rounded-lg">
                  <Image 
                    src={image.src} 
                    alt={image.alt} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{brand.brandName}</h3>
              <p className="text-gray-400">
                {brand.description || "Your trusted partner for quality products and services"}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Stores</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                {brand.socialLinks?.facebook && (
                  <a href={brand.socialLinks.facebook} className="text-gray-400 hover:text-white transition-colors">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {brand.socialLinks?.instagram && (
                  <a href={brand.socialLinks.instagram} className="text-gray-400 hover:text-white transition-colors">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {brand.socialLinks?.twitter && (
                  <a href={brand.socialLinks.twitter} className="text-gray-400 hover:text-white transition-colors">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {brand.brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function MicrositePreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading microsite preview...</p>
        </div>
      </div>
    }>
      <MicrositePreviewContent />
    </Suspense>
  );
}


