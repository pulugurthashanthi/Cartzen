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
  coinBonus?: number;
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
  // Last time the user confirmed "still want it" in the maturation check;
  // absent until the first check comes due.
  checkedAt?: string;
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

// Rewards / Loot Box
export type RewardRarity = "common" | "rare" | "epic" | "legendary";
export type RewardKind = "zen" | "xp" | "coins" | "badge";

export interface Reward {
  kind: RewardKind;
  amount?: number;
  badgeId?: string;
  label: string;
  emoji: string;
}

export interface RewardDrop {
  id: string;
  openedAt: string;
  rarity: RewardRarity;
  rewards: Reward[];
}

export type ChallengeMetric =
  | "browse"
  | "wishlist"
  | "cooldown_add"
  | "cooldown_resist"
  | "checkout"
  | "open_box";

export interface DailyChallengeDef {
  id: string;
  label: string;
  emoji: string;
  goal: number;
  metric: ChallengeMetric;
  rewardCoins: number;
  rewardXp: number;
}

export interface EngagementState {
  // Mindful streak — consecutive days the app was opened
  streakCurrent: number;
  streakLongest: number;
  lastActiveDate: string; // YYYY-MM-DD
  // Daily reward box
  dailyBoxLastClaimed: string; // YYYY-MM-DD
  // Login / weekly rewards
  lastLoginDate: string; // YYYY-MM-DD
  loginDayIndex: number; // position in the 7-day login calendar
  weeklyLastClaimed: string; // ISO week key e.g. 2026-W25
  // Daily challenges
  challengeDate: string; // YYYY-MM-DD the current set belongs to
  challengeProgress: Partial<Record<ChallengeMetric, number>>;
  challengeClaimed: string[]; // challenge ids claimed today
}

export interface StoreState {
  owned: string[]; // cosmetic ids purchased
  activeBoxSkin: string;
  activeTitle: string;
}

export interface RewardsState {
  zenPoints: number; // spendable "Zen Coins"
  xp: number;
  savingsCoins: number;
  badges: string[];
  history: RewardDrop[];
  engagement: EngagementState;
  store: StoreState;
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
