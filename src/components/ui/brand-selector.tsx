"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Settings, Building } from "lucide-react";
import { useBrands } from "@/hooks/use-brands";
import type { BrandData } from "@/lib/validation";
import { useRouter } from "next/navigation";

interface BrandSelectorProps {
  onBrandSelect: (brand: BrandData) => void;
  selectedBrand?: BrandData | null;
}

export function BrandSelector({ onBrandSelect, selectedBrand }: BrandSelectorProps) {
  const { brands, loading, error, getBrands } = useBrands();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    getBrands();
  }, [getBrands]);

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brandSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBrandSelect = (brand: BrandData) => {
    onBrandSelect(brand);
    // Update URL to include brand parameter
    router.push(`/brand?brand=${brand._id}`);
  };

  if (loading && brands.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading brands...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && brands.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load brands</p>
            <Button onClick={() => getBrands()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Select Brand</CardTitle>
            <CardDescription>
              Choose a brand to manage its settings and assets
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/brands')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Brands
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id?.toString()}
              className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                selectedBrand?._id === brand._id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handleBrandSelect(brand)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.brandName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{brand.brandName}</div>
                    <div className="text-sm text-gray-500">@{brand.brandSlug}</div>
                    <div className="text-xs text-gray-400">{brand.industry}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                    {brand.status}
                  </Badge>
                  {selectedBrand?._id === brand._id && (
                    <Badge variant="outline">Selected</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredBrands.length === 0 && (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No brands found' : 'No brands yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first brand'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/admin/brands')}>
                  <Building className="mr-2 h-4 w-4" />
                  Create Brand
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 