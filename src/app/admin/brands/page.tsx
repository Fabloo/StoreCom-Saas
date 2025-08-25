'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, ExternalLink, Globe, MapPin, Calendar, Settings, Store, LogOut } from 'lucide-react';
import { useBrands } from '@/hooks/use-brands';
import type { BrandData } from '@/lib/validation';
import BrandForm from '@/components/forms/brand-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-client';

export default function BrandsPage() {
  const { brands, loading, error, getBrands, createBrand, updateBrand, deleteBrand, syncWithGoogleBusiness } = useBrands();
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandData | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<BrandData | null>(null);

  useEffect(() => {
    getBrands();
  }, [getBrands]);

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brandSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBrand = async (data: any) => {
    try {
      await createBrand(data);
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Brand created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create brand',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBrand = async (data: any) => {
    if (!editingBrand) return;
    
    try {
      const brandId = (editingBrand as any)._id?.toString();
      if (!brandId) {
        throw new Error('Brand ID not found');
      }
      await updateBrand(brandId, data);
      setEditingBrand(null);
      toast({
        title: 'Success',
        description: 'Brand updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update brand',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBrand = async () => {
    if (!deletingBrand) return;
    
    try {
      const brandId = (deletingBrand as any)._id?.toString();
      if (!brandId) {
        throw new Error('Brand ID not found');
      }
      await deleteBrand(brandId);
      setDeletingBrand(null);
      toast({
        title: 'Success',
        description: 'Brand deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete brand',
        variant: 'destructive',
      });
    }
  };

  const handleSyncGMB = async (brand: BrandData) => {
    try {
      const brandId = (brand as any)._id?.toString();
      if (!brandId) {
        throw new Error('Brand ID not found');
      }
      await syncWithGoogleBusiness(brandId);
      toast({
        title: 'Success',
        description: 'Brand synced with Google My Business successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync with Google My Business',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-gray-600">Manage your brands and their Google My Business integration</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Brand</DialogTitle>
                <DialogDescription>
                  Create a new brand with all necessary information and optionally connect it to Google My Business.
                  <br />
                  <span className="text-blue-600 font-medium">💡 Tip: Use the "Fill Test Data" button to quickly populate all fields for testing!</span>
                </DialogDescription>
              </DialogHeader>
              <BrandForm
                onSubmit={handleCreateBrand}
                onCancel={() => setIsCreateDialogOpen(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Brands</CardTitle>
              <CardDescription>
                {filteredBrands.length} of {brands.length} brands
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>GMB Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={(brand as any)._id?.toString() || brand.brandSlug}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.brandName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Globe className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{brand.brandName}</div>
                        <div className="text-sm text-gray-500">@{brand.brandSlug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{brand.industry}</div>
                      <div className="text-sm text-gray-500">{brand.primaryCategory}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{brand.address.city}, {brand.address.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={brand.googleBusiness.isConnected ? "default" : "secondary"}>
                        {brand.googleBusiness.isConnected ? "Connected" : "Not Connected"}
                      </Badge>
                      {brand.googleBusiness.isConnected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncGMB(brand)}
                          disabled={loading}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(brand.status)}>
                      {brand.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(brand.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog open={!!editingBrand} onOpenChange={(open) => !open && setEditingBrand(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBrand(brand)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Brand</DialogTitle>
                            <DialogDescription>
                              Update brand information and settings.
                            </DialogDescription>
                          </DialogHeader>
                          <BrandForm
                            brand={editingBrand!}
                            onSubmit={handleUpdateBrand}
                            onCancel={() => setEditingBrand(null)}
                            loading={loading}
                          />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog open={!!deletingBrand} onOpenChange={(open) => !open && setDeletingBrand(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingBrand(brand)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{deletingBrand?.brandName}"? This action cannot be undone.
                              {deletingBrand?.googleBusiness.isConnected && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  <p className="text-sm text-yellow-800">
                                    This brand is connected to Google My Business. The location will remain in GMB but will be disconnected from this system.
                                  </p>
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteBrand} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/stores?brandId=${(brand as any)._id || brand.brandSlug}`)}
                      >
                        <Store className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/brand?brand=${(brand as any)._id || brand.brandSlug}`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {brand.website && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(brand.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Brand
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
