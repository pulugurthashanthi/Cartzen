"use client";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { useRewards } from "@/hooks/useRewards";
import { formatPrice } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Flame, Gift } from "lucide-react";

export function Hero() {
  const { savings } = useOrders();
  const r = useRewards();
  const isReturning = savings > 0 || r.engagement.streakCurrent > 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-fuchsia-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950 border-b border-orange-100 dark:border-gray-800">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-br from-orange-200/30 to-fuchsia-200/20 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        {isReturning ? (
          /* ── Returning user: personal dashboard strip ── */
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-widest mb-0.5">Welcome back</p>
              <h1 className="font-display text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Add to cart.{" "}
                <span className="zen-gradient-text">Spend ₹0.</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                Your savings keep growing while your wallet stays full.
              </p>
            </div>

            {/* Personal metrics — only shown when non-zero */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {savings > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-orange-100 dark:border-gray-800">
                  <div className="w-7 h-7 rounded-lg zen-gradient flex items-center justify-center text-sm flex-shrink-0">🏦</div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-medium leading-none mb-0.5">Total Saved</p>
                    <AnimatedNumber value={savings} format={formatPrice} className="font-bold text-sm zen-gradient-text leading-none" />
                  </div>
                </div>
              )}
              {r.engagement.streakCurrent > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-orange-100 dark:border-gray-800">
                  <Flame className="w-7 h-7 text-orange-500 fill-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-medium leading-none mb-0.5">Streak</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-none">{r.engagement.streakCurrent}d</p>
                  </div>
                </div>
              )}
              {r.coins > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-orange-100 dark:border-gray-800">
                  <span className="text-lg flex-shrink-0">🪙</span>
                  <div>
                    <p className="text-[9px] text-gray-400 font-medium leading-none mb-0.5">Zen Coins</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-none">{r.coins}</p>
                  </div>
                </div>
              )}
              {r.dailyBoxAvailable && (
                <Link
                  href="/rewards"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-md text-white active:scale-95 transition-transform"
                >
                  <Gift className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-white/70 font-medium leading-none mb-0.5">Ready!</p>
                    <p className="font-bold text-xs leading-none">Daily Box</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ── New user: minimal value prop ── */
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[11px] font-semibold mb-2">
                🛒 The internet&apos;s most harmless shopping addiction
              </div>
              <h1 className="font-display text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
                Add to cart. Checkout.{" "}
                <span className="zen-gradient-text">Spend ₹0.</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                Satisfy the shopping urge without spending real money. Earn rewards, track savings, and understand your triggers.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/rewards" className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 shadow-sm text-center min-w-[68px]">
                <span className="text-lg">🎁</span>
                <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Daily Box</p>
              </Link>
              <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 shadow-sm text-center min-w-[68px]">
                <span className="text-lg">🏦</span>
                <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Save Money</p>
              </Link>
              <Link href="/cooling-off" className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 shadow-sm text-center min-w-[68px]">
                <span className="text-lg">❄️</span>
                <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Cool Off</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
