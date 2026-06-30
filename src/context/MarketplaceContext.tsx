import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, uploadImage } from '../utils/supabaseClient';

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  location?: string;
  instagram?: string;
  whatsapp?: string;
  ownerId: string;
  isFeatured: boolean; // Future monetization flag
  isSponsored: boolean; // Future monetization flag
  views: number;
  clicks: number;
  theme?: 'minimalist' | 'streetwear' | 'linen' | 'leather' | 'custom';
  subscriptionTier?: 'bronze' | 'silver' | 'gold';
  subscriptionStatus?: 'active' | 'inactive';
  subscriptionExpiresAt?: string;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  category: 'Men' | 'Women' | 'Kids' | 'Accessories';
  images: string[];
  variants: ProductVariant[];
  isBestSeller: boolean;
  isTrending: boolean;
  isSponsored: boolean; // Future monetization
  views: number;
  clicks: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // plain text for simulated authentication
  role: 'customer' | 'seller' | 'admin';
  storeId?: string; // If role is seller, links to their store
  subscriptionTier?: 'none' | 'bronze' | 'silver' | 'gold';
  subscriptionStatus?: 'active' | 'inactive';
  subscriptionExpiresAt?: string;
  adminRequest?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface CartItem {
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  storeId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  usageCount: number;
}

export interface ChatMessage {
  id: string;
  storeId: string;
  customerId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface LookbookItem {
  productId: string;
  selectedColor: string;
  selectedSize: string;
}

export interface LookbookPin {
  x: number;
  y: number;
  productId: string;
}

export interface Lookbook {
  id: string;
  storeId: string;
  name: string;
  description: string;
  items: LookbookItem[];
  creatorName: string;
  isOfficial: boolean;
  createdAt: string;
  image?: string;
  pins?: LookbookPin[];
}

interface MarketplaceContextType {
  stores: Store[];
  products: Product[];
  currentUser: User | null;
  favorites: {
    products: string[];
    stores: string[];
  };
  recentlyViewed: string[];
  currentPage: 'home' | 'store' | 'product' | 'dashboard' | 'admin' | 'checkout' | 'customer-orders' | 'lookbooks' | 'privacy' | 'terms';
  activeStoreSlug: string | null;
  activeProductId: string | null;
  cart: CartItem[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  navigateToHome: () => void;
  navigateToStore: (slug: string) => void;
  navigateToProduct: (id: string) => void;
  navigateToDashboard: () => void;
  navigateToAdmin: () => void;
  navigateToCheckout: () => void;
  navigateToCustomerOrders: () => void;
  navigateToLookbooks: () => void;
  navigateToPrivacy: () => void;
  navigateToTerms: () => void;
  registerStore: (storeData: Omit<Store, 'id' | 'ownerId' | 'views' | 'clicks' | 'isFeatured' | 'isSponsored'>) => Promise<Store>;
  updateStore: (storeId: string, storeData: Partial<Store>) => Promise<void>;
  addProduct: (storeId: string, productData: Omit<Product, 'id' | 'storeId' | 'views' | 'clicks' | 'createdAt'>) => Promise<Product>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteStore: (storeId: string) => void;
  trackView: (type: 'store' | 'product', id: string) => Promise<void>;
  trackClick: (type: 'store' | 'product', id: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, role: User['role']) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  users: User[];
  promoteStore: (storeId: string, type: 'featured' | 'sponsored') => Promise<void>;
  promoteProduct: (productId: string) => Promise<void>;
  deleteStoreGlobal: (storeId: string) => Promise<void>;
  deleteProductGlobal: (productId: string) => Promise<void>;
  addToCart: (productId: string, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  checkoutCart: (customerInfo: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
  }, appliedCoupons?: { [storeId: string]: string }) => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrderGlobal: (orderId: string) => Promise<void>;
  addProductReview: (productId: string, reviewData: Omit<Review, 'id' | 'createdAt' | 'productId'>) => Promise<void>;
  deleteReviewGlobal: (reviewId: string) => Promise<void>;
  addCoupon: (storeId: string, couponData: Omit<Coupon, 'id' | 'storeId' | 'usageCount'>) => Promise<Coupon>;
  deleteCoupon: (couponId: string) => Promise<void>;
  toggleCouponStatus: (couponId: string) => Promise<void>;
  messages: ChatMessage[];
  sendChatMessage: (storeId: string, customerId: string, text: string, senderId: string, senderName: string) => Promise<void>;
  lookbooks: Lookbook[];
  addLookbook: (storeId: string, name: string, description: string, items: LookbookItem[], creatorName: string, isOfficial: boolean, image?: string, pins?: LookbookPin[]) => Promise<void>;
  deleteLookbook: (lookbookId: string) => Promise<void>;
  addLookbookBundleToCart: (items: LookbookItem[]) => void;
  updateUserSubscription: (userId: string, tier: 'none' | 'bronze' | 'silver' | 'gold', status: 'active' | 'inactive', expiresAt: string) => Promise<void>;
  updateStoreSubscription: (storeId: string, tier: 'bronze' | 'silver' | 'gold', status: 'active' | 'inactive', expiresAt: string) => Promise<void>;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
  linkUserToDemoStore: () => Promise<void>;
  submitAdminRequest: (userId: string) => Promise<void>;
  approveAdminRequest: (userId: string, approve: boolean) => Promise<void>;
  promoteToSellerDirect: (userId: string) => Promise<void>;
  unlockAdminAccess: (password: string) => boolean;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    storeId: 'store-1',
    code: 'ATELIER10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    isActive: true,
    usageCount: 5
  },
  {
    id: 'coup-2',
    storeId: 'store-2',
    code: 'MB2000',
    discountType: 'fixed',
    discountValue: 2000,
    minOrderAmount: 20000,
    isActive: true,
    usageCount: 3
  },
  {
    id: 'coup-3',
    storeId: 'store-3',
    code: 'AURA500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 5000,
    isActive: true,
    usageCount: 12
  },
  {
    id: 'coup-4',
    storeId: 'store-4',
    code: 'SOL15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 10000,
    isActive: true,
    usageCount: 8
  }
];

// Initial Mock Seed Data
const DEFAULT_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Atelier Noir',
    slug: 'atelier-noir',
    description: 'Minimalist luxury tailored wardrobe. Crafted in clean lines, premium wools, and deep monochrome tones for the modern aesthete.',
    logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    location: 'Paris, France',
    instagram: 'atelier.noir',
    whatsapp: '+33123456789',
    ownerId: 'user-seller-1',
    isFeatured: true,
    isSponsored: false,
    views: 1240,
    clicks: 432,
    theme: 'minimalist',
    subscriptionTier: 'gold',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z'
  },
  {
    id: 'store-2',
    name: 'Maison Blanc',
    slug: 'maison-blanc',
    description: 'Breathable, relaxed linen apparel designed for sunny getaways and leisurely afternoons. Pure colors and timeless organic textures.',
    logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    location: 'Milano, Italy',
    instagram: 'maison.blanc',
    whatsapp: '+3902345678',
    ownerId: 'user-seller-2',
    isFeatured: true,
    isSponsored: false,
    views: 980,
    clicks: 280,
    theme: 'linen',
    subscriptionTier: 'silver',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z'
  },
  {
    id: 'store-3',
    name: 'Aura Studio',
    slug: 'aura-studio',
    description: 'Contemporary streetwear pushing the boundaries of shape and silhouette. Gender-neutral designs, oversized hoodies, and technical cargo garments.',
    logo: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    location: 'Tokyo, Japan',
    instagram: 'aura.studio',
    whatsapp: '+8190123456',
    ownerId: 'user-seller-3',
    isFeatured: false,
    isSponsored: true,
    views: 1820,
    clicks: 645,
    theme: 'streetwear',
    subscriptionTier: 'silver',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z'
  },
  {
    id: 'store-4',
    name: 'Sol & Luna',
    slug: 'sol-and-luna',
    description: 'Artisanal leather goods, sculptural jewelry, and curated items designed to complete any ensemble with raw geometric beauty.',
    logo: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441984969893-c5a6e5057d4c?w=1200&auto=format&fit=crop&q=80',
    location: 'Barcelona, Spain',
    instagram: 'sol.luna.studio',
    whatsapp: '+34612345678',
    ownerId: 'user-seller-4',
    isFeatured: false,
    isSponsored: false,
    views: 750,
    clicks: 190,
    theme: 'leather',
    subscriptionTier: 'bronze',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: '2026-12-31T23:59:59.000Z'
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    name: 'Cashmere Double-Breasted Trench',
    description: 'Expertly tailored trench coat made from 100% fine Mongolian cashmere. Structured shoulders, double-breasted closure, and a matching waist belt. An investment piece designed to last generations.',
    price: 49400,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'XS', color: 'Charcoal', stock: 5 },
      { size: 'S', color: 'Charcoal', stock: 12 },
      { size: 'M', color: 'Charcoal', stock: 8 },
      { size: 'L', color: 'Charcoal', stock: 4 },
      { size: 'M', color: 'Camel', stock: 6 }
    ],
    isBestSeller: true,
    isTrending: true,
    isSponsored: false,
    views: 450,
    clicks: 120,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    name: 'Tailored Single-Breasted Blazer',
    description: 'An essential blazer structured in fine Italian wool. Features neat notch lapels, a single button closure, and fully lined interior. Fits true to size with a slightly relaxed waist.',
    price: 31200,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'S', color: 'Deep Black', stock: 10 },
      { size: 'M', color: 'Deep Black', stock: 15 },
      { size: 'L', color: 'Deep Black', stock: 8 }
    ],
    isBestSeller: false,
    isTrending: true,
    isSponsored: false,
    views: 310,
    clicks: 98,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-3',
    storeId: 'store-1',
    name: 'Unisex Silk Turtleneck',
    description: 'Ultra-soft knit crafted from a silk and cotton blend. Offers a light, breathable warmth, mock-turtleneck collar, and ribbed cuffs. Perfect for layering under tailoring.',
    price: 23400,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1616847220516-70e28f3223ce?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'S', color: 'Off-White', stock: 7 },
      { size: 'M', color: 'Off-White', stock: 9 },
      { size: 'L', color: 'Off-White', stock: 11 },
      { size: 'XL', color: 'Off-White', stock: 4 }
    ],
    isBestSeller: false,
    isTrending: false,
    isSponsored: false,
    views: 180,
    clicks: 45,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-4',
    storeId: 'store-2',
    name: 'Relaxed Pure Linen Shirt',
    description: 'Cut from certified organic Belgian flax. Pre-washed for superior softness and a casual, lived-in feel. Tailored with a relaxed collar and chest pocket.',
    price: 15600,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'S', color: 'Natural White', stock: 20 },
      { size: 'M', color: 'Natural White', stock: 25 },
      { size: 'L', color: 'Natural White', stock: 18 },
      { size: 'XL', color: 'Natural White', stock: 10 },
      { size: 'M', color: 'Sky Blue', stock: 12 }
    ],
    isBestSeller: true,
    isTrending: false,
    isSponsored: false,
    views: 520,
    clicks: 167,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-5',
    storeId: 'store-2',
    name: 'Pleated Linen Trousers',
    description: 'High-waisted trousers featuring elegant front pleats and a wide-leg silhouette. Drawstring interior waistband provides comfortable tailoring. Styled beautifully with linen shirts.',
    price: 20800,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'XS', color: 'Sand', stock: 6 },
      { size: 'S', color: 'Sand', stock: 14 },
      { size: 'M', color: 'Sand', stock: 12 },
      { size: 'L', color: 'Sand', stock: 8 }
    ],
    isBestSeller: false,
    isTrending: true,
    isSponsored: false,
    views: 390,
    clicks: 112,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-6',
    storeId: 'store-3',
    name: 'Oversized Heavyweight Hoodie',
    description: 'Crafted from 500GSM organic loopback cotton. Pre-shrunk and custom-dyed for a washed look. Dropped shoulders, kangaroo pocket, and no drawstrings for a clean futuristic streetwear silhouette.',
    price: 12350,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'S', color: 'Washed Grey', stock: 15 },
      { size: 'M', color: 'Washed Grey', stock: 22 },
      { size: 'L', color: 'Washed Grey', stock: 30 },
      { size: 'XL', color: 'Washed Grey', stock: 18 }
    ],
    isBestSeller: true,
    isTrending: true,
    isSponsored: true,
    views: 890,
    clicks: 340,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-7',
    storeId: 'store-3',
    name: 'Cargo Utility Pants',
    description: 'Technical cargo pants designed in water-resistant ripstop fabric. Relaxed fit, double cargo side pockets, toggle adjustable cuffs, and reinforced stitching.',
    price: 17550,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'S', color: 'Olive Green', stock: 8 },
      { size: 'M', color: 'Olive Green', stock: 12 },
      { size: 'L', color: 'Olive Green', stock: 14 }
    ],
    isBestSeller: false,
    isTrending: false,
    isSponsored: false,
    views: 260,
    clicks: 74,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-8',
    storeId: 'store-4',
    name: 'Sculptural Gold Hoop Earrings',
    description: 'Thick, organically shaped gold hoops hand-cast in 24k gold-plated recycled sterling silver. Hollow construction for comfortable all-day wear.',
    price: 11050,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'One Size', color: 'Gold', stock: 40 }
    ],
    isBestSeller: true,
    isTrending: false,
    isSponsored: false,
    views: 400,
    clicks: 110,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-9',
    storeId: 'store-4',
    name: 'Full Grain Leather Tote',
    description: 'Handmade luxury tote made of vegetable-tanned full-grain leather. Unlined interior, raw edges, internal zip pocket, and durable double-layer shoulder straps. Fits up to a 16" laptop.',
    price: 37700,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { size: 'One Size', color: 'Cognac', stock: 8 },
      { size: 'One Size', color: 'Noir', stock: 12 }
    ],
    isBestSeller: false,
    isTrending: true,
    isSponsored: false,
    views: 480,
    clicks: 135,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// --- DB Mapping Helpers ---
const mapDbStoreToStore = (s: any): Store => ({
  id: s.id,
  name: s.name,
  slug: s.slug,
  description: s.description || '',
  logo: s.logo || '',
  banner: s.banner || '',
  location: s.location || '',
  instagram: s.instagram || '',
  whatsapp: s.whatsapp || '',
  ownerId: s.owner_id,
  isFeatured: s.is_featured || false,
  isSponsored: s.is_sponsored || false,
  views: s.views || 0,
  clicks: s.clicks || 0,
  theme: s.theme || 'minimalist',
  subscriptionTier: s.subscription_tier || 'bronze',
  subscriptionStatus: s.subscription_status || 'active',
  subscriptionExpiresAt: s.subscription_expires_at || '',
});

const mapStoreToDbStore = (s: any) => ({
  id: s.id,
  name: s.name,
  slug: s.slug,
  description: s.description,
  logo: s.logo,
  banner: s.banner,
  location: s.location,
  instagram: s.instagram,
  whatsapp: s.whatsapp,
  owner_id: s.ownerId,
  is_featured: s.isFeatured,
  is_sponsored: s.isSponsored,
  views: s.views,
  clicks: s.clicks,
  theme: s.theme,
  subscription_tier: s.subscriptionTier,
  subscription_status: s.subscriptionStatus,
  subscription_expires_at: s.subscriptionExpiresAt,
});

const mapDbProductToProduct = (p: any): Product => ({
  id: p.id,
  storeId: p.store_id,
  name: p.name,
  description: p.description || '',
  price: Number(p.price),
  category: p.category,
  images: p.images || [],
  variants: p.variants || [],
  isBestSeller: p.is_best_seller || false,
  isTrending: p.is_trending || false,
  isSponsored: p.is_sponsored || false,
  views: p.views || 0,
  clicks: p.clicks || 0,
  createdAt: p.created_at || new Date().toISOString(),
});

const mapProductToDbProduct = (p: any) => ({
  id: p.id,
  store_id: p.storeId,
  name: p.name,
  description: p.description,
  price: p.price,
  category: p.category,
  images: p.images,
  variants: p.variants,
  is_best_seller: p.isBestSeller,
  is_trending: p.isTrending,
  is_sponsored: p.isSponsored,
  views: p.views,
  clicks: p.clicks,
  created_at: p.createdAt,
});

const mapDbCouponToCoupon = (c: any): Coupon => ({
  id: c.id,
  storeId: c.store_id,
  code: c.code,
  discountType: c.discount_type,
  discountValue: Number(c.discount_value),
  minOrderAmount: Number(c.min_order_amount || 0),
  isActive: c.is_active || false,
  usageCount: c.usage_count || 0
});

const mapCouponToDbCoupon = (c: any) => ({
  id: c.id,
  store_id: c.storeId,
  code: c.code,
  discount_type: c.discountType,
  discount_value: c.discountValue,
  min_order_amount: c.minOrderAmount,
  is_active: c.isActive,
  usage_count: c.usageCount
});

const mapDbReviewToReview = (r: any): Review => ({
  id: r.id,
  productId: r.product_id,
  customerName: r.customer_name,
  rating: r.rating,
  comment: r.comment || '',
  createdAt: r.created_at || new Date().toISOString()
});

const mapReviewToDbReview = (r: any) => ({
  id: r.id,
  product_id: r.productId,
  customer_name: r.customerName,
  rating: r.rating,
  comment: r.comment,
  created_at: r.createdAt
});

const mapDbLookbookToLookbook = (l: any): Lookbook => {
  const descParts = (l.description || '').split('|||');
  let pins: LookbookPin[] = [];
  try {
    if (descParts[2]) {
      pins = JSON.parse(descParts[2]);
    }
  } catch (err) {
    console.error('Failed to parse lookbook pins:', err);
  }
  return {
    id: l.id,
    storeId: l.store_id,
    name: l.name,
    description: descParts[0] || '',
    items: l.items || [],
    creatorName: l.creator_name,
    isOfficial: l.is_official || false,
    createdAt: l.created_at || new Date().toISOString(),
    image: descParts[1] || undefined,
    pins
  };
};

const mapLookbookToDbLookbook = (l: any) => {
  const pinsStr = l.pins ? JSON.stringify(l.pins) : '[]';
  const descSerialized = `${l.description}|||${l.image || ''}|||${pinsStr}`;
  return {
    id: l.id,
    store_id: l.storeId,
    name: l.name,
    description: descSerialized,
    items: l.items,
    creator_name: l.creatorName,
    is_official: l.isOfficial,
    created_at: l.createdAt
  };
};

const mapDbMessageToMessage = (m: any): ChatMessage => ({
  id: m.id,
  storeId: m.store_id,
  customerId: m.customer_id,
  senderId: m.sender_id,
  senderName: m.sender_name,
  text: m.text,
  createdAt: m.created_at || new Date().toISOString()
});

const mapMessageToDbMessage = (m: any) => ({
  id: m.id,
  store_id: m.storeId,
  customer_id: m.customerId,
  sender_id: m.senderId,
  sender_name: m.senderName,
  text: m.text,
  created_at: m.createdAt
});

const mapDbOrderToOrder = (o: any): Order => ({
  id: o.id,
  storeId: o.store_id,
  customerName: o.customer_name,
  customerEmail: o.customer_email,
  customerPhone: o.customer_phone,
  shippingAddress: o.shipping_address,
  items: o.items || [],
  totalAmount: Number(o.total_amount),
  status: o.status,
  createdAt: o.created_at || new Date().toISOString()
});

const mapOrderToDbOrder = (o: any) => ({
  id: o.id,
  store_id: o.storeId,
  customer_name: o.customerName,
  customer_email: o.customerEmail,
  customer_phone: o.customerPhone,
  shipping_address: o.shippingAddress,
  items: o.items,
  total_amount: o.totalAmount,
  status: o.status,
  created_at: o.createdAt
});

const mapDbProfileToUser = (p: any): User => ({
  id: p.id,
  name: p.name || 'User',
  email: p.email || '',
  role: p.role || 'customer',
  storeId: p.store_id || undefined,
  subscriptionTier: p.subscription_tier || 'none',
  subscriptionStatus: p.subscription_status || 'inactive',
  subscriptionExpiresAt: p.subscription_expires_at || '',
  adminRequest: p.admin_request || 'none'
});

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: 'user-1', name: 'Alisha Thapa', email: 'alisha@example.com', role: 'customer', adminRequest: 'none' },
    { id: 'user-2', name: 'Sanchit Ojha', email: 'sanchit@example.com', role: 'customer', adminRequest: 'none' },
    { id: 'user-3', name: 'Rohan Shrestha', email: 'rohan@example.com', role: 'customer', adminRequest: 'none' }
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const isAdmin = localStorage.getItem('clothza_admin_logged_in') === 'true';
    if (isAdmin) {
      return { id: 'admin', name: 'Super Admin', email: 'admin@clothza.com', role: 'admin', adminRequest: 'none' };
    }
    return { id: 'guest-customer', name: 'Guest Customer', email: 'guest@clothza.com', role: 'customer', adminRequest: 'none' };
  });
  const [favorites, setFavorites] = useState<{ products: string[]; stores: string[] }>({
    products: [],
    stores: [],
  });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'store' | 'product' | 'dashboard' | 'admin' | 'checkout' | 'customer-orders' | 'lookbooks' | 'privacy' | 'terms'>('home');
  const [activeStoreSlug, setActiveStoreSlug] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);

  const navigateToHome = () => {
    setCurrentPage('home');
    setActiveStoreSlug(null);
    setActiveProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = (slug: string) => {
    setActiveStoreSlug(slug);
    setActiveProductId(null);
    setCurrentPage('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (id: string) => {
    setActiveProductId(id);
    setCurrentPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setCurrentPage('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = () => {
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCustomerOrders = () => {
    setCurrentPage('customer-orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLookbooks = () => {
    setCurrentPage('lookbooks');
    setActiveStoreSlug(null);
    setActiveProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPrivacy = () => {
    setCurrentPage('privacy');
    setActiveStoreSlug(null);
    setActiveProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTerms = () => {
    setCurrentPage('terms');
    setActiveStoreSlug(null);
    setActiveProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load session and remote data on mount
  useEffect(() => {
    // 1. Handle secret admin auto-login link (fully client-side bypass)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto_login_admin') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('Secret admin login triggered via URL parameter...');
      localStorage.setItem('clothza_admin_logged_in', 'true');
      setCurrentUser({ id: 'admin', name: 'Super Admin', email: 'admin@clothza.com', role: 'admin', adminRequest: 'none' });
    }

    // 2. Load other Supabase collections
    const loadData = async () => {
      try {
        // Load public profiles to populate users state (fallbacks to mock users if table doesn't exist)
        let { data: dbProfiles, error: profilesErr } = await supabase.from('profiles').select('*');
        if (!profilesErr && dbProfiles) {
          setUsers(dbProfiles.map(mapDbProfileToUser));
        }

        // 1. Load Stores
        let { data: dbStores, error: storesErr } = await supabase.from('stores').select('*');
        if (storesErr || !dbStores || dbStores.length === 0) {
          console.log('Database empty, seeding default stores...');
          const { data: seededStores, error: seedStoresErr } = await supabase
            .from('stores')
            .insert(DEFAULT_STORES.map(mapStoreToDbStore))
            .select();
            
          if (!seedStoresErr && seededStores) {
            dbStores = seededStores;
          } else {
            console.error('Seeding stores failed:', seedStoresErr);
          }
        }
        if (dbStores) {
          setStores(dbStores.map(mapDbStoreToStore));
        }

        // 2. Load Products
        let { data: dbProducts, error: prodsErr } = await supabase.from('products').select('*');
        if (prodsErr || !dbProducts || dbProducts.length === 0) {
          console.log('Database empty, seeding default products...');
          const { data: seededProducts, error: seedProdsErr } = await supabase
            .from('products')
            .insert(DEFAULT_PRODUCTS.map(mapProductToDbProduct))
            .select();
            
          if (!seedProdsErr && seededProducts) {
            dbProducts = seededProducts;
          } else {
            console.error('Seeding products failed:', seedProdsErr);
          }
        }
        if (dbProducts) {
          setProducts(dbProducts.map(mapDbProductToProduct));
        }

        // 3. Load Coupons
        let { data: dbCoupons } = await supabase.from('coupons').select('*');
        if (dbCoupons && dbCoupons.length > 0) {
          setCoupons(dbCoupons.map(mapDbCouponToCoupon));
        } else {
          console.log('Seeding default coupons...');
          const { data: seededCoupons, error: seedCouponsErr } = await supabase
            .from('coupons')
            .insert(DEFAULT_COUPONS.map(mapCouponToDbCoupon))
            .select();
          if (!seedCouponsErr && seededCoupons) {
            setCoupons(seededCoupons.map(mapDbCouponToCoupon));
          } else {
            console.error('Seeding coupons failed:', seedCouponsErr);
            setCoupons(DEFAULT_COUPONS);
          }
        }

        // 4. Load Lookbooks
        let { data: dbLookbooks } = await supabase.from('lookbooks').select('*');
        if (dbLookbooks && dbLookbooks.length > 0) {
          setLookbooks(dbLookbooks.map(mapDbLookbookToLookbook));
        } else {
          console.log('Seeding default lookbooks...');
          const initialLookbooks = [
            {
              id: 'lookbook-1',
              storeId: 'store-1',
              name: 'Monochrome Minimalism',
              description: 'A structural layering showcase merging heavy knit fibers with our iconic trench wrap.',
              items: [
                { productId: 'prod-1', selectedColor: 'Charcoal', selectedSize: 'M' },
                { productId: 'prod-2', selectedColor: 'Deep Black', selectedSize: 'S' }
              ],
              creatorName: 'Atelier Noir Stylists',
              isOfficial: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'lookbook-2',
              storeId: 'store-2',
              name: 'Riviera Sunset Glow',
              description: 'Relaxed styling built around high-grade linen, sand-wash trousers, and lightweight organic elements.',
              items: [
                { productId: 'prod-4', selectedColor: 'Natural White', selectedSize: 'L' },
                { productId: 'prod-5', selectedColor: 'Warm Sand', selectedSize: 'M' }
              ],
              creatorName: 'Maison Blanc',
              isOfficial: true,
              createdAt: new Date().toISOString()
            }
          ];
          const { data: seeded, error: seedLookbooksErr } = await supabase
            .from('lookbooks')
            .insert(initialLookbooks.map(mapLookbookToDbLookbook))
            .select();
          if (!seedLookbooksErr && seeded) {
            setLookbooks(seeded.map(mapDbLookbookToLookbook));
          } else {
            console.error('Seeding lookbooks failed:', seedLookbooksErr);
            setLookbooks(initialLookbooks);
          }
        }

        // 5. Load Messages
        let { data: dbMessages } = await supabase.from('messages').select('*');
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages.map(mapDbMessageToMessage));
        }

        // 6. Load Reviews
        let { data: dbReviews } = await supabase.from('reviews').select('*');
        if (dbReviews && dbReviews.length > 0) {
          setReviews(dbReviews.map(mapDbReviewToReview));
        }

        // 7. Load Orders
        let { data: dbOrders } = await supabase.from('orders').select('*');
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders.map(mapDbOrderToOrder));
        }
      } catch (err) {
        console.error('Error loading Supabase data:', err);
      }
    };

    loadData();

    const savedFavorites = localStorage.getItem('clothza_npr_favorites');
    const savedRecent = localStorage.getItem('clothza_npr_recent');
    const savedCart = localStorage.getItem('clothza_npr_cart');

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));
    if (savedCart) setCart(JSON.parse(savedCart));

    // 8. Real-time subscription for new messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = mapDbMessageToMessage(payload.new as any);
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  // Sync state helpers
  const saveCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('clothza_npr_cart', JSON.stringify(newCart));
  };

  const registerStore = async (storeData: Omit<Store, 'id' | 'ownerId' | 'views' | 'clicks' | 'isFeatured' | 'isSponsored'>) => {
    const ownerId = currentUser?.id || 'user-seller';
    const subTier = (currentUser?.subscriptionTier as any) || 'bronze';
    const subStatus = currentUser?.subscriptionStatus || 'active';
    const subExpires = currentUser?.subscriptionExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const storeId = `store-${Date.now()}`;
    const newStore: Store = {
      ...storeData,
      id: storeId,
      ownerId,
      isFeatured: false,
      isSponsored: false,
      views: 0,
      clicks: 0,
      subscriptionTier: subTier,
      subscriptionStatus: subStatus,
      subscriptionExpiresAt: subExpires
    };

    const { error } = await supabase.from('stores').insert([mapStoreToDbStore(newStore)]);
    
    if (!error) {
      setStores(prev => [...prev, newStore]);
      
      // Update active user's store link in public.profiles
      if (currentUser) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ role: 'seller', store_id: newStore.id })
          .eq('id', currentUser.id);

        if (!profileErr) {
          const updatedUser: User = {
            ...currentUser,
            role: 'seller',
            storeId: newStore.id,
          };
          setCurrentUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        } else {
          console.error('Failed to link store to profile:', profileErr);
        }
      }
      return newStore;
    }
    console.error('Failed to register store in database:', error);
    return null as any;
  };

  const linkUserToDemoStore = async (): Promise<void> => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'seller', store_id: 'store-1' })
      .eq('id', currentUser.id);

    if (!error) {
      const updatedUser: User = {
        ...currentUser,
        role: 'seller',
        storeId: 'store-1',
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    } else {
      console.error('Error linking user to demo store:', error);
    }
  };

  const updateStore = async (storeId: string, storeData: Partial<Store>) => {
    const dbUpdates: any = {};
    if (storeData.name !== undefined) dbUpdates.name = storeData.name;
    if (storeData.description !== undefined) dbUpdates.description = storeData.description;
    if (storeData.logo !== undefined) dbUpdates.logo = storeData.logo;
    if (storeData.banner !== undefined) dbUpdates.banner = storeData.banner;
    if (storeData.location !== undefined) dbUpdates.location = storeData.location;
    if (storeData.instagram !== undefined) dbUpdates.instagram = storeData.instagram;
    if (storeData.whatsapp !== undefined) dbUpdates.whatsapp = storeData.whatsapp;
    if (storeData.theme !== undefined) dbUpdates.theme = storeData.theme;

    const { error } = await supabase.from('stores').update(dbUpdates).eq('id', storeId);
    if (!error) {
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, ...storeData } : s));
    } else {
      console.error('Update store failed:', error);
    }
  };

  const updateUserSubscription = async (userId: string, tier: 'none' | 'bronze' | 'silver' | 'gold', status: 'active' | 'inactive', expiresAt: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: status,
        subscription_expires_at: expiresAt
      })
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = {
            ...u,
            subscriptionTier: tier,
            subscriptionStatus: status,
            subscriptionExpiresAt: expiresAt
          };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      }));
    } else {
      console.error('Update user subscription failed:', error);
    }
  };

  const updateStoreSubscription = async (storeId: string, tier: 'bronze' | 'silver' | 'gold', status: 'active' | 'inactive', expiresAt: string) => {
    const { error } = await supabase.from('stores').update({
      subscription_tier: tier,
      subscription_status: status,
      subscription_expires_at: expiresAt
    }).eq('id', storeId);

    if (!error) {
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, subscriptionTier: tier, subscriptionStatus: status, subscriptionExpiresAt: expiresAt } : s));
    } else {
      console.error('Update store subscription failed:', error);
    }
  };

  const addProduct = async (storeId: string, productData: Omit<Product, 'id' | 'storeId' | 'views' | 'clicks' | 'createdAt'>) => {
    const productId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: productId,
      storeId,
      views: 0,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('products').insert([mapProductToDbProduct(newProduct)]);

    if (!error) {
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    }
    console.error('Add product failed:', error);
    return null as any;
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    const dbUpdates: any = {};
    if (productData.name !== undefined) dbUpdates.name = productData.name;
    if (productData.description !== undefined) dbUpdates.description = productData.description;
    if (productData.price !== undefined) dbUpdates.price = productData.price;
    if (productData.category !== undefined) dbUpdates.category = productData.category;
    if (productData.images !== undefined) dbUpdates.images = productData.images;
    if (productData.variants !== undefined) dbUpdates.variants = productData.variants;
    if (productData.isBestSeller !== undefined) dbUpdates.is_best_seller = productData.isBestSeller;
    if (productData.isTrending !== undefined) dbUpdates.is_trending = productData.isTrending;
    if (productData.isSponsored !== undefined) dbUpdates.is_sponsored = productData.isSponsored;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', productId);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...productData } : p));
    } else {
      console.error('Update product failed:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      console.error('Delete product failed:', error);
    }
  };

  const toggleFavoriteProduct = (productId: string) => {
    const updatedFavProducts = favorites.products.includes(productId)
      ? favorites.products.filter((id) => id !== productId)
      : [...favorites.products, productId];

    const updatedFavs = { ...favorites, products: updatedFavProducts };
    setFavorites(updatedFavs);
    localStorage.setItem('clothza_npr_favorites', JSON.stringify(updatedFavs));
  };

  const toggleFavoriteStore = (storeId: string) => {
    const updatedFavStores = favorites.stores.includes(storeId)
      ? favorites.stores.filter((id) => id !== storeId)
      : [...favorites.stores, storeId];

    const updatedFavs = { ...favorites, stores: updatedFavStores };
    setFavorites(updatedFavs);
    localStorage.setItem('clothza_npr_favorites', JSON.stringify(updatedFavs));
  };

  const trackView = async (type: 'store' | 'product', id: string) => {
    if (type === 'store') {
      const store = stores.find(s => s.id === id);
      if (store) {
        const nextViews = store.views + 1;
        const { error } = await supabase.from('stores').update({ views: nextViews }).eq('id', id);
        if (!error) {
          setStores(prev => prev.map(s => s.id === id ? { ...s, views: nextViews } : s));
        }
      }
    } else {
      const product = products.find(p => p.id === id);
      if (product) {
        const nextViews = product.views + 1;
        const { error } = await supabase.from('products').update({ views: nextViews }).eq('id', id);
        if (!error) {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, views: nextViews } : p));
        }
      }

      // Track recently viewed
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((pId) => pId !== id);
        const next = [id, ...filtered].slice(0, 6);
        localStorage.setItem('clothza_npr_recent', JSON.stringify(next));
        return next;
      });
    }
  };

  const trackClick = async (type: 'store' | 'product', id: string) => {
    if (type === 'store') {
      const store = stores.find(s => s.id === id);
      if (store) {
        const nextClicks = store.clicks + 1;
        const { error } = await supabase.from('stores').update({ clicks: nextClicks }).eq('id', id);
        if (!error) {
          setStores(prev => prev.map(s => s.id === id ? { ...s, clicks: nextClicks } : s));
        }
      }
    } else {
      const product = products.find(p => p.id === id);
      if (product) {
        const nextClicks = product.clicks + 1;
        const { error } = await supabase.from('products').update({ clicks: nextClicks }).eq('id', id);
        if (!error) {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, clicks: nextClicks } : p));
        }
      }
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Standard Supabase login is bypassed. Check if it's the admin details or log in guest
    if (email === 'admin@clothza.com' && password === 'adminpassword123') {
      localStorage.setItem('clothza_admin_logged_in', 'true');
      setCurrentUser({ id: 'admin', name: 'Super Admin', email: 'admin@clothza.com', role: 'admin', adminRequest: 'none' });
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials. Please use the passcode gate or correct admin login.' };
  };

  const signUp = async (name: string, email: string, _password: string, _role: User['role']): Promise<{ success: boolean; error?: string }> => {
    // Mock user sign up directly in local memory
    const newUser: User = { id: `user-${Date.now()}`, name, email, role: 'customer', adminRequest: 'none' };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setCurrentUser({ id: 'guest-customer', name: 'Guest Customer', email: 'guest@clothza.com', role: 'customer', adminRequest: 'none' });
    return { success: true };
  };

  const signOut = async () => {
    localStorage.removeItem('clothza_admin_logged_in');
    localStorage.setItem('clothza_logged_out', 'true');
    setCurrentUser({ id: 'guest-customer', name: 'Guest Customer', email: 'guest@clothza.com', role: 'customer', adminRequest: 'none' });
    navigateToHome();
  };

  const unlockAdminAccess = (password: string): boolean => {
    if (password === 'clothzaadmin2026') {
      localStorage.setItem('clothza_admin_logged_in', 'true');
      localStorage.removeItem('clothza_logged_out');
      setCurrentUser({ id: 'admin', name: 'Super Admin', email: 'admin@clothza.com', role: 'admin', adminRequest: 'none' });
      return true;
    }
    return false;
  };

  // Promotion feature (paid placement mockup)
  const promoteStore = async (storeId: string, type: 'featured' | 'sponsored') => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    const updates: any = {};
    if (type === 'featured') {
      updates.is_featured = !store.isFeatured;
    } else {
      updates.is_sponsored = !store.isSponsored;
    }

    const { error } = await supabase.from('stores').update(updates).eq('id', storeId);
    if (!error) {
      setStores(prev => prev.map(s => {
        if (s.id === storeId) {
          return type === 'featured'
            ? { ...s, isFeatured: !s.isFeatured }
            : { ...s, isSponsored: !s.isSponsored };
        }
        return s;
      }));
    } else {
      console.error('Promote store failed:', error);
    }
  };

  const promoteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const nextVal = !product.isSponsored;
    const { error } = await supabase.from('products').update({ is_sponsored: nextVal }).eq('id', productId);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, isSponsored: nextVal } : p));
    } else {
      console.error('Promote product failed:', error);
    }
  };

  const deleteStoreGlobal = async (storeId: string) => {
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    if (!error) {
      setStores(prev => prev.filter(s => s.id !== storeId));
      setProducts(prev => prev.filter(p => p.storeId !== storeId));

      const activeStore = stores.find((s) => s.id === storeId);
      if (activeStore && activeStoreSlug === activeStore.slug) {
        navigateToHome();
      }
    } else {
      console.error('Delete store global failed:', error);
    }
  };

  const deleteProductGlobal = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      if (activeProductId === productId) {
        navigateToHome();
      }
    } else {
      console.error('Delete product global failed:', error);
    }
  };

  const addToCart = (productId: string, size: string, color: string, quantity: number = 1) => {
    const existingIndex = cart.findIndex(
      item => item.productId === productId && item.selectedSize === size && item.selectedColor === color
    );
    let updatedCart = [...cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ productId, selectedSize: size, selectedColor: color, quantity });
    }
    saveCartState(updatedCart);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    const updatedCart = cart.filter(
      item => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
    );
    saveCartState(updatedCart);
  };

  const updateCartQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    const updatedCart = cart.map(item => {
      if (item.productId === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCartState(updatedCart);
  };

  const clearCart = () => {
    saveCartState([]);
  };

  const checkoutCart = async (customerInfo: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
  }, appliedCoupons?: { [storeId: string]: string }) => {
    if (cart.length === 0) return [];

    const storeItemsMap: { [storeId: string]: OrderItem[] } = {};

    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      
      const orderItem: OrderItem = {
        productId: item.productId,
        productName: product.name,
        price: product.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity
      };

      if (!storeItemsMap[product.storeId]) {
        storeItemsMap[product.storeId] = [];
      }
      storeItemsMap[product.storeId].push(orderItem);
    });

    const newOrders: Order[] = [];
    const updatedProducts = [...products];
    const updatedCoupons = coupons.map(c => ({ ...c }));

    const dbOrdersToInsert: any[] = [];

    for (const storeId of Object.keys(storeItemsMap)) {
      const items = storeItemsMap[storeId];
      let totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      
      // Calculate coupon discount
      const appliedCouponCode = appliedCoupons?.[storeId];
      if (appliedCouponCode) {
        const couponIndex = updatedCoupons.findIndex(
          c => c.storeId === storeId && c.code.toUpperCase() === appliedCouponCode.toUpperCase() && c.isActive
        );
        if (couponIndex > -1) {
          const coupon = updatedCoupons[couponIndex];
          if (totalAmount >= coupon.minOrderAmount) {
            if (coupon.discountType === 'percentage') {
              totalAmount = Math.max(0, Math.round(totalAmount * (1 - coupon.discountValue / 100)));
            } else {
              totalAmount = Math.max(0, totalAmount - coupon.discountValue);
            }
            coupon.usageCount += 1;
            
            // Update coupon usage count in Supabase
            await supabase.from('coupons').update({ usage_count: coupon.usageCount }).eq('id', coupon.id);
          }
        }
      }

      const orderId = `CLZ-${Math.floor(10000 + Math.random() * 90000)}-${String(newOrders.length + 1).padStart(2, '0')}`;
      const newOrder: Order = {
        id: orderId,
        storeId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: customerInfo.shippingAddress,
        items,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      newOrders.push(newOrder);
      dbOrdersToInsert.push(mapOrderToDbOrder(newOrder));

      // Decrease product variant stock
      for (const orderItem of items) {
        const prodIndex = updatedProducts.findIndex(p => p.id === orderItem.productId);
        if (prodIndex > -1) {
          const product = updatedProducts[prodIndex];
          const variantIndex = product.variants.findIndex(
            v => v.size === orderItem.selectedSize && v.color === orderItem.selectedColor
          );
          if (variantIndex > -1) {
            const updatedVariants = [...product.variants];
            const currentStock = updatedVariants[variantIndex].stock;
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              stock: Math.max(0, currentStock - orderItem.quantity)
            };
            product.variants = updatedVariants;

            // Save product changes in Supabase
            await supabase.from('products').update({ variants: updatedVariants }).eq('id', product.id);
          }
        }
      }
    }

    // Insert orders in Supabase
    const { error: orderInsertErr } = await supabase.from('orders').insert(dbOrdersToInsert);
    if (orderInsertErr) {
      console.error('Failed to insert orders in Supabase:', orderInsertErr);
    }

    // Update local state
    setProducts(updatedProducts);
    setCoupons(updatedCoupons);
    setOrders(prev => [...newOrders, ...prev]);
    
    clearCart();

    return newOrders;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    } else {
      console.error('Update order status failed:', error);
    }
  };

  const deleteOrderGlobal = async (orderId: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      console.error('Delete order global failed:', error);
    }
  };

  const addProductReview = async (productId: string, reviewData: Omit<Review, 'id' | 'createdAt' | 'productId'>) => {
    const reviewId = `rev-${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id: reviewId,
      productId,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('reviews').insert([mapReviewToDbReview(newReview)]);
    if (!error) {
      setReviews(prev => [newReview, ...prev]);
    } else {
      console.error('Add product review failed:', error);
    }
  };

  const deleteReviewGlobal = async (reviewId: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } else {
      console.error('Delete review global failed:', error);
    }
  };

  const addCoupon = async (storeId: string, couponData: Omit<Coupon, 'id' | 'storeId' | 'usageCount'>) => {
    const couponId = `coup-${Date.now()}`;
    const newCoupon: Coupon = {
      ...couponData,
      id: couponId,
      storeId,
      usageCount: 0
    };

    const { error } = await supabase.from('coupons').insert([mapCouponToDbCoupon(newCoupon)]);
    if (!error) {
      setCoupons(prev => [newCoupon, ...prev]);
      return newCoupon;
    } else {
      console.error('Add coupon failed:', error);
      return null as any;
    }
  };

  const deleteCoupon = async (couponId: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);
    if (!error) {
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } else {
      console.error('Delete coupon failed:', error);
    }
  };

  const toggleCouponStatus = async (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    const nextVal = !coupon.isActive;
    const { error } = await supabase.from('coupons').update({ is_active: nextVal }).eq('id', couponId);
    if (!error) {
      setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isActive: nextVal } : c));
    } else {
      console.error('Toggle coupon status failed:', error);
    }
  };

  const sendChatMessage = async (storeId: string, customerId: string, text: string, senderId: string, senderName: string) => {
    const messageId = `msg-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: messageId,
      storeId,
      customerId,
      senderId,
      senderName,
      text,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('messages').insert([mapMessageToDbMessage(newMessage)]);
    if (!error) {
      setMessages(prev => [...prev, newMessage]);
    } else {
      console.error('Send chat message failed:', error);
    }
  };

  const addLookbook = async (
    storeId: string, 
    name: string, 
    description: string, 
    items: LookbookItem[], 
    creatorName: string, 
    isOfficial: boolean, 
    image?: string, 
    pins?: LookbookPin[]
  ) => {
    const lookbookId = `lookbook-${Date.now()}`;
    const newLookbook: Lookbook = {
      id: lookbookId,
      storeId,
      name,
      description,
      items,
      creatorName,
      isOfficial,
      createdAt: new Date().toISOString(),
      image,
      pins
    };

    const { error } = await supabase.from('lookbooks').insert([mapLookbookToDbLookbook(newLookbook)]);
    if (!error) {
      setLookbooks(prev => [...prev, newLookbook]);
    } else {
      console.error('Add lookbook failed:', error);
    }
  };

  const deleteLookbook = async (lookbookId: string) => {
    const { error } = await supabase.from('lookbooks').delete().eq('id', lookbookId);
    if (!error) {
      setLookbooks(prev => prev.filter(lb => lb.id !== lookbookId));
    } else {
      console.error('Delete lookbook failed:', error);
    }
  };

  const addLookbookBundleToCart = (items: LookbookItem[]) => {
    let updatedCart = [...cart];
    items.forEach(item => {
      const existingIndex = updatedCart.findIndex(
        c => c.productId === item.productId && c.selectedSize === item.selectedSize && c.selectedColor === item.selectedColor
      );
      if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += 1;
      } else {
        updatedCart.push({
          productId: item.productId,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          quantity: 1
        });
      }
    });
    saveCartState(updatedCart);
  };

  const submitAdminRequest = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ admin_request: 'pending' })
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, adminRequest: 'pending' as const } : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, adminRequest: 'pending' as const } : null);
      }
    } else {
      console.error('Submit admin request failed:', error);
    }
  };

  const approveAdminRequest = async (userId: string, approve: boolean) => {
    const status: 'approved' | 'rejected' = approve ? 'approved' : 'rejected';
    const role: 'admin' | undefined = approve ? 'admin' : undefined;

    const updates: any = { admin_request: status };
    if (role) {
      updates.role = role;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated: User = { ...u, adminRequest: status };
          if (role) updated.role = role;
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
          }
          return updated;
        }
        return u;
      }));
    } else {
      console.error('Approve admin request failed:', error);
    }
  };

  const promoteToSellerDirect = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const storeId = user?.storeId || `store-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        role: 'seller',
        store_id: storeId,
        subscription_tier: 'gold',
        subscription_status: 'active',
        subscription_expires_at: expiresAt
      })
      .eq('id', userId);

    if (!profileErr) {
      if (!user?.storeId) {
        const newStore: Store = {
          id: storeId,
          name: `${user?.name || 'Curator'}'s Boutique`,
          slug: `${(user?.name || 'curator').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          description: 'High-end designer curation boutique enabled directly by the platform administration.',
          logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1441984969893-c5a6e5057d4c?w=1200&auto=format&fit=crop&q=80',
          ownerId: userId,
          isFeatured: false,
          isSponsored: false,
          views: 0,
          clicks: 0,
          theme: 'minimalist',
          subscriptionTier: 'gold',
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt
        };

        const { error: storeErr } = await supabase
          .from('stores')
          .insert([mapStoreToDbStore(newStore)]);

        if (!storeErr) {
          setStores(prev => [...prev, newStore]);
        } else {
          console.error('Create direct seller store failed:', storeErr);
        }
      } else {
        await supabase
          .from('stores')
          .update({
            subscription_tier: 'gold',
            subscription_status: 'active',
            subscription_expires_at: expiresAt
          })
          .eq('id', storeId);
        setStores(prev => prev.map(s => s.id === storeId ? { ...s, subscriptionTier: 'gold', subscriptionStatus: 'active', subscriptionExpiresAt: expiresAt } : s));
      }

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated: User = {
            ...u,
            role: 'seller',
            storeId,
            subscriptionTier: 'gold',
            subscriptionStatus: 'active',
            subscriptionExpiresAt: expiresAt
          };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
          }
          return updated;
        }
        return u;
      }));
    } else {
      console.error('Direct seller promotion failed:', profileErr);
    }
  };

  return (
    <MarketplaceContext.Provider
      value={{
        stores,
        products,
        currentUser,
        favorites,
        recentlyViewed,
        currentPage,
        activeStoreSlug,
        activeProductId,
        cart,
        orders,
        navigateToHome,
        navigateToStore,
        navigateToProduct,
        navigateToDashboard,
        navigateToAdmin,
        navigateToCheckout,
        navigateToCustomerOrders,
        registerStore,
        linkUserToDemoStore,
        updateStore,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFavoriteProduct,
        toggleFavoriteStore,
        trackView,
        trackClick,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        users,
        promoteStore,
        promoteProduct,
        deleteStoreGlobal,
        deleteProductGlobal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutCart,
        updateOrderStatus,
        deleteOrderGlobal,
        reviews,
        addProductReview,
        deleteReviewGlobal,
        coupons,
        addCoupon,
        deleteCoupon,
        toggleCouponStatus,
        messages,
        sendChatMessage,
        lookbooks,
        addLookbook,
        deleteLookbook,
        addLookbookBundleToCart,
        updateUserSubscription,
        updateStoreSubscription,
        uploadImage,
        navigateToLookbooks,
        navigateToPrivacy,
        navigateToTerms,
        submitAdminRequest,
        approveAdminRequest,
        promoteToSellerDirect,
        unlockAdminAccess,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
