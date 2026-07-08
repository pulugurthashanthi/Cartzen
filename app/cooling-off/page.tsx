"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Snowflake, Clock, ShoppingCart, Trash2,
  Check, X, TrendingDown, BarChart2, Plus,
} from "lucide-react";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { useCart } from "@/contexts/CartContext";
import { useRewards } from "@/hooks/useRewards";
import { formatPrice, cn } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import { Confetti } from "@/components/ui/Confetti";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import type { CoolingOffItem } from "@/types";

const RESIST_COIN_REWARD = 25;

const TRIGGER_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  bored: { label: "Bored", emoji: "😴", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  stressed: { label: "Stressed", emoji: "😰", color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
  rewarding_myself: { label: "Rewarding Myself", emoji: "🎁", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  need_product: { label: "Actually Need It", emoji: "✅", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  just_browsing: { label: "Just Browsing", emoji: "👀", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
};

const COOL_OFF_OPTIONS: { days: 1 | 7 | 30; label: string; desc: string }[] = [
  { days: 1, label: "24 Hours", desc: "Quick check" },
  { days: 7, label: "7 Days", desc: "Recommended" },
  { days: 30, label: "30 Days", desc: "Big purchase" },
];

// In demo mode, real durations (1d / 7d / 30d) are compressed to 2 / 5 / 10 minutes
// so testers can verify the full flow without waiting days.
const DEMO_MODE = true;

const REAL_DURATION_LABEL: Record<number, string> = { 1: "24-hour", 7: "7-day", 30: "30-day" };

function getDaysRemaining(item: CoolingOffItem): { pct: number; label: string; expired: boolean; durationLabel: string } {
  const days = item.coolOffDays ?? 1;
  const durationLabel = REAL_DURATION_LABEL[days] ?? `${days}-day`;
  const addedTime = new Date(item.addedAt).getTime();
  const realMs = days * 24 * 60 * 60 * 1000;
  const demoMs = days === 1 ? 2 * 60_000 : days === 7 ? 5 * 60_000 : 10 * 60_000;
  const targetMs = DEMO_MODE ? demoMs : realMs;
  const elapsed = Date.now() - addedTime;
  const pct = Math.min(100, Math.round((elapsed / targetMs) * 100));
  const expired = elapsed >= targetMs;
  if (expired) return { pct: 100, label: "Ready for check-in!", expired: true, durationLabel };
  if (DEMO_MODE) {
    const secsLeft = Math.max(0, Math.ceil((targetMs - elapsed) / 1000));
    const label = secsLeft > 60 ? `~${Math.ceil(secsLeft / 60)}m left (demo)` : `${secsLeft}s left (demo)`;
    return { pct, label, expired: false, durationLabel };
  }
  const hoursLeft = Math.max(0, Math.ceil((targetMs - elapsed) / 3600000));
  const label = hoursLeft >= 24 ? `${Math.ceil(hoursLeft / 24)}d left` : `${hoursLeft}h left`;
  return { pct, label, expired: false, durationLabel };
}

export default function CoolingOffPage() {
  const { items, removeItem, markChecked, extendCoolOff, dueForCheck, analytics } = useCoolingOff();
  const { addItem } = useCart();
  const { grantCoins } = useRewards();
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleResist = (productId: string) => {
    markChecked(productId, false);
    grantCoins(RESIST_COIN_REWARD);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
    showToast(`🛡️ Urge defeated! +${RESIST_COIN_REWARD} Zen Coins earned`, "resist");
  };

  const pending = items.filter((i) => !i.checkedAt);
  const resolved = items.filter((i) => i.checkedAt);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Confetti active={showConfetti} />
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Cooling-Off List</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Pause before you purchase. Most urges vanish on their own.
        </p>
      </div>

      {/* Demo mode notice */}
      {DEMO_MODE && (
        <div className="mb-5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-400">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Demo mode — timers compressed.</span>{" "}
            Real cool-off periods are 24 hours, 7 days, or 30 days. In demo they run for 2, 5, or 10 minutes so you can test the full flow.
          </p>
        </div>
      )}

      {/* Analytics strip */}
      {analytics.resolved > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold zen-gradient-text">{analytics.vanishRate}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Urges vanished</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{analytics.urgesVanished}</p>
            <p className="text-xs text-gray-400 mt-0.5">Urges resisted</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-green-600">{formatPrice(analytics.totalSavedFromVanished)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Saved this way</p>
          </div>
        </div>
      )}

      {/* Due for check-in */}
      {dueForCheck.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Cool-off period over! Do you still want these?
            </p>
          </div>
          <div className="space-y-3">
            {dueForCheck.map((item) => (
              <div key={item.productId} className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => markChecked(item.productId, true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-200 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Yes
                  </button>
                  <button
                    onClick={() => handleResist(item.productId)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 text-xs font-semibold hover:bg-violet-200 transition-colors"
                  >
                    🛡️ Nah!
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {items.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 animate-bounce-gentle">❄️</div>
          <h3 className="font-semibold text-lg mb-2">Nothing on ice — yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Either incredible willpower, or you haven&apos;t met our products.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Research: 74% of impulse urges vanish within 7 days. FakeBasket helps you wait it out.
          </p>
          <Link href="/" className="btn-primary">Browse Products</Link>
        </div>
      )}

      {/* Pending items */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Waiting ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((item) => {
              const { pct, label, expired, durationLabel } = getDaysRemaining(item);
              const trigger = item.trigger ? TRIGGER_LABELS[item.trigger] : null;
              const isExpanding = checkingId === item.productId;

              return (
                <div key={item.productId} className="card p-4">
                  <div className="flex gap-4">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0"
                    >
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{item.product.brand}</p>
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-zen-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="font-bold text-sm mt-0.5">{formatPrice(item.product.price)}</p>

                      {/* Trigger badge */}
                      {trigger && (
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1.5", trigger.color)}>
                          {trigger.emoji} {trigger.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {durationLabel} cool-off{DEMO_MODE ? " (demo)" : ""}
                      </span>
                      <span className={cn("text-xs font-medium", expired ? "text-amber-600" : "text-gray-400")}>
                        {label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          expired ? "bg-amber-400" : "bg-gradient-to-r from-blue-400 to-blue-600"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {expired ? (
                      <>
                        <button
                          onClick={() => handleResist(item.productId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 hover:bg-violet-200 transition-colors"
                        >
                          🛡️ Urge gone! +{RESIST_COIN_REWARD}🪙
                        </button>
                        <button
                          onClick={() => markChecked(item.productId, true)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Still want it
                        </button>
                        <button
                          onClick={() => extendCoolOff(item.productId, 7)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> +7 days
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Cooling off… hang tight 🧊</span>
                    )}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved items */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            History ({resolved.length})
          </h2>
          <div className="space-y-3">
            {resolved.map((item) => {
              const urgeVanished = item.urgeDisappeared;
              return (
                <div
                  key={item.productId}
                  className={cn("card p-4 flex gap-3", urgeVanished && "opacity-70")}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mb-1.5">{formatPrice(item.product.price)}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                      urgeVanished
                        ? "bg-zen-100 text-zen-700 dark:bg-zen-900/50 dark:text-zen-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                    )}>
                      {urgeVanished ? (
                        <><TrendingDown className="w-3 h-3" /> Urge disappeared — {formatPrice(item.product.price)} saved!</>
                      ) : (
                        <><Check className="w-3 h-3" /> Still wanted — genuine need</>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {item.stillWanted && (
                      <button
                        onClick={() => addItem(item.product)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold btn-primary"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Cart
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-300 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      {items.length > 0 && (
        <div className="mt-8 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
          <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-400 mb-2">
            ❄️ How Cooling-Off works
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-500 leading-relaxed">
            Research shows 74% of shopping urges vanish within 7 days without a single purchase.
            FakeBasket tracks your cool-off results — the more data you build, the more you understand
            your own triggers. You&apos;re not fighting urges; you&apos;re outlasting them.
          </p>
        </div>
      )}
    </div>
  );
}
