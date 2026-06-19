import type { Product } from "@/types";

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  gradient: string;
  textColor: string;
  filterFn: (p: Product) => boolean;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "dream-office",
    name: "Dream Office",
    tagline: "Your perfect productive paradise",
    emoji: "🖥️",
    gradient: "from-blue-500 to-indigo-600",
    textColor: "text-blue-600",
    filterFn: (p) =>
      p.subcategory === "Laptops" ||
      p.subcategory === "Audio" ||
      p.subcategory === "Wearables" ||
      p.tags.includes("laptop") ||
      p.tags.includes("keyboard") ||
      p.tags.includes("monitor") ||
      p.tags.includes("wireless"),
  },
  {
    slug: "dream-home",
    name: "Dream Home",
    tagline: "Turn your space into a sanctuary",
    emoji: "🏡",
    gradient: "from-amber-400 to-orange-500",
    textColor: "text-amber-600",
    filterFn: (p) =>
      p.category === "home" ||
      p.subcategory === "TVs" ||
      p.tags.includes("home-theater") ||
      p.tags.includes("kitchen") ||
      p.tags.includes("smart-home"),
  },
  {
    slug: "dream-gaming",
    name: "Dream Gaming Setup",
    tagline: "Level up your play station",
    emoji: "🎮",
    gradient: "from-purple-500 to-pink-600",
    textColor: "text-purple-600",
    filterFn: (p) =>
      p.tags.includes("gaming") ||
      p.subcategory === "Gaming" ||
      p.tags.includes("home-theater") ||
      p.subcategory === "TVs" ||
      (p.subcategory === "Audio" && p.price > 5000),
  },
  {
    slug: "dream-fitness",
    name: "Dream Fitness Studio",
    tagline: "Build your body, not your debt",
    emoji: "💪",
    gradient: "from-green-500 to-emerald-600",
    textColor: "text-green-600",
    filterFn: (p) =>
      p.category === "sports" ||
      p.tags.includes("fitness") ||
      p.tags.includes("yoga") ||
      p.tags.includes("running") ||
      (p.subcategory === "Wearables" && p.tags.includes("fitness")),
  },
  {
    slug: "dream-travel",
    name: "Dream Travel Kit",
    tagline: "Pack light. Wander far.",
    emoji: "✈️",
    gradient: "from-cyan-500 to-sky-600",
    textColor: "text-cyan-600",
    filterFn: (p) =>
      p.tags.includes("wireless") ||
      p.tags.includes("waterproof") ||
      p.tags.includes("travel") ||
      p.subcategory === "Wearables" ||
      (p.category === "electronics" && p.price < 30000 && p.rating >= 4.4),
  },
  {
    slug: "dream-style",
    name: "Dream Wardrobe",
    tagline: "Dress like your best self",
    emoji: "👑",
    gradient: "from-rose-400 to-fuchsia-600",
    textColor: "text-rose-600",
    filterFn: (p) =>
      p.category === "sarees" ||
      p.category === "kurtis" ||
      p.category === "fashion" ||
      p.category === "mens" ||
      p.category === "beauty",
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
