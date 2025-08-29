
export const reviews = [
  {
    rating: 5,
    text: "Absolutely fantastic service! The plumber arrived on time and fixed the issue quickly. Highly recommended.",
    store: "Downtown Branch",
    customer: "Jane Doe",
    date: "2024-07-20",
    tags: ["Excellent Service", "Punctual", "Fast"],
    source: "GMB",
    status: "Replied",
    notes: "Followed up with a thank you note.",
    complaints: [],
    feedback: ["Great Service"],
    sentiment: "Positive",
  },
  {
    rating: 2,
    text: "The technician was late and didn't seem to know what he was doing. The problem is still not fixed.",
    store: "Westwood Store",
    customer: "John Smith",
    date: "2024-07-19",
    tags: ["Late Arrival", "Service Issue", "Late"],
    source: "Manual",
    status: "Not Replied",
    notes: "",
    complaints: ["Late Arrival", "Unresolved Issue"],
    feedback: [],
    sentiment: "Negative",
  },
  {
    rating: 4,
    text: "Good service overall, but a bit pricey compared to others.",
    store: "River North",
    customer: "Emily White",
    date: "2024-07-18",
    tags: ["Pricing", "Price"],
    source: "GMB",
    status: "Replied",
    notes: "",
    complaints: ["High Price"],
    feedback: ["Good Service"],
    sentiment: "Positive",
  },
  {
    rating: 1,
    text: "The store was not clean and the staff was rude. A very bad experience.",
    store: "South Beach",
    customer: "Michael Brown",
    date: "2024-07-17",
    tags: ["Cleanliness", "Rude Staff", "Rude"],
    source: "Internal",
    status: "Not Replied",
    notes: "Action assigned to store manager.",
    complaints: ["Cleanliness", "Rude Staff"],
    feedback: ["Bad Experience"],
    sentiment: "Negative",
  },
  {
    rating: 5,
    text: "Loved the new coffee blend! So fresh.",
    store: "Downtown Branch",
    customer: "Sarah Lee",
    date: "2024-07-21",
    tags: ["Product", "Fresh", "Recommended"],
    source: "GMB",
    status: "Replied",
    notes: "",
    complaints: [],
    feedback: ["Fresh", "Good taste"],
    sentiment: "Positive",
  },
  {
    rating: 3,
    text: "My bagel was stale. Disappointing.",
    store: "Westwood Store",
    customer: "Chris Green",
    date: "2024-07-20",
    tags: ["Product", "Stale"],
    source: "Manual",
    status: "Not Replied",
    notes: "",
    complaints: ["Stale"],
    feedback: ["Stale"],
    sentiment: "Neutral",
  },
];

// Sample brand data with locations and reviews
export const sampleBrand = {
  id: 'colive-brand-001',
  name: 'Colive',
  description: 'Premium co-living spaces for students and young professionals',
  logo: '/images/colive-logo.png',
  website: 'https://www.colive.com',
  industry: 'Real Estate & Hospitality',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date(),
  status: 'active' as const,
  stores: [
    {
      _id: 'colive-918-cape-town',
      brandId: 'colive-brand-001',
      storeCode: 'COLIVE_001',
      storeName: 'Colive 918 Cape Town',
      storeSlug: 'colive-918-cape-town',
      email: 'info@colive.com',
      phone: '+91 96190 67592',
      address: {
        line1: 'Plot Number 472, Mysore Rd, opposite to Raj Residency',
        line2: '',
        locality: 'Kengeri',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560060',
        country: 'India',
        latitude: '12.9716',
        longitude: '77.5946',
        placeId: 'ChIJ77-sZlw_rjsR-YE1IZk_2h8'
      },
      primaryCategory: 'Student dormitory',
      additionalCategories: ['Co-living', 'PG Accommodation'],
      tags: ['Student-friendly', 'Furnished', 'WiFi', 'Food included'],
      amenities: {
        parking: true,
        delivery: false
      },
      hours: {
        monday: { open: '06:00', close: '23:00', closed: false },
        tuesday: { open: '06:00', close: '23:00', closed: false },
        wednesday: { open: '06:00', close: '23:00', closed: false },
        thursday: { open: '06:00', close: '23:00', closed: false },
        friday: { open: '06:00', close: '23:00', closed: false },
        saturday: { open: '06:00', close: '23:00', closed: false },
        sunday: { open: '06:00', close: '23:00', closed: false }
      },
      microsite: {
        heroImage: '/images/colive-918-cape-town-hero.jpg',
        heroHint: 'Premium Student Accommodation',
        tagline: 'Live, Learn, Grow Together'
      },
      socialLinks: {
        facebook: 'https://facebook.com/colive',
        instagram: 'https://instagram.com/colive',
        website: 'https://www.colive.com/bangalore/pg-in-mysoreroad/colive-918-cape-town/colive_ppm_44932'
      },
      seo: {
        title: 'Colive 918 Cape Town - Premium PG in Kengeri, Bangalore',
        description: 'Best student accommodation in Kengeri, Bangalore. Fully furnished rooms with food, WiFi, and modern amenities.',
        keywords: 'PG accommodation, student housing, co-living, Bangalore, Kengeri'
      },
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date(),
      status: 'live' as const
    },
    {
      _id: 'colive-1180-columbus',
      brandId: 'colive-brand-001',
      storeCode: 'COLIVE_002',
      storeName: 'Colive 1180 Columbus',
      storeSlug: 'colive-1180-columbus',
      email: 'info@colive.com',
      phone: '+91 96190 63686',
      address: {
        line1: 'WPV2+3PC, Panathur Main Rd',
        line2: '',
        locality: 'Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        country: 'India',
        latitude: '12.9352',
        longitude: '77.6245',
        placeId: 'ChIJhQEtavATrjsRaXcQFyxR_t4'
      },
      primaryCategory: 'Student dormitory',
      additionalCategories: ['Co-living', 'PG Accommodation'],
      tags: ['Student-friendly', 'Furnished', 'WiFi', 'Food included', 'Near Tech Park'],
      amenities: {
        parking: true,
        delivery: true
      },
      hours: {
        monday: { open: '06:00', close: '23:00', closed: false },
        tuesday: { open: '06:00', close: '23:00', closed: false },
        wednesday: { open: '06:00', close: '23:00', closed: false },
        thursday: { open: '06:00', close: '23:00', closed: false },
        friday: { open: '06:00', close: '23:00', closed: false },
        saturday: { open: '06:00', close: '23:00', closed: false },
        sunday: { open: '06:00', close: '23:00', closed: false }
      },
      microsite: {
        heroImage: '/images/colive-1180-columbus-hero.jpg',
        heroHint: 'Premium Student Accommodation',
        tagline: 'Your Home Away From Home'
      },
      socialLinks: {
        facebook: 'https://facebook.com/colive',
        instagram: 'https://instagram.com/colive',
        website: 'https://www.colive.com/bangalore/pg-in-bellandur/colive-1180-columbus/colive_ppm_53228'
      },
      seo: {
        title: 'Colive 1180 Columbus - Best PG in Bellandur, Bangalore',
        description: 'Premium student accommodation in Bellandur, Bangalore. Modern amenities, great location near tech parks.',
        keywords: 'PG accommodation, student housing, co-living, Bangalore, Bellandur, tech park'
      },
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date(),
      status: 'live' as const
    }
  ]
};

// Sample reviews data
export const sampleReviews = [
  {
    id: 'review-001',
    storeId: 'colive-918-cape-town',
    storeName: 'Colive 918 Cape Town',
    reviewerName: 'Rahul Sharma',
    reviewerEmail: 'rahul.sharma@email.com',
    rating: 5,
    title: 'Excellent accommodation for students',
    content: 'Great place to stay! Clean rooms, good food, and friendly staff. The location is perfect for students.',
    response: 'Thank you Rahul! We\'re glad you had a great experience.',
    status: 'published' as const,
    source: 'google' as const,
    helpfulCount: 12,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'review-002',
    storeId: 'colive-918-cape-town',
    storeName: 'Colive 918 Cape Town',
    reviewerName: 'Priya Patel',
    reviewerEmail: 'priya.patel@email.com',
    rating: 4,
    title: 'Good place but could be better',
    content: 'Overall good experience. Rooms are clean and food is decent. Some amenities could be improved.',
    response: 'Thank you for your feedback Priya. We\'re working on improving our amenities.',
    status: 'published' as const,
    source: 'google' as const,
    helpfulCount: 8,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date()
  },
  {
    id: 'review-003',
    storeId: 'colive-1180-columbus',
    storeName: 'Colive 1180 Columbus',
    reviewerName: 'Amit Kumar',
    reviewerEmail: 'amit.kumar@email.com',
    rating: 5,
    title: 'Perfect for working professionals',
    content: 'Amazing place! Great location near tech parks, modern amenities, and very professional staff.',
    response: 'Thank you Amit! We\'re happy you found it perfect for your needs.',
    status: 'published' as const,
    source: 'google' as const,
    helpfulCount: 15,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  },
  {
    id: 'review-004',
    storeId: 'colive-1180-columbus',
    storeName: 'Colive 1180 Columbus',
    reviewerName: 'Neha Singh',
    reviewerEmail: 'neha.singh@email.com',
    rating: 3,
    title: 'Average experience',
    content: 'The place is okay but the food quality has gone down recently. Staff is helpful though.',
    response: 'We apologize for the food quality issue. We\'ve addressed this with our kitchen team.',
    status: 'published' as const,
    source: 'google' as const,
    helpfulCount: 5,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date()
  }
];

// Sample dashboard metrics
export const sampleDashboardMetrics = {
  totalStores: 2,
  totalReviews: 4,
  averageRating: 4.25,
  totalRevenue: 250000,
  monthlyGrowth: 12.5,
  topPerformingStore: 'Colive 918 Cape Town',
  recentActivity: [
    {
      type: 'review',
      message: 'New 5-star review from Rahul Sharma',
      timestamp: new Date('2024-01-15T10:30:00'),
      storeName: 'Colive 918 Cape Town'
    },
    {
      type: 'booking',
      message: 'New booking for 2 months',
      timestamp: new Date('2024-01-14T15:45:00'),
      storeName: 'Colive 1180 Columbus'
    },
    {
      type: 'maintenance',
      message: 'Maintenance request completed',
      timestamp: new Date('2024-01-13T09:20:00'),
      storeName: 'Colive 918 Cape Town'
    }
  ]
};
