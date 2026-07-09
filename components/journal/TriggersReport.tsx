"use client";
import { ShieldCheck, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalEntry, ShoppingReason } from "@/types";

const REASON_META: Record<ShoppingReason, { label: string; emoji: string }> = {
  bored: { label: "Boredom", emoji: "😴" },
  stressed: { label: "Stress", emoji: "😰" },
  rewarding_myself: { label: "Self-reward", emoji: "🎁" },
  need_product: { label: "Genuine need", emoji: "✅" },
  just_browsing: { label: "Browsing", emoji: "👀" },
};

const TIME_BUCKETS = [
  { label: "Morning", emoji: "🌅", from: 5, to: 11 },
  { label: "Afternoon", emoji: "☀️", from: 12, to: 16 },
  { label: "Evening", emoji: "🌆", from: 17, to: 20 },
  { label: "Late night", emoji: "🌙", from: 21, to: 4 }, // wraps past midnight
] as const;

function bucketOf(hour: number): number {
  return TIME_BUCKETS.findIndex((b) =>
    b.from <= b.to ? hour >= b.from && hour <= b.to : hour >= b.from || hour <= b.to
  );
}

export function TriggersReport({ entries }: { entries: JournalEntry[] }) {
  if (entries.length < 3) return null; // too little data to say anything honest

  const total = entries.length;

  // Reason distribution
  const byReason = new Map<ShoppingReason, number>();
  for (const e of entries) byReason.set(e.reason, (byReason.get(e.reason) ?? 0) + 1);
  const reasons = [...byReason.entries()].sort((a, b) => b[1] - a[1]);
  const maxReason = reasons[0][1];

  // Time-of-day distribution
  const timeCounts = [0, 0, 0, 0];
  for (const e of entries) {
    const idx = bucketOf(new Date(e.timestamp).getHours());
    if (idx >= 0) timeCounts[idx]++;
  }
  const peakIdx = timeCounts.indexOf(Math.max(...timeCounts));
  const peak = TIME_BUCKETS[peakIdx];

  // Urges that never became a (fake) purchase
  const caught = entries.filter((e) => !e.orderId).length;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-zen-500" />
        <h2 className="font-display text-lg font-bold">Your trigger report</h2>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
          <p className="font-bold text-lg">{total}</p>
          <p className="text-[11px] text-gray-400 leading-tight">Urges logged</p>
        </div>
        <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-3 text-center">
          <p className="font-bold text-lg text-green-700 dark:text-green-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" /> {caught}
          </p>
          <p className="text-[11px] text-gray-400 leading-tight">Caught before buying</p>
        </div>
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 p-3 text-center">
          <p className="font-bold text-lg">{peak.emoji}</p>
          <p className="text-[11px] text-gray-400 leading-tight">Danger zone: {peak.label.toLowerCase()}</p>
        </div>
      </div>

      {/* Reason bars */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">What sets you off</p>
      <div className="space-y-2 mb-5">
        {reasons.map(([reason, count]) => {
          const meta = REASON_META[reason];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={reason} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-center flex-shrink-0">{meta.emoji}</span>
              <span className="w-24 text-xs font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{meta.label}</span>
              <div className="flex-1 h-5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all"
                  style={{ width: `${Math.max((count / maxReason) * 100, 8)}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-gray-400 flex-shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Time of day */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
        <Clock className="w-3 h-3" /> When urges hit
      </p>
      <div className="grid grid-cols-4 gap-2">
        {TIME_BUCKETS.map((b, i) => {
          const isPeak = i === peakIdx && timeCounts[i] > 0;
          return (
            <div
              key={b.label}
              className={cn(
                "rounded-xl p-2.5 text-center border",
                isPeak
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                  : "bg-gray-50 dark:bg-gray-800/60 border-transparent"
              )}
            >
              <p className="text-base">{b.emoji}</p>
              <p className={cn("font-bold text-sm", isPeak && "text-rose-600 dark:text-rose-400")}>{timeCounts[i]}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{b.label}</p>
            </div>
          );
        })}
      </div>
      {timeCounts[peakIdx] > 1 && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Most of your urges hit in the {peak.label.toLowerCase()}. Knowing your danger zone is half the defense —
          plan something else for that window.
        </p>
      )}
    </div>
  );
}
