"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Gift, Lock, Snowflake, ChevronRight } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { formatPrice, cn } from "@/lib/utils";
import { PlantIllustration } from "@/components/ui/PlantIllustration";

const DAILY_GOAL = 500;
const RANGE_LABELS = ["7D", "1M", "3M", "6M", "1Y", "All"];

export function HomeDashboardRow() {
  const { savings, orders } = useOrders();
  const { dueForCheck } = useCoolingOff();

  // Derived, real cumulative-savings sparkline from order history (no fake data).
  const sparkPoints = useMemo(() => {
    if (orders.length === 0) return null;
    const sorted = [...orders].sort(
      (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()
    );
    let running = 0;
    const cumulative = sorted.map((o) => (running += o.total + (o.coinBonus ?? 0)));
    const max = Math.max(...cumulative, 1);
    const n = cumulative.length;
    return cumulative
      .map((v, i) => {
        const x = n === 1 ? 100 : (i / (n - 1)) * 100;
        const y = 38 - (v / max) * 34;
        return `${x},${y}`;
      })
      .join(" ");
  }, [orders]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* My Savings */}
        <div className="card p-5">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">My Savings</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-tight">{formatPrice(savings)}</p>
          <p className="text-xs text-gray-400 mb-3">Total Saved</p>
          <svg viewBox="0 0 100 40" className="w-full h-16" preserveAspectRatio="none">
            {sparkPoints ? (
              <polyline points={sparkPoints} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            ) : (
              <line x1="0" y1="38" x2="100" y2="38" stroke="#e5e7eb" strokeWidth="2" />
            )}
          </svg>
          <div className="flex gap-1.5 mt-2">
            {RANGE_LABELS.map((t) => (
              <span
                key={t}
                className={cn(
                  "text-[11px] px-2 py-1 rounded-lg",
                  t === "1M" ? "bg-blue-600 text-white font-semibold" : "text-gray-400"
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Daily Goal */}
        <div className="card p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Daily Goal</p>
            <p className="text-xs text-gray-400 mb-3">Keep it up! You&apos;re doing great.</p>
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-950/40">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">₹0</span>
                <span className="text-[10px] text-gray-400">of {formatPrice(DAILY_GOAL)}</span>
              </div>
            </div>
          </div>
          <PlantIllustration className="w-16 h-16 flex-shrink-0" />
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</p>
          <div className="space-y-1">
            <Link
              href="/rewards"
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Daily Box</p>
                <p className="text-xs text-gray-400">Open your surprise</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
            <Link
              href="/dream-vault"
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dream Vault</p>
                <p className="text-xs text-gray-400">Save for your dreams</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
            <Link
              href="/cooling-off"
              className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="relative w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center flex-shrink-0">
                <Snowflake className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                {dueForCheck.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {dueForCheck.length}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Cooling-Off</p>
                <p className="text-xs text-gray-400">Take a mindful pause</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
