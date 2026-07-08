"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Gift, Lock, Snowflake, ChevronRight, Pencil } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { formatPrice, cn } from "@/lib/utils";
import { PlantIllustration } from "@/components/ui/PlantIllustration";

const GOAL_KEY = "cartzen_daily_goal";
const DEFAULT_GOAL = 500;

const RANGES = [
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 91 },
  { label: "6M", days: 182 },
  { label: "1Y", days: 365 },
  { label: "All", days: Infinity },
] as const;

type RangeLabel = (typeof RANGES)[number]["label"];

export function HomeDashboardRow() {
  const { savings, orders } = useOrders();
  const { dueForCheck } = useCoolingOff();
  const [range, setRange] = useState<RangeLabel>("1M");
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");

  // Goal is read after mount so server and client render the same default.
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(GOAL_KEY));
      if (Number.isFinite(stored) && stored > 0) setGoal(stored);
    } catch { /* ignore */ }
  }, []);

  const saveGoal = () => {
    const n = Math.round(Number(goalDraft));
    if (Number.isFinite(n) && n > 0) {
      setGoal(n);
      try { localStorage.setItem(GOAL_KEY, String(n)); } catch { /* ignore */ }
    }
    setEditingGoal(false);
  };

  // Savings gained within the selected range, as a cumulative sparkline.
  const { sparkPoints, rangeSaved } = useMemo(() => {
    const def = RANGES.find((r) => r.label === range)!;
    const cutoff = def.days === Infinity ? 0 : Date.now() - def.days * 86_400_000;
    const inRange = orders
      .filter((o) => new Date(o.placedAt).getTime() >= cutoff)
      .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
    if (inRange.length === 0) return { sparkPoints: null, rangeSaved: 0 };
    let running = 0;
    const cumulative = inRange.map((o) => (running += o.total + (o.coinBonus ?? 0)));
    const max = Math.max(...cumulative, 1);
    const n = cumulative.length;
    const pts = cumulative
      .map((v, i) => {
        const x = n === 1 ? 100 : (i / (n - 1)) * 100;
        const y = 38 - (v / max) * 34;
        return `${x},${y}`;
      })
      .join(" ");
    return { sparkPoints: pts, rangeSaved: running };
  }, [orders, range]);

  // Today's saved amount drives the goal ring.
  const todaySaved = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter((o) => new Date(o.placedAt).toDateString() === today)
      .reduce((sum, o) => sum + o.total + (o.coinBonus ?? 0), 0);
  }, [orders]);

  const goalPct = Math.min(100, Math.round((todaySaved / goal) * 100));
  const RING_R = 30;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* My Savings */}
        <div className="card p-5">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">My Savings</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-tight">{formatPrice(savings)}</p>
          <p className="text-xs text-gray-400 mb-3">
            Total Saved{range !== "All" && rangeSaved > 0 && (
              <span> · {formatPrice(rangeSaved)} in last {range}</span>
            )}
          </p>
          <svg viewBox="0 0 100 40" className="w-full h-16" preserveAspectRatio="none">
            {sparkPoints ? (
              <polyline points={sparkPoints} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            ) : (
              <line x1="0" y1="38" x2="100" y2="38" stroke="#e5e7eb" strokeWidth="2" />
            )}
          </svg>
          {!sparkPoints && (
            <p className="text-[11px] text-gray-400 -mt-2 mb-1">No orders in this range yet</p>
          )}
          <div className="flex gap-1.5 mt-2">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r.label)}
                className={cn(
                  "text-[11px] px-2 py-1 rounded-lg transition-colors",
                  r.label === range
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Goal */}
        <div className="card p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Daily Goal</p>
              <button
                onClick={() => { setGoalDraft(String(goal)); setEditingGoal(true); }}
                className="text-gray-300 hover:text-blue-500 transition-colors"
                aria-label="Edit daily goal"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
            {editingGoal ? (
              <form
                onSubmit={(e) => { e.preventDefault(); saveGoal(); }}
                className="flex items-center gap-1.5 mb-3"
              >
                <span className="text-xs text-gray-400">₹</span>
                <input
                  type="number"
                  min="1"
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  onBlur={saveGoal}
                  autoFocus
                  className="w-20 text-xs px-2 py-1 rounded-lg border border-blue-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-blue-500"
                />
                <button type="submit" className="text-[11px] font-semibold text-blue-600">Save</button>
              </form>
            ) : (
              <p className="text-xs text-gray-400 mb-3">
                {todaySaved >= goal
                  ? "Goal smashed! 🎉"
                  : todaySaved > 0
                    ? "Keep it up! You're doing great."
                    : "Fill a basket to make progress."}
              </p>
            )}
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
                <circle cx="36" cy="36" r={RING_R} fill="none" stroke="currentColor" strokeWidth="6" className="text-green-100 dark:text-green-950" />
                <circle
                  cx="36" cy="36" r={RING_R} fill="none"
                  stroke="#22c55e" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - goalPct / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatPrice(todaySaved)}</span>
                <span className="text-[10px] text-gray-400">of {formatPrice(goal)}</span>
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
