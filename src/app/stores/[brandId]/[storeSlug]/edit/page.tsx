"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreForm } from "@/components/forms/store-form";
import { useStores } from "@/hooks/use-stores";
import { useBrands } from "@/hooks/use-brands";
import { useEffect, useState } from "react";
import { StoreData } from "@/lib/validation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditStorePage({ 
  params 
}: { 
  params: { brandId: string; storeSlug: string } 
}) {
  const { getStores } = useStores();
  const { brands, getBrands } = useBrands();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStore = async () => {
      try {
        const stores = await getStores(params.brandId);
        const foundStore = stores.find(s => s.storeSlug === params.storeSlug);
        if (foundStore) {
          setStore(foundStore);
        } else {
          // Store not found, redirect to stores list
          router.push('/stores');
        }
      } catch (error) {
        console.error('Error loading store:', error);
        router.push('/stores');
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [params.brandId, params.storeSlug, getStores, router]);

  useEffect(() => { getBrands(); }, [getBrands]);

  const getBrandName = (brandId: string) => {
    const brand = brands.find((b: any) => (b._id?.toString?.() || b.id) === brandId);
    return brand?.brandName || 'Unknown Brand';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading store data...</span>
        </CardContent>
      </Card>
    );
  }

  if (!store) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Store not found</p>
            <Link href="/stores">
              <Button>Back to Stores</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/stores">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stores
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Store</h1>
          <p className="text-gray-600">
            Updating {store.storeName} - {getBrandName(store.brandId)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Update the details for this store location.</CardDescription>
        </CardHeader>
        <CardContent>
          <StoreForm storeData={store} />
        </CardContent>
      </Card>
    </div>
  );
} 