import type {
  CartItem,
  CoolingOffItem,
  Order,
  JournalEntry,
  DreamVaultItem,
  WishlistItem,
} from "@/types";

const KEYS = {
  CART: "cartzen_cart",
  COOLING_OFF: "cartzen_cooling_off",
  ORDERS: "cartzen_orders",
  JOURNAL: "cartzen_journal",
  SAVINGS: "cartzen_savings",
  THEME: "cartzen_theme",
  DREAM_VAULT: "cartzen_dream_vault",
  WISHLIST: "cartzen_wishlist",
  RECENTLY_VIEWED: "cartzen_recently_viewed",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// Cart
export const cartStorage = {
  get: (): CartItem[] => safeGet(KEYS.CART, []),
  set: (items: CartItem[]) => safeSet(KEYS.CART, items),
  clear: () => safeSet(KEYS.CART, []),
};

// Cooling-off
export const coolingOffStorage = {
  get: (): CoolingOffItem[] => safeGet(KEYS.COOLING_OFF, []),
  set: (items: CoolingOffItem[]) => safeSet(KEYS.COOLING_OFF, items),
};

// Orders
export const ordersStorage = {
  get: (): Order[] => safeGet(KEYS.ORDERS, []),
  set: (orders: Order[]) => safeSet(KEYS.ORDERS, orders),
  add: (order: Order) => {
    const existing = ordersStorage.get();
    safeSet(KEYS.ORDERS, [order, ...existing]);
  },
};

// Journal
export const journalStorage = {
  get: (): JournalEntry[] => safeGet(KEYS.JOURNAL, []),
  set: (entries: JournalEntry[]) => safeSet(KEYS.JOURNAL, entries),
  add: (entry: JournalEntry) => {
    const existing = journalStorage.get();
    safeSet(KEYS.JOURNAL, [entry, ...existing]);
  },
};

// Savings
export const savingsStorage = {
  get: (): number => safeGet(KEYS.SAVINGS, 0),
  add: (amount: number) => {
    const current = savingsStorage.get();
    safeSet(KEYS.SAVINGS, current + amount);
  },
  reset: () => safeSet(KEYS.SAVINGS, 0),
};

// Theme
export const themeStorage = {
  get: (): "light" | "dark" => safeGet(KEYS.THEME, "light"),
  set: (theme: "light" | "dark") => safeSet(KEYS.THEME, theme),
};

// Dream Vault
export const dreamVaultStorage = {
  get: (): DreamVaultItem[] => safeGet(KEYS.DREAM_VAULT, []),
  set: (items: DreamVaultItem[]) => safeSet(KEYS.DREAM_VAULT, items),
};

// Wishlist
export const wishlistStorage = {
  get: (): WishlistItem[] => safeGet(KEYS.WISHLIST, []),
  set: (items: WishlistItem[]) => safeSet(KEYS.WISHLIST, items),
};

// Recently viewed (array of product IDs, most recent first)
export const recentlyViewedStorage = {
  get: (): string[] => safeGet(KEYS.RECENTLY_VIEWED, []),
  add: (productId: string) => {
    const existing = recentlyViewedStorage.get();
    const updated = [productId, ...existing.filter((id) => id !== productId)].slice(0, 12);
    safeSet(KEYS.RECENTLY_VIEWED, updated);
  },
};
