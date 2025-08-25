import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { randomBytes, scryptSync } from 'node:crypto';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'storecom';

let client: MongoClient;
let db: Db;

// Initialize MongoDB connection
export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return { client, db };
}

// Close database connection
export async function closeDatabase() {
  if (client) {
    await client.close();
  }
}

// Store data type
export interface StoreData {
  _id?: ObjectId;
  brandId: string;
  storeCode: string;
  storeName: string;
  storeSlug: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: string;
    longitude: string;
    placeId?: string;
  };
  primaryCategory: string;
  additionalCategories?: string;
  tags: string[];
  amenities: {
    parking: boolean;
    delivery: boolean;
  };
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  microsite: {
    heroImage: string;
    heroHint?: string;
    tagline: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    yelp?: string;
    website?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'live' | 'archived';
}

// User data type
export type UserRole = 'super_admin' | 'brand_admin';

export interface UserData {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  brandIds: string[]; // for brand_admin, list of brands they can manage
  createdAt: Date;
  updatedAt: Date;
}

async function getUsersCollection(): Promise<Collection<UserData>> {
  const { db } = await connectToDatabase();
  return db.collection<UserData>('users');
}

export const userOperations = {
  async createUser(params: { email: string; password: string; role: UserRole; brandIds?: string[] }): Promise<UserData> {
    const collection = await getUsersCollection();
    const existing = await collection.findOne({ email: params.email.toLowerCase() });
    if (existing) throw new Error('User already exists');

    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(params.password, salt, 64).toString('hex');
    const passwordHash = `scrypt$${salt}$${derivedKey}`;
    const user: UserData = {
      email: params.email.toLowerCase(),
      passwordHash,
      role: params.role,
      brandIds: params.brandIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  async findByEmail(email: string): Promise<UserData | null> {
    const collection = await getUsersCollection();
    return collection.findOne({ email: email.toLowerCase() });
  },

  async setPassword(email: string, password: string): Promise<void> {
    const collection = await getUsersCollection();
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    const passwordHash = `scrypt$${salt}$${derivedKey}`;
    await collection.updateOne(
      { email: email.toLowerCase() },
      { $set: { passwordHash, updatedAt: new Date() } }
    );
  },

  async addBrandToUser(userId: string, brandId: string): Promise<void> {
    const collection = await getUsersCollection();
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { brandIds: brandId }, $set: { updatedAt: new Date() } }
    );
  },
};

// Get stores collection
async function getStoresCollection(): Promise<Collection<StoreData>> {
  const { db } = await connectToDatabase();
  return db.collection<StoreData>('stores');
}

// Store operations
export const storeOperations = {
  // Create a new store
  async createStore(storeData: Omit<StoreData, '_id' | 'createdAt' | 'updatedAt'>): Promise<StoreData> {
    const collection = await getStoresCollection();
    const newStore: StoreData = {
      ...storeData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };
    
    const result = await collection.insertOne(newStore);
    return { ...newStore, _id: result.insertedId };
  },

  // Get a store by ID
  async getStoreById(storeId: string): Promise<StoreData | null> {
    const collection = await getStoresCollection();
    const objectId = new ObjectId(storeId);
    return await collection.findOne({ _id: objectId });
  },

  // Get a store by slug
  async getStoreBySlug(storeSlug: string): Promise<StoreData | null> {
    const collection = await getStoresCollection();
    return await collection.findOne({ storeSlug });
  },

  // Get all stores for a brand
  async getStoresByBrand(brandId: string): Promise<StoreData[]> {
    const collection = await getStoresCollection();
    return await collection.find({ brandId }).toArray();
  },

  // Get all stores
  async getAllStores(): Promise<StoreData[]> {
    const collection = await getStoresCollection();
    return await collection.find({}).toArray();
  },

  // Update a store
  async updateStore(storeId: string, updates: Partial<StoreData>): Promise<void> {
    const collection = await getStoresCollection();
    const objectId = new ObjectId(storeId);
    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
  },

  // Delete a store
  async deleteStore(storeId: string): Promise<void> {
    const collection = await getStoresCollection();
    const objectId = new ObjectId(storeId);
    await collection.deleteOne({ _id: objectId });
  },

  // Check if store code is unique
  async isStoreCodeUnique(storeCode: string, excludeId?: string): Promise<boolean> {
    const collection = await getStoresCollection();
    const filter: any = { storeCode };
    
    if (excludeId) {
      filter._id = { $ne: new ObjectId(excludeId) };
    }
    
    const count = await collection.countDocuments(filter);
    return count === 0;
  },

  // Check if store slug is unique
  async isStoreSlugUnique(storeSlug: string, excludeId?: string): Promise<boolean> {
    const collection = await getStoresCollection();
    const filter: any = { storeSlug };
    
    if (excludeId) {
      filter._id = { $ne: new ObjectId(excludeId) };
    }
    
    const count = await collection.countDocuments(filter);
    return count === 0;
  }
};

// Brand data type
export interface BrandData {
  _id?: ObjectId;
  brandName: string;
  brandSlug: string;
  description?: string;
  logo?: string;
  website?: string;
  email: string;
  phone?: string;
  industry: string;
  primaryCategory: string;
  additionalCategories?: string[];
  address: {
    line1: string;
    line2?: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: string;
    longitude: string;
    placeId?: string;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
    template: 'classic' | 'modern' | 'bold';
  };
  content: {
    aboutSection?: string;
    missionStatement?: string;
    valueProposition?: string;
  };
  products: Array<{
    name: string;
    category: string;
    price: string;
    image: string;
    description?: string;
  }>;
  gallery: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  googleBusiness: {
    accountId?: string;
    locationId?: string;
    isConnected: boolean;
    lastSync?: Date;
  };
  settings: {
    autoSyncWithGMB: boolean;
    reviewNotifications: boolean;
    postNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'inactive';
}

// Get brands collection
async function getBrandsCollection(): Promise<Collection<BrandData>> {
  const { db } = await connectToDatabase();
  return db.collection<BrandData>('brands');
}

// Brand operations
export const brandOperations = {
  // Create a new brand
  async createBrand(brandData: Omit<BrandData, '_id' | 'createdAt' | 'updatedAt'>): Promise<BrandData> {
    const collection = await getBrandsCollection();
    const newBrand: BrandData = {
      ...brandData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };
    
    const result = await collection.insertOne(newBrand);
    return { ...newBrand, _id: result.insertedId };
  },

  // Get a brand by ID
  async getBrandById(brandId: string): Promise<BrandData | null> {
    const collection = await getBrandsCollection();
    const objectId = new ObjectId(brandId);
    return await collection.findOne({ _id: objectId });
  },

  // Get a brand by slug
  async getBrandBySlug(brandSlug: string): Promise<BrandData | null> {
    const collection = await getBrandsCollection();
    return await collection.findOne({ brandSlug });
  },

  // Get all brands
  async getAllBrands(): Promise<BrandData[]> {
    const collection = await getBrandsCollection();
    return await collection.find({}).toArray();
  },

  // Update a brand
  async updateBrand(brandId: string, updates: Partial<BrandData>): Promise<void> {
    const collection = await getBrandsCollection();
    const objectId = new ObjectId(brandId);
    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
  },

  // Delete a brand
  async deleteBrand(brandId: string): Promise<void> {
    const collection = await getBrandsCollection();
    const objectId = new ObjectId(brandId);
    await collection.deleteOne({ _id: objectId });
  },

  // Check if brand slug is unique
  async isBrandSlugUnique(brandSlug: string, excludeId?: string): Promise<boolean> {
    const collection = await getBrandsCollection();
    const filter: any = { brandSlug };
    
    if (excludeId) {
      filter._id = { $ne: new ObjectId(excludeId) };
    }
    
    const count = await collection.countDocuments(filter);
    return count === 0;
  },

  // Update Google Business connection
  async updateGoogleBusinessConnection(brandId: string, gmbData: Partial<BrandData['googleBusiness']>): Promise<void> {
    const collection = await getBrandsCollection();
    const objectId = new ObjectId(brandId);
    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          'googleBusiness': {
            isConnected: false, // Default value
            ...gmbData,
            lastSync: new Date()
          },
          updatedAt: new Date()
        }
      }
    );
  }
};

// Export database instance for direct access if needed
export { db }; 