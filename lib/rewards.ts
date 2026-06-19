import type { Reward, RewardDrop, RewardRarity } from "@/types";

// ─── RARITY CONFIG ───────────────────────────────────────────────────────────
export interface RarityConfig {
  rarity: RewardRarity;
  label: string;
  weight: number; // drop probability weight
  gradient: string;
  glow: string;
  ring: string;
  text: string;
  emoji: string;
}

export const RARITIES: Record<RewardRarity, RarityConfig> = {
  common: {
    rarity: "common",
    label: "Common",
    weight: 60,
    gradient: "from-slate-300 to-slate-400",
    glow: "shadow-slate-400/50",
    ring: "ring-slate-300",
    text: "text-slate-500",
    emoji: "⚪",
  },
  rare: {
    rarity: "rare",
    label: "Rare",
    weight: 27,
    gradient: "from-blue-400 to-cyan-500",
    glow: "shadow-blue-400/60",
    ring: "ring-blue-400",
    text: "text-blue-500",
    emoji: "🔵",
  },
  epic: {
    rarity: "epic",
    label: "Epic",
    weight: 10,
    gradient: "from-fuchsia-500 to-purple-600",
    glow: "shadow-fuchsia-500/70",
    ring: "ring-fuchsia-500",
    text: "text-fuchsia-500",
    emoji: "🟣",
  },
  legendary: {
    rarity: "legendary",
    label: "Legendary",
    weight: 3,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    glow: "shadow-amber-400/80",
    ring: "ring-amber-400",
    text: "text-amber-500",
    emoji: "🟡",
  },
};

// ─── BADGES ──────────────────────────────────────────────────────────────────
export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  rarity: RewardRarity;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { id: "zen_sprout", name: "Zen Sprout", emoji: "🌱", rarity: "common", description: "Began the mindful path" },
  { id: "coin_collector", name: "Coin Collector", emoji: "🪙", rarity: "common", description: "Hoarder of imaginary wealth" },
  { id: "calm_mind", name: "Calm Mind", emoji: "🧘", rarity: "rare", description: "Serenity in the sales aisle" },
  { id: "deal_dodger", name: "Deal Dodger", emoji: "🛡️", rarity: "rare", description: "Outran a flash sale" },
  { id: "lotus_master", name: "Lotus Master", emoji: "🪷", rarity: "epic", description: "Bloomed above temptation" },
  { id: "diamond_will", name: "Diamond Will", emoji: "💎", rarity: "epic", description: "Unbreakable self-control" },
  { id: "phoenix_saver", name: "Phoenix Saver", emoji: "🔥", rarity: "legendary", description: "Rose from the ashes of impulse" },
  { id: "crown_of_zen", name: "Crown of Zen", emoji: "👑", rarity: "legendary", description: "The rarest of mindful shoppers" },
  { id: "golden_cart", name: "Golden Cart", emoji: "🛒", rarity: "legendary", description: "The mythical empty cart of gold" },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

// ─── PLAYER LEVEL (XP-based, distinct from savings tiers) ─────────────────────
// XP needed to *reach* level n: 100 * (n-1)^1.5, cumulative-ish but simple tiers.
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level - 1, 1.6));
}

export function getPlayerLevel(xp: number): { level: number; curLevelXp: number; nextLevelXp: number; pct: number } {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const curLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const pct = Math.min(100, Math.round(((xp - curLevelXp) / (nextLevelXp - curLevelXp)) * 100));
  return { level, curLevelXp, nextLevelXp, pct };
}

// ─── ROLL LOGIC ──────────────────────────────────────────────────────────────
function weightedRarity(): RewardRarity {
  const total = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of Object.values(RARITIES)) {
    if (roll < r.weight) return r.rarity;
    roll -= r.weight;
  }
  return "common";
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickBadge(rarity: RewardRarity, owned: string[]): string | null {
  // Prefer an unowned badge of this rarity; fall back to any of this rarity.
  const pool = BADGES.filter((b) => b.rarity === rarity);
  const unowned = pool.filter((b) => !owned.includes(b.id));
  const choices = unowned.length > 0 ? unowned : pool;
  if (choices.length === 0) return null;
  return choices[rand(0, choices.length - 1)].id;
}

// Generate the rewards inside a loot box given a rarity.
export function rollLootBox(ownedBadges: string[]): RewardDrop {
  const rarity = weightedRarity();
  const rewards: Reward[] = [];

  const multiplier = { common: 1, rare: 2.5, epic: 6, legendary: 15 }[rarity];

  // Zen Points — always present
  const zen = Math.round(rand(10, 40) * multiplier);
  rewards.push({ kind: "zen", amount: zen, label: `${zen} Zen Points`, emoji: "🧘" });

  // XP — always present
  const xp = Math.round(rand(15, 50) * multiplier);
  rewards.push({ kind: "xp", amount: xp, label: `${xp} XP`, emoji: "⭐" });

  // Savings Coins — rare+ chance
  if (rarity !== "common" || Math.random() < 0.4) {
    const coins = Math.round(rand(5, 25) * multiplier);
    rewards.push({ kind: "coins", amount: coins, label: `${coins} Savings Coins`, emoji: "🪙" });
  }

  // Badge — epic always, legendary always, rare 35%, common 8%
  const badgeChance = { common: 0.08, rare: 0.35, epic: 1, legendary: 1 }[rarity];
  if (Math.random() < badgeChance) {
    const badgeId = pickBadge(rarity, ownedBadges);
    if (badgeId) {
      const b = getBadge(badgeId)!;
      rewards.push({ kind: "badge", badgeId, label: b.name, emoji: b.emoji });
    }
  }

  return {
    id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    openedAt: new Date().toISOString(),
    rarity,
    rewards,
  };
}
