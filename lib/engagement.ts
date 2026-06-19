import type { DailyChallengeDef, ChallengeMetric, EngagementState, StoreState } from "@/types";

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function weekKey(d: Date = new Date()): string {
  // ISO-ish week key
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ─── DEFAULT STATE ────────────────────────────────────────────────────────────
export const EMPTY_ENGAGEMENT: EngagementState = {
  streakCurrent: 0,
  streakLongest: 0,
  lastActiveDate: "",
  dailyBoxLastClaimed: "",
  lastLoginDate: "",
  loginDayIndex: 0,
  weeklyLastClaimed: "",
  challengeDate: "",
  challengeProgress: {},
  challengeClaimed: [],
};

export const EMPTY_STORE: StoreState = {
  owned: [],
  activeBoxSkin: "default",
  activeTitle: "",
};

// ─── STREAK ───────────────────────────────────────────────────────────────────
// Returns updated engagement after registering today's visit.
export function applyDailyVisit(e: EngagementState): { next: EngagementState; streakChanged: boolean; broke: boolean } {
  const today = todayStr();
  if (e.lastActiveDate === today) return { next: e, streakChanged: false, broke: false };

  let streak = e.streakCurrent;
  let broke = false;
  if (!e.lastActiveDate) {
    streak = 1;
  } else {
    const gap = daysBetween(e.lastActiveDate, today);
    if (gap === 1) streak = e.streakCurrent + 1;
    else if (gap > 1) { streak = 1; broke = e.streakCurrent > 1; }
    else streak = e.streakCurrent; // same/negative (clock skew)
  }

  const next: EngagementState = {
    ...e,
    streakCurrent: streak,
    streakLongest: Math.max(e.streakLongest, streak),
    lastActiveDate: today,
  };
  return { next, streakChanged: true, broke };
}

// ─── DAILY BOX ────────────────────────────────────────────────────────────────
export function canClaimDailyBox(e: EngagementState): boolean {
  return e.dailyBoxLastClaimed !== todayStr();
}

// ─── LOGIN CALENDAR (7-day) ──────────────────────────────────────────────────
export interface LoginReward {
  day: number;
  coins: number;
  xp: number;
  isBox?: boolean;
  label: string;
}

export const LOGIN_CALENDAR: LoginReward[] = [
  { day: 1, coins: 20, xp: 10, label: "20 Coins" },
  { day: 2, coins: 30, xp: 15, label: "30 Coins" },
  { day: 3, coins: 40, xp: 20, label: "40 Coins" },
  { day: 4, coins: 60, xp: 30, label: "60 Coins" },
  { day: 5, coins: 80, xp: 40, label: "80 Coins" },
  { day: 6, coins: 100, xp: 50, label: "100 Coins" },
  { day: 7, coins: 0, xp: 80, isBox: true, label: "Bonus Loot Box!" },
];

export function canClaimLogin(e: EngagementState): boolean {
  return e.lastLoginDate !== todayStr();
}

// Next login reward (0-indexed cycles through the 7-day calendar)
export function nextLoginReward(e: EngagementState): LoginReward {
  const idx = e.loginDayIndex % LOGIN_CALENDAR.length;
  return LOGIN_CALENDAR[idx];
}

// ─── WEEKLY REWARD ────────────────────────────────────────────────────────────
export function canClaimWeekly(e: EngagementState): boolean {
  return e.weeklyLastClaimed !== weekKey();
}
export const WEEKLY_REWARD = { coins: 150, xp: 120, isBox: true };

// ─── DAILY CHALLENGES ─────────────────────────────────────────────────────────
const CHALLENGE_POOL: DailyChallengeDef[] = [
  { id: "browse5", label: "Browse 5 products", emoji: "👀", goal: 5, metric: "browse", rewardCoins: 25, rewardXp: 15 },
  { id: "browse10", label: "Browse 10 products", emoji: "🔍", goal: 10, metric: "browse", rewardCoins: 40, rewardXp: 25 },
  { id: "wishlist2", label: "Wishlist 2 items", emoji: "💝", goal: 2, metric: "wishlist", rewardCoins: 30, rewardXp: 20 },
  { id: "cooldown1", label: "Cool off 1 item", emoji: "❄️", goal: 1, metric: "cooldown_add", rewardCoins: 35, rewardXp: 25 },
  { id: "resist1", label: "Resist 1 urge", emoji: "🛡️", goal: 1, metric: "cooldown_resist", rewardCoins: 60, rewardXp: 50 },
  { id: "checkout1", label: "Complete a mindful checkout", emoji: "🧘", goal: 1, metric: "checkout", rewardCoins: 50, rewardXp: 40 },
  { id: "openbox1", label: "Open a loot box", emoji: "🎁", goal: 1, metric: "open_box", rewardCoins: 20, rewardXp: 15 },
];

// Deterministic daily set of 3 challenges seeded by the date string.
export function getTodaysChallenges(date: string = todayStr()): DailyChallengeDef[] {
  let seed = 0;
  for (let i = 0; i < date.length; i++) seed = (seed * 31 + date.charCodeAt(i)) >>> 0;
  const pool = [...CHALLENGE_POOL];
  const picked: DailyChallengeDef[] = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % pool.length;
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

// Ensure challenge state is for today; reset if stale.
export function freshChallengeState(e: EngagementState): EngagementState {
  const today = todayStr();
  if (e.challengeDate === today) return e;
  return { ...e, challengeDate: today, challengeProgress: {}, challengeClaimed: [] };
}

export function incrementMetric(e: EngagementState, metric: ChallengeMetric, by = 1): EngagementState {
  const fresh = freshChallengeState(e);
  const progress = { ...fresh.challengeProgress };
  progress[metric] = (progress[metric] ?? 0) + by;
  return { ...fresh, challengeProgress: progress };
}

export function challengeIsComplete(def: DailyChallengeDef, e: EngagementState): boolean {
  return (e.challengeProgress[def.metric] ?? 0) >= def.goal;
}

// ─── COIN STORE ───────────────────────────────────────────────────────────────
export type CosmeticKind = "boxSkin" | "title";

export interface StoreItem {
  id: string;
  kind: CosmeticKind;
  name: string;
  emoji: string;
  price: number;
  description: string;
  // boxSkin: gradient classes used by the loot box
  gradient?: string;
}

export const STORE_ITEMS: StoreItem[] = [
  // Box skins
  { id: "skin_ocean", kind: "boxSkin", name: "Ocean Box", emoji: "🌊", price: 200, description: "Cool blue loot box", gradient: "from-cyan-400 to-blue-600" },
  { id: "skin_forest", kind: "boxSkin", name: "Forest Box", emoji: "🌲", price: 200, description: "Earthy green loot box", gradient: "from-green-400 to-emerald-600" },
  { id: "skin_galaxy", kind: "boxSkin", name: "Galaxy Box", emoji: "🌌", price: 450, description: "Deep cosmic purple", gradient: "from-indigo-500 to-purple-700" },
  { id: "skin_gold", kind: "boxSkin", name: "Golden Box", emoji: "✨", price: 800, description: "Pure luxury gold", gradient: "from-amber-300 to-yellow-500" },
  // Titles
  { id: "title_saver", kind: "title", name: "The Saver", emoji: "🌱", price: 100, description: "Profile title" },
  { id: "title_zenmaster", kind: "title", name: "Zen Master", emoji: "🧘", price: 500, description: "Profile title" },
  { id: "title_untouchable", kind: "title", name: "Wallet Guardian", emoji: "🛡️", price: 350, description: "Profile title" },
  { id: "title_legend", kind: "title", name: "Living Legend", emoji: "👑", price: 1000, description: "Profile title" },
];

export function getStoreItem(id: string): StoreItem | undefined {
  return STORE_ITEMS.find((s) => s.id === id);
}

// Box skin gradient resolver (default falls back to zen gradient via empty string)
export function boxSkinGradient(skinId: string): string {
  const item = STORE_ITEMS.find((s) => s.id === skinId && s.kind === "boxSkin");
  return item?.gradient ?? ""; // "" → component uses zen-gradient
}
