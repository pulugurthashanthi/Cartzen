// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  inStock: boolean;
  badge?: "bestseller" | "new" | "trending" | "sale";
  tags: string[];
}

export interface Review {
  id: string;
  productId: string;
  user: string;
  avatar: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
}

// Cart Types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

// Order Types
export type OrderStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export interface OrderStatusStep {
  status: OrderStatus;
  label: string;
  description: string;
  dayLabel?: string;
  emoji?: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  placedAt: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string }[];
  deliveryAddress: string;
  journalEntry?: JournalEntry;
  unboxed?: boolean;
  realityCheck?: { response: "yes" | "maybe" | "no"; timestamp: string };
}

// Dream Vault
export type DreamVaultCategory =
  | "dream_office"
  | "dream_home"
  | "dream_travel"
  | "dream_garage"
  | "dream_style";

export interface DreamVaultItem {
  productId: string;
  product: Product;
  vaultCategory: DreamVaultCategory;
  addedAt: string;
}

// Wishlist
export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

// Cooling-Off List
export interface CoolingOffItem {
  productId: string;
  product: Product;
  addedAt: string;
  trigger?: ShoppingReason;
  coolOffDays?: 1 | 7 | 30;
  checkedAt?: string;
  stillWanted?: boolean;
  urgeDisappeared?: boolean;
  reflection?: string;
}

// Journal
export type ShoppingReason =
  | "bored"
  | "stressed"
  | "rewarding_myself"
  | "need_product"
  | "just_browsing";

export interface JournalEntry {
  id: string;
  reason: ShoppingReason;
  timestamp: string;
  orderId?: string;
  note?: string;
}

// Savings
export interface SavingsData {
  lifetimeSavings: number;
  orders: Order[];
  milestones: Milestone[];
  journalEntries: JournalEntry[];
}

export interface Milestone {
  id: string;
  label: string;
  amount: number;
  achieved: boolean;
  achievedAt?: string;
}

// App State
export interface AppState {
  cart: CartItem[];
  coolingOff: CoolingOffItem[];
  orders: Order[];
  journalEntries: JournalEntry[];
  lifetimeSavings: number;
  theme: "light" | "dark";
}

// Category
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}
