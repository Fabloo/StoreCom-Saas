"use client";

import { useParams } from "next/navigation";
import { useStores } from "@/hooks/use-stores";
import { useBrands } from "@/hooks/use-brands";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Star, Store, Users, Globe, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function StorePageContent() {
  const params = useParams();
  const storeSlug = params.slug as string;
  
  const { getStores } = useStores();
  const { getBrand } = useBrands();
  const [store, setStore] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeSlug) {
      loadStoreData();
    }
  }, [storeSlug]);

  const loadStoreData = async () => {
    try {
      // First get all stores to find the one with matching slug
      const stores = await getStores();
      const foundStore = stores.find(s => s.storeSlug === storeSlug);
      
      if (foundStore) {
        setStore(foundStore);
        // Then get the brand data
        const brandData = await getBrand(foundStore.brandId);
        setBrand(brandData);
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Store not found</h1>
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
              <Link href={`/brand?brand=${brand._id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Brand
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
              {store.storeName}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20" style={{ backgroundColor: brand.branding?.primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {store.storeName}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {store.microsite?.tagline || `Visit our ${store.primaryCategory} in ${store.address.city}`}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                style={{ backgroundColor: brand.branding?.accentColor, color: 'white' }}
              >
                Get Directions
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Store Details */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Store Information */}
            <div>
              <h2 className="text-3xl font-bold mb-8" style={{ color: brand.branding?.primaryColor }}>
                Store Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-700">
                      {store.address.line1}
                      {store.address.line2 && <br />}
                      {store.address.line2}
                      <br />
                      {store.address.locality}, {store.address.city}
                      <br />
                      {store.address.state} {store.address.postalCode}
                      <br />
                      {store.address.country}
                    </p>
                  </div>
                </div>

                {store.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-gray-700">{store.phone}</p>
                    </div>
                  </div>
                )}

                {store.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-gray-700">{store.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Category</h3>
                    <p className="text-gray-700">{store.primaryCategory}</p>
                    {store.additionalCategories && (
                      <p className="text-sm text-muted-foreground">{store.additionalCategories}</p>
                    )}
                  </div>
                </div>

                {store.tags && store.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Features</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {store.tags.map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Store Hours */}
            <div>
              <h2 className="text-3xl font-bold mb-8" style={{ color: brand.branding?.primaryColor }}>
                Hours of Operation
              </h2>
              
              <div className="space-y-3">
                {Object.entries(store.hours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="font-medium">{day}</span>
                    <span className="text-gray-700">
                      {hours.closed ? (
                        <span className="text-red-600">Closed</span>
                      ) : (
                        `${hours.open} - ${hours.close}`
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: brand.branding?.primaryColor }}>
                  Amenities
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${store.amenities.parking ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Parking Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${store.amenities.delivery ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Delivery Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Microsite Content */}
      {store.microsite && (
        <section className="py-16" style={{ backgroundColor: brand.branding?.backgroundColor || '#f8f9fa' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8" style={{ color: brand.branding?.primaryColor }}>
              About This Location
            </h2>
            {store.microsite.heroImage && (
              <div className="mb-8">
                <Image 
                  src={store.microsite.heroImage} 
                  alt={store.microsite.heroHint || store.storeName} 
                  width={800} 
                  height={400} 
                  className="rounded-lg mx-auto"
                />
              </div>
            )}
            <p className="text-lg text-gray-700 leading-relaxed">
              {store.microsite.tagline}
            </p>
          </div>
        </section>
      )}

      {/* Social Links */}
      {store.socialLinks && Object.values(store.socialLinks).some(link => link) && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8" style={{ color: brand.branding?.primaryColor }}>
              Connect With Us
            </h2>
            <div className="flex justify-center gap-6">
              {store.socialLinks.website && (
                <a href={store.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </Button>
                </a>
              )}
              {store.socialLinks.facebook && (
                <a href={store.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    <Globe className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                </a>
              )}
              {store.socialLinks.instagram && (
                <a href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    <Globe className="mr-2 h-4 w-4" />
                    Instagram
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{store.storeName}</h3>
              <p className="text-gray-400">
                {store.microsite?.tagline || `Visit our ${store.primaryCategory} in ${store.address.city}`}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
              <div className="flex gap-4">
                <Button 
                  size="sm" 
                  style={{ backgroundColor: brand.branding?.primaryColor }}
                >
                  Get Directions
                </Button>
                {store.phone && (
                  <Button variant="outline" size="sm">
                    Call Now
                  </Button>
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

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading store...</p>
        </div>
      </div>
    }>
      <StorePageContent />
    </Suspense>
  );
}


