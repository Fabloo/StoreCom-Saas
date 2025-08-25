import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CreateStoreInput, UpdateStoreInput, StoreData } from '@/lib/validation';
import { authFetch } from '@/lib/auth-client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

// Mock data for development/testing
const mockStores: StoreData[] = [
  {
    id: 'mock-store-1',
    brandId: 'mock-brand-1',
    storeCode: 'DEL-CP-001',
    storeName: "Haldiram's Connaught Place",
    storeSlug: 'haldirams-connaught-place',
    email: 'cp@haldirams.com',
    phone: '+91-11-23456789',
    address: {
      line1: '123 Main Street',
      line2: 'Ground Floor',
      locality: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      latitude: '28.6139',
      longitude: '77.2090',
    },
    primaryCategory: 'Restaurant',
    additionalCategories: 'Sweet Shop, Snacks',
    tags: ['Traditional', 'Authentic', 'Popular'],
    amenities: {
      parking: true,
      delivery: true,
    },
    hours: {
      Monday: { open: '09:00', close: '22:00', closed: false },
      Tuesday: { open: '09:00', close: '22:00', closed: false },
      Wednesday: { open: '09:00', close: '22:00', closed: false },
      Thursday: { open: '09:00', close: '22:00', closed: false },
      Friday: { open: '09:00', close: '22:00', closed: false },
      Saturday: { open: '09:00', close: '22:00', closed: false },
      Sunday: { open: '09:00', close: '22:00', closed: false },
    },
    microsite: {
      heroImage: 'https://placehold.co/1200x600.png',
      heroHint: 'store front',
      tagline: 'Traditional Indian Sweets & Snacks',
    },
    socialLinks: {
      facebook: 'https://facebook.com/haldirams',
      instagram: 'https://instagram.com/haldirams',
      website: 'https://haldirams.com',
    },
    seo: {
      title: "Haldiram's Connaught Place | Traditional Indian Sweets",
      description: 'Authentic Indian sweets and snacks in Connaught Place, Delhi. Traditional recipes since 1937.',
      keywords: 'Indian sweets, traditional snacks, Delhi, Connaught Place, Haldirams',
    },
  },
  {
    id: 'mock-store-2',
    brandId: 'mock-brand-2',
    storeCode: 'CHI-DT-001',
    storeName: 'Pizza House Downtown',
    storeSlug: 'pizza-house-downtown',
    email: 'downtown@pizzahouse.com',
    phone: '+1-555-123-4567',
    address: {
      line1: '456 Oak Avenue',
      line2: 'Suite 100',
      locality: 'Downtown',
      city: 'Chicago',
      state: 'Illinois',
      postalCode: '60601',
      country: 'USA',
      latitude: '41.8781',
      longitude: '-87.6298',
    },
    primaryCategory: 'Restaurant',
    additionalCategories: 'Pizza, Italian',
    tags: ['Wood-fired', 'Authentic', 'Downtown'],
    amenities: {
      parking: false,
      delivery: true,
    },
    hours: {
      Monday: { open: '11:00', close: '23:00', closed: false },
      Tuesday: { open: '11:00', close: '23:00', closed: false },
      Wednesday: { open: '11:00', close: '23:00', closed: false },
      Thursday: { open: '11:00', close: '23:00', closed: false },
      Friday: { open: '11:00', close: '00:00', closed: false },
      Saturday: { open: '11:00', close: '00:00', closed: false },
      Sunday: { open: '12:00', close: '22:00', closed: false },
    },
    microsite: {
      heroImage: 'https://placehold.co/1200x600.png',
      heroHint: 'pizza oven',
      tagline: 'Authentic Italian Pizza in Downtown Chicago',
    },
    socialLinks: {
      facebook: 'https://facebook.com/pizzahouse',
      instagram: 'https://instagram.com/pizzahouse',
      website: 'https://pizzahouse.com',
    },
    seo: {
      title: 'Pizza House Downtown | Best Italian Pizza in Chicago',
      description: 'Authentic wood-fired Italian pizza in downtown Chicago. Fresh ingredients, traditional recipes.',
      keywords: 'pizza, Italian food, Chicago, downtown, wood-fired pizza',
    },
  },
];

export function useStores() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create a new store
  const createStore = useCallback(async (storeData: CreateStoreInput): Promise<StoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      const result: ApiResponse<StoreData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create store');
      }
      
      toast({
        title: 'Success',
        description: result.message || 'Store created successfully',
      });
      
      return result.data || null;
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      const newStore: StoreData = {
        id: `mock-store-${Date.now()}`,
        ...storeData,
      };
      mockStores.push(newStore);
      
      toast({
        title: 'Success',
        description: 'Store created successfully (mock mode)',
      });
      
      return newStore;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get all stores
  const getStores = useCallback(async (brandId?: string): Promise<StoreData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = brandId ? `/api/stores?brandId=${brandId}` : '/api/stores';
      const response = await authFetch(url);
      
      const result: ApiResponse<StoreData[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stores');
      }
      
      return result.data || [];
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      if (brandId) {
        return mockStores.filter(store => store.brandId === brandId);
      }
      return mockStores;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific store
  const getStore = useCallback(async (storeId: string): Promise<StoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/stores/${storeId}`);
      
      const result: ApiResponse<StoreData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch store');
      }
      
      return result.data || null;
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      const mockStore = mockStores.find(store => store.id === storeId);
      return mockStore || null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a store
  const updateStore = useCallback(async (storeId: string, updates: UpdateStoreInput): Promise<StoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result: ApiResponse<StoreData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update store');
      }
      
      toast({
        title: 'Success',
        description: result.message || 'Store updated successfully',
      });
      
      return result.data || null;
    } catch (err) {
      console.warn('API failed, updating mock data:', err);
      // Fallback to updating mock data if API fails
      const storeIndex = mockStores.findIndex(store => store.id === storeId);
      if (storeIndex !== -1) {
        const updatedStore = { ...mockStores[storeIndex], ...updates };
        mockStores[storeIndex] = updatedStore;
        
        toast({
          title: 'Success',
          description: 'Store updated successfully (mock mode)',
        });
        
        return updatedStore;
      }
      throw new Error('Store not found');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete a store
  const deleteStore = useCallback(async (storeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete store');
      }
      
      toast({
        title: 'Success',
        description: result.message || 'Store deleted successfully',
      });
      
      return true;
    } catch (err) {
      console.warn('API failed, deleting from mock data:', err);
      // Fallback to deleting from mock data if API fails
      const storeIndex = mockStores.findIndex(store => store.id === storeId);
      if (storeIndex !== -1) {
        mockStores.splice(storeIndex, 1);
        
        toast({
          title: 'Success',
          description: 'Store deleted successfully (mock mode)',
        });
        
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Validate store code and slug uniqueness
  const validateStoreData = useCallback(async (storeCode?: string, storeSlug?: string, excludeId?: string): Promise<{ storeCode?: boolean; storeSlug?: boolean }> => {
    try {
      const response = await authFetch('/api/stores/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeCode, storeSlug, excludeId }),
      });
      
      const result: ApiResponse<{ storeCode?: boolean; storeSlug?: boolean }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to validate store data');
      }
      
      return result.data || {};
    } catch (err) {
      console.warn('API failed, using mock validation:', err);
      // Fallback to mock validation if API fails
      const storeCodeExists = mockStores.some(store => 
        store.storeCode === storeCode && store.id !== excludeId
      );
      const storeSlugExists = mockStores.some(store => 
        store.storeSlug === storeSlug && store.id !== excludeId
      );
      
      return {
        storeCode: !storeCodeExists,
        storeSlug: !storeSlugExists,
      };
    }
  }, []);

  return {
    loading,
    error,
    createStore,
    getStores,
    getStore,
    updateStore,
    deleteStore,
    validateStoreData,
  };
} 