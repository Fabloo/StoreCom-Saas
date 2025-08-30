import { MongoClient, Db, ObjectId } from 'mongodb';
import { randomBytes, scryptSync } from 'node:crypto';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'storecom';

// Debug: Log environment variables
console.log('🔍 Environment Check:');
console.log('MONGODB_URI:', MONGODB_URI ? '✅ Set' : '❌ Not Set');
console.log('MONGODB_URI value:', MONGODB_URI);
console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
console.log('DB_NAME:', DB_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

let client: MongoClient;
let db: Db;

// Initialize MongoDB connection
export async function connectToDatabase() {
  try {
    if (!client || !db) {
      console.log('🔌 Attempting to connect to MongoDB...');
      console.log('📍 URI:', MONGODB_URI.substring(0, 50) + '...');
      console.log('🗄️ Database:', DB_NAME);
      
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      console.log('✅ MongoDB connected successfully');
    }
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('🔍 Connection details:');
    console.error('  - URI:', MONGODB_URI.substring(0, 50) + '...');
    console.error('  - Database:', DB_NAME);
    throw error;
  }
}

// Close database connection
export async function closeDatabase() {
  if (client) {
    await client.close();
  }
}

// Store data type
export interface Store {
  _id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  category: string;
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Brand data type
export interface Brand {
  _id?: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  industry: string;
  stores: Store[];
  createdAt: Date;
  updatedAt: Date;
}

// User data type
export interface User {
  _id?: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  brands: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Review interface for Google Business Profile reviews
export interface Review {
  _id?: ObjectId;
  locationId: string;
  locationName: string;
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewTime: Date;
  updateTime?: Date;
  reviewReply?: {
    comment: string;
    updateTime: Date;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  source: 'google_business' | 'manual';
  isResolved: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Hash password
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const testHash = scryptSync(password, salt, 64).toString('hex');
  return hash === testHash;
}

// Brand Operations
export const brandOperations = {
  async getAllBrands() {
    try {
      const { db } = await connectToDatabase();
      if (!db) {
        throw new Error('Database connection failed');
      }
      return await db.collection('brands').find({}).toArray();
    } catch (error) {
      console.error('Error in getAllBrands:', error);
      throw error;
    }
  },

  async getBrandById(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('brands').findOne({ _id: new ObjectId(id) });
  },

  async getBrandBySlug(slug: string) {
    const { db } = await connectToDatabase();
    return await db.collection('brands').findOne({ brandSlug: slug });
  },

  async createBrand(brandData: any) {
    const { db } = await connectToDatabase();
    const result = await db.collection('brands').insertOne({
      ...brandData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...brandData, _id: result.insertedId };
  },

  async updateBrand(id: string, updateData: any) {
    const { db } = await connectToDatabase();
    return await db.collection('brands').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  },

  async deleteBrand(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('brands').deleteOne({ _id: new ObjectId(id) });
  },

  async isBrandSlugUnique(slug: string, excludeId?: string) {
    const { db } = await connectToDatabase();
    const query: any = { brandSlug: slug };
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }
    const existing = await db.collection('brands').findOne(query);
    return !existing;
  },

  async updateGoogleBusinessConnection(id: string, connectionData: any) {
    const { db } = await connectToDatabase();
    return await db.collection('brands').updateOne(
      { _id: new ObjectId(id) },
      { $set: { googleBusiness: connectionData, updatedAt: new Date() } }
    );
  }
};

// Store Operations
export const storeOperations = {
  async getAllStores() {
    const { db } = await connectToDatabase();
    return await db.collection('stores').find({}).toArray();
  },

  async getStoresByBrand(brandId: string) {
    const { db } = await connectToDatabase();
    return await db.collection('stores').find({ brandId }).toArray();
  },

  async getStoreById(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('stores').findOne({ _id: new ObjectId(id) });
  },

  async createStore(storeData: any) {
    const { db } = await connectToDatabase();
    const result = await db.collection('stores').insertOne({
      ...storeData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...storeData, _id: result.insertedId };
  },

  async updateStore(id: string, updateData: any) {
    const { db } = await connectToDatabase();
    return await db.collection('stores').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  },

  async deleteStore(id: string) {
    const { db } = await connectToDatabase();
    return await db.collection('stores').deleteOne({ _id: new ObjectId(id) });
  },

  async isStoreCodeUnique(code: string, excludeId?: string) {
    const { db } = await connectToDatabase();
    const query: any = { storeCode: code };
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }
    const existing = await db.collection('stores').findOne(query);
    return !existing;
  },

  async isStoreSlugUnique(slug: string, excludeId?: string) {
    const { db } = await connectToDatabase();
    const query: any = { storeSlug: slug };
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }
    const existing = await db.collection('stores').findOne(query);
    return !existing;
  }
};

// User Operations
export const userOperations = {
  async findByEmail(email: string) {
    const { db } = await connectToDatabase();
    return await db.collection('users').findOne({ email });
  },

  async createUser(userData: any) {
    const { db } = await connectToDatabase();
    const result = await db.collection('users').insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...userData, _id: result.insertedId };
  },

  async setPassword(email: string, password: string) {
    const { db } = await connectToDatabase();
    const hashedPassword = hashPassword(password);
    return await db.collection('users').updateOne(
      { email },
      { $set: { passwordHash: hashedPassword, updatedAt: new Date() } }
    );
  }
}; 

// Review Operations
export const reviewOperations = {
  async createReview(reviewData: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { db } = await connectToDatabase();
      const review: Review = {
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('reviews').insertOne(review);
      return { ...review, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  async getReviewsByLocation(locationId: string) {
    try {
      const { db } = await connectToDatabase();
      return await db.collection('reviews')
        .find({ locationId })
        .sort({ reviewTime: -1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching reviews by location:', error);
      throw error;
    }
  },

  async getAllReviews() {
    try {
      const { db } = await connectToDatabase();
      return await db.collection('reviews')
        .find({})
        .sort({ reviewTime: -1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  },

  async updateReview(reviewId: string, updateData: Partial<Review>) {
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('reviews').updateOne(
        { reviewId },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  async addReviewReply(reviewId: string, replyComment: string) {
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('reviews').updateOne(
        { reviewId },
        { 
          $set: { 
            reviewReply: {
              comment: replyComment,
              updateTime: new Date()
            },
            updatedAt: new Date()
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error adding review reply:', error);
      throw error;
    }
  },

  async deleteReview(reviewId: string) {
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection('reviews').deleteOne({ reviewId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  async getReviewStats() {
    try {
      const { db } = await connectToDatabase();
      const pipeline = [
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            positiveReviews: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } },
            negativeReviews: { $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] } },
            neutralReviews: { $sum: { $cond: [{ $and: [{ $gt: ['$rating', 2] }, { $lt: ['$rating', 4] }] }, 1, 0] } }
          }
        }
      ];
      const result = await db.collection('reviews').aggregate(pipeline).toArray();
      return result[0] || {
        totalReviews: 0,
        averageRating: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        neutralReviews: 0
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw error;
    }
  }
}; 