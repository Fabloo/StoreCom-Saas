"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Store, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { useStores } from "@/hooks/use-stores"
import { useBrands } from "@/hooks/use-brands"
import { useEffect, useState, Suspense } from "react"
import { StoreData } from "@/lib/validation"
import { useSearchParams } from "next/navigation"

function StoresPageContent() {
  const { getStores, loading, error } = useStores();
  const { brands, getBrands } = useBrands();
  const [stores, setStores] = useState<StoreData[]>([]);
  const searchParams = useSearchParams();
  const brandId = searchParams.get('brandId');

  useEffect(() => {
    const loadStores = async () => {
      const storesData = await getStores(brandId || undefined);
      setStores(storesData);
    };
    loadStores();
  }, [getStores, brandId]);

  // Ensure brands are loaded so we can resolve brand names/slugs
  useEffect(() => {
    getBrands();
  }, [getBrands]);

  const getBrandName = (brandId: string) => {
    const brand = brands.find((b: any) => (b._id?.toString?.() || b.id) === brandId);
    return brand?.brandName || 'Unknown Brand';
  };

  const getBrandSlug = (brandId: string) => {
    const brand = brands.find((b: any) => (b._id?.toString?.() || b.id) === brandId);
    return brand?.brandSlug || '';
  };

  const filteredBrand = brandId ? brands.find((b: any) => (b._id?.toString?.() || b.id) === brandId) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'default';
      case 'draft':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  if (loading && stores.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading stores...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && stores.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load stores</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>
              {filteredBrand ? `${filteredBrand.brandName} Stores` : 'Stores'}
            </CardTitle>
            <CardDescription>
                {filteredBrand 
                  ? `Manage store locations for ${filteredBrand.brandName}. ${stores.length} stores found.`
                  : `Manage your store locations and their SEO settings. ${stores.length} stores found.`
                }
            </CardDescription>
        </div>
        <Link href="/stores/add">
            <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Store
            </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first store location</p>
            <Link href="/stores/add">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="font-medium">{store.storeName}</div>
                    <div className="text-sm text-muted-foreground">@{store.storeSlug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{getBrandName(store.brandId)}</div>
                    <div className="text-sm text-muted-foreground">{store.storeCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{store.address.city}, {store.address.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(store.status || 'draft')}>
                      {store.status || 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{store.primaryCategory}</div>
                      {store.additionalCategories && (
                        <div className="text-muted-foreground">{store.additionalCategories}</div>
                      )}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/stores/${store.brandId}/${store.storeSlug}/edit`}>Edit Store</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${getBrandSlug(store.brandId)}/${store.storeSlug}`} target="_blank">View Microsite</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Run Audit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default function StoresPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading stores...</span>
        </CardContent>
      </Card>
    }>
      <StoresPageContent />
    </Suspense>
  );
}
