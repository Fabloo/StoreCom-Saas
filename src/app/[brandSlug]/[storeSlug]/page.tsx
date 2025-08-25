import ClassicTemplate from "../../microsite-templates/classic/page";
import type { Metadata } from 'next';
import { brandOperations, storeOperations } from '@/lib/database';

async function getMicrositeData(brandSlug: string, storeSlug: string) {
  const brand = await brandOperations.getBrandBySlug(brandSlug);
  if (!brand) return null;

  const stores = await storeOperations.getStoresByBrand(brand._id!.toString());
  const store = stores.find(s => s.storeSlug === storeSlug);
  if (!store) return null;

  const hours: Record<string, string> = Object.fromEntries(
    Object.entries(store.hours).map(([day, h]) => [day, h.closed ? 'Closed' : `${h.open} - ${h.close}`])
  );

  const data = {
    // Brand-level
    brandName: brand.brandName,
    description: brand.content?.aboutSection || brand.description || '',
    products: (brand.products || []).map(p => ({
      name: p.name,
      description: p.description || '',
      image: p.image,
      hint: p.name,
    })),
    gallery: (brand.gallery || []).map(g => ({ src: g.src, alt: g.alt, hint: g.alt })),

    // Store-specific
    name: store.storeName,
    slug: store.storeSlug,
    email: store.email,
    phone: store.phone,
    address: {
      line1: store.address.line1,
      line2: store.address.line2 || '',
      locality: store.address.locality,
      city: store.address.city,
      state: store.address.state,
      postalCode: store.address.postalCode,
      country: store.address.country,
    },
    category: store.primaryCategory,
    tags: store.tags || [],
    hours,
    heroImage: store.microsite?.heroImage || '',
    heroHint: store.microsite?.heroHint || 'store hero',
    tagline: store.microsite?.tagline || '',

    rating: undefined,
    reviews: [],
    paymentMethods: undefined,
    parkingOptions: undefined,
    plusCode: undefined,
    qrImage: undefined,
    qrDownloadUrl: undefined,
    otherStoresLinks: [],
    popularCities: [],
    nearbyStores: [],
    socialLinks: {
      facebook: store.socialLinks?.facebook || brand.socialLinks?.facebook || undefined,
      twitter: store.socialLinks?.twitter || brand.socialLinks?.twitter || undefined,
      instagram: store.socialLinks?.instagram || brand.socialLinks?.instagram || undefined,
      yelp: store.socialLinks?.yelp || undefined,
    },
    seo: store.seo,
  } as const;

  return data;
}

export async function generateMetadata({ params }: { params: { brandSlug: string, storeSlug: string } }): Promise<Metadata> {
  const data = await getMicrositeData(params.brandSlug, params.storeSlug);
  if (!data) return { title: 'Store not found' };
  return {
    title: data.seo.title,
    description: data.seo.description,
    keywords: data.seo.keywords,
  }
}

export default async function MicrositeStorePage({ params }: { params: { brandSlug: string, storeSlug: string } }) {
  const data = await getMicrositeData(params.brandSlug, params.storeSlug);
  if (!data) return null;
  return <ClassicTemplate storeData={data as any} />;
}
