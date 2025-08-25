import { z } from 'zod';

// Address validation schema
export const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  locality: z.string().min(1, 'Locality is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.string().min(1, 'Latitude is required'),
  longitude: z.string().min(1, 'Longitude is required'),
  placeId: z.string().optional(),
});

// Hours validation schema
export const hoursSchema = z.record(
  z.string(),
  z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })
);

// Amenities validation schema
export const amenitiesSchema = z.object({
  parking: z.boolean(),
  delivery: z.boolean(),
});

// Microsite validation schema
export const micrositeSchema = z.object({
  heroImage: z.string().url('Hero image must be a valid URL').optional().or(z.literal('')),
  heroHint: z.string().optional(),
  tagline: z.string().min(1, 'Tagline is required'),
});

// Social links validation schema
export const socialLinksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  yelp: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

// SEO validation schema
export const seoSchema = z.object({
  title: z.string().min(1, 'SEO title is required').max(60, 'SEO title must be 60 characters or less'),
  description: z.string().min(1, 'SEO description is required').max(160, 'SEO description must be 160 characters or less'),
  keywords: z.string().min(1, 'SEO keywords are required'),
});

// Main store validation schema
export const createStoreSchema = z.object({
  brandId: z.string().min(1, 'Brand ID is required'),
  storeCode: z.string().min(1, 'Store code is required').regex(/^[A-Z0-9-]+$/, 'Store code must contain only uppercase letters, numbers, and hyphens'),
  storeName: z.string().min(1, 'Store name is required').max(100, 'Store name must be 100 characters or less'),
  storeSlug: z.string().min(1, 'Store slug is required').regex(/^[a-z0-9-]+$/, 'Store slug must contain only lowercase letters, numbers, and hyphens'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: addressSchema,
  primaryCategory: z.string().min(1, 'Primary category is required'),
  additionalCategories: z.string().optional(),
  tags: z.array(z.string()).default([]),
  amenities: amenitiesSchema,
  hours: hoursSchema,
  microsite: micrositeSchema,
  socialLinks: socialLinksSchema,
  seo: seoSchema,
});

// Update store schema (all fields optional)
export const updateStoreSchema = createStoreSchema.partial();

// Store status schema
export const storeStatusSchema = z.enum(['draft', 'live', 'archived']);

// Response schemas
export const storeResponseSchema = createStoreSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: storeStatusSchema,
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreData = z.infer<typeof storeResponseSchema>;

// Brand validation schemas
export const brandAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  locality: z.string().min(1, 'Locality is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.string().min(1, 'Latitude is required'),
  longitude: z.string().min(1, 'Longitude is required'),
  placeId: z.string().optional(),
});

export const brandBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Accent color must be a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Background color must be a valid hex color'),
  fontFamily: z.string().min(1, 'Font family is required'),
  template: z.enum(['classic', 'modern', 'bold']),
});

export const brandContentSchema = z.object({
  aboutSection: z.string().optional().or(z.literal('')),
  missionStatement: z.string().optional().or(z.literal('')),
  valueProposition: z.string().optional().or(z.literal('')),
});

export const brandProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Product category is required'),
  price: z.string().min(1, 'Product price is required'),
  image: z.string().url('Product image must be a valid URL'),
  description: z.string().optional(),
});

export const brandGallerySchema = z.object({
  src: z.string().url('Gallery image must be a valid URL'),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
});

export const brandSocialLinksSchema = z.object({
  facebook: z.string().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  youtube: z.string().optional().or(z.literal('')),
});

export const brandGoogleBusinessSchema = z.object({
  accountId: z.string().optional(),
  locationId: z.string().optional(),
  isConnected: z.boolean(),
  lastSync: z.union([z.date(), z.string()]).optional(),
});

export const brandSettingsSchema = z.object({
  autoSyncWithGMB: z.boolean(),
  reviewNotifications: z.boolean(),
  postNotifications: z.boolean(),
});

// Main brand validation schema
export const createBrandSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required').max(100, 'Brand name must be 100 characters or less'),
  brandSlug: z.string().min(1, 'Brand slug is required').regex(/^[a-z0-9-]+$/, 'Brand slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional().or(z.literal('')),
  logo: z.string().url('Logo must be a valid URL').optional().or(z.literal('')),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry is required'),
  primaryCategory: z.string().min(1, 'Primary category is required'),
  additionalCategories: z.array(z.string()).default([]),
  address: brandAddressSchema,
  branding: brandBrandingSchema,
  content: brandContentSchema,
  products: z.array(brandProductSchema).default([]),
  gallery: z.array(brandGallerySchema).default([]),
  socialLinks: brandSocialLinksSchema,
  seo: seoSchema,
  googleBusiness: brandGoogleBusinessSchema,
  settings: brandSettingsSchema,
});

// Update brand schema (all fields optional)
export const updateBrandSchema = createBrandSchema.partial();

// Brand status schema
export const brandStatusSchema = z.enum(['draft', 'active', 'inactive']);

// Response schemas
export const brandResponseSchema = createBrandSchema.extend({
  id: z.string(),
  createdAt: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  updatedAt: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  status: brandStatusSchema,
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type BrandData = z.infer<typeof brandResponseSchema>; 