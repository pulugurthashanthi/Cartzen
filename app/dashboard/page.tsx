"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  BarChart2,
  Calendar,
  Award,
  BookOpen,
  Target,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useJournal } from "@/hooks/useJournal";
import {
  formatPrice,
  getMonthlySavings,
  getAverageCartValue,
  getNextMilestone,
  getAchievedMilestones,
  getSavingsEquivalents,
  MILESTONES,
  cn,
} from "@/lib/utils";

const REASON_LABELS: Record<string, string> = {
  bored: "😴 Bored",
  stressed: "😰 Stressed",
  rewarding_myself: "🎁 Rewarding Myself",
  need_product: "✅ Needed It",
  just_browsing: "👀 Just Browsing",
};

export default function DashboardPage() {
  const { orders, savings, refreshOrders } = useOrders();
  const { entries, reasonCounts } = useJournal();

  useEffect(() => {
    refreshOrders();
  }, []);

  const monthly = getMonthlySavings(orders);
  const avgCart = getAverageCartValue(orders);
  const nextMilestone = getNextMilestone(savings);
  const achieved = getAchievedMilestones(savings);
  const equivalents = getSavingsEquivalents(savings);
  const totalReasonEntries = Object.values(reasonCounts).reduce((a, b) => a + b, 0);

  // Category frequency
  const categoryMap: Record<string, number> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      categoryMap[i.product.category] = (categoryMap[i.product.category] || 0) + 1;
    })
  );
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (orders.length === 0 && savings === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4 animate-bounce-gentle">📊</div>
          <h2 className="font-display text-2xl font-bold mb-2">Nothing to report... yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Your savings dashboard is emptier than your motivation on a Monday.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Place your first fake order. This is the best financial advice you'll receive today.
          </p>
          <Link href="/" className="btn-primary">Start Saving (by Shopping)</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Savings Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Every simulated order is real money saved.
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: TrendingUp,
            label: "Lifetime Savings",
            value: formatPrice(savings),
            color: "text-zen-500",
            bg: "bg-zen-50 dark:bg-zen-950/50",
          },
          {
            icon: Calendar,
            label: "This Month",
            value: formatPrice(monthly),
            color: "text-calm-500",
            bg: "bg-calm-50 dark:bg-calm-950/50",
          },
          {
            icon: ShoppingBag,
            label: "Total Orders",
            value: orders.length.toString(),
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-950/50",
          },
          {
            icon: BarChart2,
            label: "Avg. Cart",
            value: formatPrice(avgCart),
            color: "text-rose-500",
            bg: "bg-rose-50 dark:bg-rose-950/50",
          },
        ].map((s) => (
          <div key={s.label} className={cn("card p-4 border-0", s.bg)}>
            <s.icon className={cn("w-5 h-5 mb-2", s.color)} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Savings reality translator */}
      {equivalents.length > 0 && (
        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 zen-gradient opacity-10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🤑</span>
              <h2 className="font-semibold">What {formatPrice(savings)} could actually buy</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              The same money you didn&apos;t spend, in things you can actually picture. You&apos;re welcome.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {equivalents.map((eq) => (
                <div
                  key={eq.text}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-zen-50 to-calm-50 dark:from-zen-950/40 dark:to-calm-950/40 border border-orange-100 dark:border-gray-800"
                >
                  <span className="text-3xl flex-shrink-0">{eq.emoji}</span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                    {eq.text}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center italic">
              …or you could just keep it in the bank. Wild idea, we know. 💸
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Milestone progress */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-zen-500" />
            <h2 className="font-semibold">Milestones</h2>
          </div>

          <div className="space-y-3">
            {MILESTONES.map((m) => {
              const isAchieved = savings >= m.amount;
              return (
                <div key={m.amount}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={cn("font-medium", isAchieved ? "text-zen-600 dark:text-zen-400" : "text-gray-500")}>
                      {isAchieved ? "✅ " : ""}{formatPrice(m.amount)}
                    </span>
                    {isAchieved && <span className="text-zen-500">Achieved!</span>}
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full zen-gradient rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((savings / m.amount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {nextMilestone && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              {formatPrice(nextMilestone.amount - savings)} away from next milestone!
            </p>
          )}
        </div>

        {/* Shopping reasons */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-calm-500" />
            <h2 className="font-semibold">Why You Shop</h2>
          </div>

          {totalReasonEntries === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Your journal insights will appear here
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(REASON_LABELS).map(([key, label]) => {
                const count = (reasonCounts as Record<string, number>)[key] || 0;
                const pct = totalReasonEntries ? Math.round((count / totalReasonEntries) * 100) : 0;
                if (count === 0) return null;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-calm-400 to-calm-600 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold">Most Shopped Categories</h2>
            </div>
            <div className="space-y-3">
              {topCategories.map(([cat, count], i) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full zen-gradient flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">{cat}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{count} item{count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reality Check insights */}
        {(() => {
          const checked = orders.filter((o) => o.status === "delivered" && o.realityCheck);
          if (checked.length < 2) return null;
          const gone = checked.filter((o) => o.realityCheck?.response === "no").length;
          const pct = Math.round((gone / checked.length) * 100);
          return (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔍</span>
                <h2 className="font-semibold">Reality Check</h2>
              </div>
              <p className="text-4xl font-bold zen-gradient-text mb-1">{pct}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                of items were <span className="font-semibold">no longer wanted</span> after reflection
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Based on {checked.length} reality checks
              </p>
            </div>
          );
        })()}

        {/* Achievements */}
        {achieved.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold">Achievements Unlocked</h2>
            </div>
            <div className="space-y-2">
              {achieved.map((m) => (
                <div key={m.amount} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                  <span className="text-lg">🏆</span>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    {formatPrice(m.amount)} saved!
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
