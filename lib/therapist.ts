import type { ShoppingReason } from "@/types";
import type { Order } from "@/types";

interface TherapistInsight {
  title: string;
  body: string;
  emoji: string;
  color: string;
}

const REASON_VERBS: Record<ShoppingReason, string> = {
  bored: "out of boredom",
  stressed: "while stressed",
  rewarding_myself: "to reward yourself",
  need_product: "because you genuinely needed something",
  just_browsing: "while browsing",
};

const REASON_EMOJIS: Record<ShoppingReason, string> = {
  bored: "😴",
  stressed: "😤",
  rewarding_myself: "🎁",
  need_product: "✅",
  just_browsing: "👀",
};

const GENERIC_INSIGHTS: Record<ShoppingReason, string[]> = {
  bored: [
    "Boredom shopping is the #1 impulse trigger. The urge usually peaks for 20–30 minutes — you've already outlasted it.",
    "Interesting: boredom triggers are often satisfied by scrolling alone. You didn't need to buy — the browsing was enough.",
    "Researchers call boredom-shopping 'hedonic escapism'. Which sounds much fancier than it is. You're doing great.",
  ],
  stressed: [
    "Stress-shopping floods the brain with short-term dopamine — but the relief fades in minutes. Fake Basket gave you the hit for free.",
    "Your nervous system found a healthy outlet. The urge to spend when stressed is real, but so is your ability to resist it.",
    "Studies show stressed shoppers spend 30–50% more per session. You just saved that entire percentage. Science. 🧬",
  ],
  rewarding_myself: [
    "You absolutely deserve a reward. The fact that Fake Basket lets you feel it without spending it? That's the whole idea.",
    "Self-gifting is a real psychological need. Fulfilling it for ₹0 is the most boss move possible.",
    "Treating yourself doesn't require a credit card. You just proved it. 👑",
  ],
  need_product: [
    "When the need is real, the urge doesn't disappear with time. If this still calls you in 7 days, it might be worth buying for real.",
    "Genuine needs deserve genuine consideration. Fake Basket helped you simulate the purchase — now you can decide calmly.",
    "The simulation is complete. You've experienced the 'having it' feeling. Now ask: do I need to actually buy this?",
  ],
  just_browsing: [
    "'Just browsing' is responsible for 43% of impulse purchases worldwide. Your wallet is safe — for now. 👁️",
    "The best shopping sessions are the ones that end at ₹0. You've mastered the art.",
    "Research shows window-shopping satisfies the same craving centers as buying. Enjoy your ₹0 dopamine hit.",
  ],
};

export function generateTherapistInsight(
  currentReason: ShoppingReason,
  orders: Order[],
  currentSaved: number
): TherapistInsight {
  const reasonCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const r = o.journalEntry?.reason;
    if (r) reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  const totalOrders = orders.length;
  const currentReasonCount = (reasonCounts[currentReason] || 0) + 1;
  const currentReasonPct = totalOrders > 0
    ? Math.round((currentReasonCount / (totalOrders + 1)) * 100)
    : 100;

  const color = {
    bored: "from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700",
    stressed: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-900",
    rewarding_myself: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-900",
    need_product: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900",
    just_browsing: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900",
  }[currentReason];

  // If enough history, generate personalised insight
  if (totalOrders >= 3 && currentReasonPct >= 40) {
    const savedFromReason = orders
      .filter((o) => o.journalEntry?.reason === currentReason)
      .reduce((sum, o) => sum + o.total, 0);

    return {
      title: `You shop ${REASON_VERBS[currentReason]} ${currentReasonPct}% of the time`,
      body: `Out of your ${totalOrders} simulated sessions, ${currentReasonCount} happened ${REASON_VERBS[currentReason]}. You've saved ${savedFromReason > 0 ? `₹${savedFromReason.toLocaleString("en-IN")} just from those sessions` : "money from each one"}. No judgment — just awareness. 🌱`,
      emoji: REASON_EMOJIS[currentReason],
      color,
    };
  }

  // Generic insight for that reason
  const lines = GENERIC_INSIGHTS[currentReason];
  const line = lines[Math.floor(Math.random() * lines.length)];

  return {
    title: `Shopping ${REASON_VERBS[currentReason]}`,
    body: line,
    emoji: REASON_EMOJIS[currentReason],
    color,
  };
}
