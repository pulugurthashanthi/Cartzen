import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Order, OrderStatus, OrderStatusStep } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "CZ";
  let id = prefix;
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export const ORDER_STEPS: {
  status: OrderStatus;
  label: string;
  dayLabel: string;
  descriptionTemplate: string;
  emoji: string;
}[] = [
  {
    status: "placed",
    label: "Order Confirmed",
    dayLabel: "Day 1 · Morning",
    descriptionTemplate: "Your order is confirmed and sent to the warehouse.",
    emoji: "📋",
  },
  {
    status: "packed",
    label: "Packed & Ready",
    dayLabel: "Day 1 · Afternoon",
    descriptionTemplate: "{{product}} has been carefully packed and labelled.",
    emoji: "📦",
  },
  {
    status: "shipped",
    label: "In Transit",
    dayLabel: "Day 2 · Morning",
    descriptionTemplate: "Package picked up — heading to your city's hub.",
    emoji: "🚚",
  },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    dayLabel: "Day 3 · Morning",
    descriptionTemplate: "Delivery partner is on the way. Be home!",
    emoji: "🛵",
  },
  {
    status: "delivered",
    label: "Delivered!",
    dayLabel: "Day 3 · Evening",
    descriptionTemplate: "Package left at your doorstep. Open it! 🎁",
    emoji: "🎉",
  },
];

const STATUS_ORDER: OrderStatus[] = [
  "placed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function getStatusSteps(order: Order): OrderStatusStep[] {
  const currentIndex = STATUS_ORDER.indexOf(order.status);
  const mainProduct = order.items[0]?.product.name ?? "your item";
  return ORDER_STEPS.map((step, i) => {
    const historyEntry = order.statusHistory.find(
      (h) => h.status === step.status
    );
    const description = step.descriptionTemplate.replace("{{product}}", `"${mainProduct}"`);
    return {
      status: step.status,
      label: step.label,
      description,
      dayLabel: step.dayLabel,
      emoji: step.emoji,
      timestamp: historyEntry?.timestamp,
      completed: i < currentIndex,
      current: i === currentIndex,
    };
  });
}

export function advanceOrderStatus(order: Order): Order {
  const currentIndex = STATUS_ORDER.indexOf(order.status);
  if (currentIndex >= STATUS_ORDER.length - 1) return order;
  const nextStatus = STATUS_ORDER[currentIndex + 1];
  return {
    ...order,
    status: nextStatus,
    statusHistory: [
      ...order.statusHistory,
      { status: nextStatus, timestamp: new Date().toISOString() },
    ],
  };
}

export function getMonthlySavings(orders: Order[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return orders
    .filter((o) => new Date(o.placedAt) >= startOfMonth)
    .reduce((sum, o) => sum + o.total, 0);
}

export function getAverageCartValue(orders: Order[]): number {
  if (!orders.length) return 0;
  return orders.reduce((sum, o) => sum + o.total, 0) / orders.length;
}

export const MILESTONES = [
  { amount: 1000, label: "₹1,000 saved! That's a dinner you ate at home instead. Respect. 🍜" },
  { amount: 5000, label: "₹5,000! That's an Uber to the mall that you didn't take. Clever. 🛺" },
  { amount: 10000, label: "₹10,000! ONE meal at a fancy restaurant. You chose dignity. 🥂" },
  { amount: 25000, label: "₹25,000! A phone upgrade. A holiday. You chose sanity. Legend. 🌴" },
  { amount: 50000, label: "₹50,000 saved!! At this point your savings account is your personality. 👑" },
];

export function getNextMilestone(savings: number) {
  return MILESTONES.find((m) => m.amount > savings) ?? null;
}

export function getAchievedMilestones(savings: number) {
  return MILESTONES.filter((m) => m.amount <= savings);
}

// Translates a savings amount into funny, tangible real-life equivalents.
// Unit prices are rough Indian averages — picked for comedy, not accounting.
const SAVINGS_UNITS = [
  { unit: 50, emoji: "🍫", singular: "chocolate bar", plural: "chocolate bars" },
  { unit: 120, emoji: "☕", singular: "fancy coffee", plural: "fancy coffees" },
  { unit: 250, emoji: "🍛", singular: "plate of biryani", plural: "plates of biryani" },
  { unit: 500, emoji: "🎬", singular: "movie ticket", plural: "movie tickets (with popcorn)" },
  { unit: 1500, emoji: "💆", singular: "spa day", plural: "spa days" },
  { unit: 3000, emoji: "👟", singular: "decent pair of sneakers", plural: "pairs of sneakers" },
  { unit: 8000, emoji: "✈️", singular: "domestic flight", plural: "domestic flights" },
  { unit: 45000, emoji: "🏝️", singular: "trip to Goa", plural: "trips to Goa" },
  { unit: 90000, emoji: "🛵", singular: "brand-new scooter", plural: "brand-new scooters" },
];

// ─── LEVELS ──────────────────────────────────────────────────────────────────
export interface Level {
  name: string;
  emoji: string;
  minSavings: number;
  maxSavings: number;
  color: string;
  gradient: string;
  tagline: string;
}

export const LEVELS: Level[] = [
  {
    name: "Saver",
    emoji: "🌱",
    minSavings: 0,
    maxSavings: 4999,
    color: "text-green-600",
    gradient: "from-green-400 to-emerald-500",
    tagline: "You planted a seed of financial wisdom",
  },
  {
    name: "Disciplined Shopper",
    emoji: "🧘",
    minSavings: 5000,
    maxSavings: 24999,
    color: "text-blue-600",
    gradient: "from-blue-400 to-indigo-500",
    tagline: "Your wallet has feelings and you respect them",
  },
  {
    name: "Mindful Buyer",
    emoji: "🦋",
    minSavings: 25000,
    maxSavings: 99999,
    color: "text-fuchsia-600",
    gradient: "from-fuchsia-400 to-purple-500",
    tagline: "You see through the illusion of retail therapy",
  },
  {
    name: "Financial Ninja",
    emoji: "⚡",
    minSavings: 100000,
    maxSavings: 499999,
    color: "text-amber-600",
    gradient: "from-amber-400 to-orange-500",
    tagline: "Discounts fear you. Impulse buys avoid you.",
  },
  {
    name: "Zen Master",
    emoji: "👑",
    minSavings: 500000,
    maxSavings: Infinity,
    color: "text-orange-600",
    gradient: "from-orange-400 to-rose-500",
    tagline: "You have achieved financial enlightenment",
  },
];

export function getCurrentLevel(savings: number): Level {
  return LEVELS.slice().reverse().find((l) => savings >= l.minSavings) ?? LEVELS[0];
}

export function getLevelProgress(savings: number): { pct: number; nextLevel: Level | null; toNext: number } {
  const current = getCurrentLevel(savings);
  const nextLevel = LEVELS.find((l) => l.minSavings > current.minSavings) ?? null;
  if (!nextLevel) return { pct: 100, nextLevel: null, toNext: 0 };
  const range = nextLevel.minSavings - current.minSavings;
  const progress = savings - current.minSavings;
  return {
    pct: Math.min(100, Math.round((progress / range) * 100)),
    nextLevel,
    toNext: nextLevel.minSavings - savings,
  };
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (data: AchievementData) => boolean;
}

export interface AchievementData {
  savings: number;
  orderCount: number;
  urgesResisted: number;
  urgesVanished: number;
  realityChecksDone: number;
  coolingOffItemsAdded: number;
  wishlistCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_save",
    name: "First Step",
    emoji: "👣",
    description: "Place your first fake order",
    check: (d) => d.orderCount >= 1,
  },
  {
    id: "save_1k",
    name: "₹1,000 Saved",
    emoji: "💰",
    description: "Save your first ₹1,000",
    check: (d) => d.savings >= 1000,
  },
  {
    id: "save_10k",
    name: "₹10,000 Club",
    emoji: "🏆",
    description: "Save over ₹10,000 total",
    check: (d) => d.savings >= 10000,
  },
  {
    id: "save_1l",
    name: "Lakhpati (Fake)",
    emoji: "💎",
    description: "Save over ₹1,00,000",
    check: (d) => d.savings >= 100000,
  },
  {
    id: "five_orders",
    name: "Serial Simulator",
    emoji: "📦",
    description: "Place 5 simulated orders",
    check: (d) => d.orderCount >= 5,
  },
  {
    id: "twenty_five_orders",
    name: "Chronic Simulater",
    emoji: "🏅",
    description: "Place 25 simulated orders",
    check: (d) => d.orderCount >= 25,
  },
  {
    id: "first_urge_vanished",
    name: "Urge Outlasted",
    emoji: "❄️",
    description: "Have a cooling-off urge disappear",
    check: (d) => d.urgesVanished >= 1,
  },
  {
    id: "ten_urges_resisted",
    name: "Impulse Slayer",
    emoji: "🛡️",
    description: "Resist 10 shopping urges",
    check: (d) => d.urgesResisted >= 10,
  },
  {
    id: "reality_check",
    name: "Face the Truth",
    emoji: "🔍",
    description: "Complete your first post-delivery reality check",
    check: (d) => d.realityChecksDone >= 1,
  },
  {
    id: "wishlist_builder",
    name: "Dream Collector",
    emoji: "💝",
    description: "Add 5 items to your wishlist",
    check: (d) => d.wishlistCount >= 5,
  },
];

export function getUnlockedAchievements(data: AchievementData) {
  return ACHIEVEMENTS.filter((a) => a.check(data));
}

export function getSavingsEquivalents(savings: number, count = 3) {
  if (savings <= 0) return [];
  return SAVINGS_UNITS
    .map((u) => ({ ...u, qty: Math.floor(savings / u.unit) }))
    .filter((u) => u.qty >= 1)
    .sort((a, b) => b.unit - a.unit) // prefer bigger, more impressive items first
    .slice(0, count)
    .map((u) => ({
      emoji: u.emoji,
      text: `${u.qty} ${u.qty === 1 ? u.singular : u.plural}`,
      qty: u.qty,
    }));
}
