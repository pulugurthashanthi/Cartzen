"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Snowflake, Gift, X } from "lucide-react";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { useRewards } from "@/hooks/useRewards";
import { notifyDelivery, canNotify } from "@/lib/notify";
import { todayStr } from "@/lib/engagement";

function seenToday(key: string): boolean {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem(key) === todayStr(); } catch { return true; }
}
function markToday(key: string) {
  try { localStorage.setItem(key, todayStr()); } catch { /* ignore */ }
}

export function RetentionBanners() {
  const { dueForCheck } = useCoolingOff();
  const r = useRewards();
  const [welcome, setWelcome] = useState(false);
  const [showCooloff, setShowCooloff] = useState(false);

  // Once-per-day welcome back (only if a streak exists)
  useEffect(() => {
    const t = setTimeout(() => {
      if (r.engagement.streakCurrent > 0 && !seenToday("cartzen_welcomed_date")) {
        setWelcome(true);
        markToday("cartzen_welcomed_date");
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [r.engagement.streakCurrent]);

  // Cooling-off reminder + once-daily notification
  useEffect(() => {
    if (dueForCheck.length > 0) {
      setShowCooloff(true);
      if (canNotify() && !seenToday("cartzen_cooloff_notified_date")) {
        try {
          new Notification("❄️ Cooling-off check-in", {
            body: `${dueForCheck.length} item${dueForCheck.length > 1 ? "s are" : " is"} ready for review. Still want ${dueForCheck.length > 1 ? "them" : "it"}?`,
            icon: "/icon.svg",
            tag: "cartzen-cooloff",
          });
        } catch { /* ignore */ }
        markToday("cartzen_cooloff_notified_date");
      }
    }
  }, [dueForCheck.length]); // eslint-disable-line react-hooks/exhaustive-deps
  void notifyDelivery;

  if (!welcome && !showCooloff) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-3 space-y-2">
      {welcome && (
        <div className="rounded-2xl p-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white flex items-center gap-3 animate-slide-up">
          <Flame className="w-6 h-6 flex-shrink-0 fill-white/30" />
          <div className="flex-1">
            <p className="font-bold text-sm">Welcome back! 🔥 {r.engagement.streakCurrent}-day streak</p>
            <p className="text-xs text-white/80">
              {r.dailyBoxAvailable ? "Your daily box is ready below." : "Keep the flame alive — come back tomorrow too."}
            </p>
          </div>
          {r.dailyBoxAvailable && (
            <Link href="/rewards" className="bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-colors">
              <Gift className="w-3.5 h-3.5" /> Claim
            </Link>
          )}
          <button onClick={() => setWelcome(false)} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showCooloff && (
        <Link
          href="/cooling-off"
          className="block rounded-2xl p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center gap-3 hover:border-blue-400 transition-colors"
        >
          <Snowflake className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm text-blue-800 dark:text-blue-400">
              {dueForCheck.length} item{dueForCheck.length > 1 ? "s" : ""} ready for your cooling-off check
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500">Still want {dueForCheck.length > 1 ? "them" : "it"}? Decide now & resist an urge 🛡️</p>
          </div>
          <button onClick={(e) => { e.preventDefault(); setShowCooloff(false); }} className="text-blue-400 hover:text-blue-600"><X className="w-4 h-4" /></button>
        </Link>
      )}
    </div>
  );
}
