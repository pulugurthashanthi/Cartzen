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
    <div className="max-w-6xl mx-auto px-4 pt-2 space-y-1.5">
      {welcome && (
        <div className="rounded-xl px-3 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white flex items-center gap-2.5 animate-slide-up">
          <Flame className="w-4 h-4 flex-shrink-0 fill-white/30" />
          <p className="flex-1 text-xs font-semibold leading-snug">
            Welcome back! 🔥 {r.engagement.streakCurrent}-day streak
            <span className="hidden sm:inline font-normal text-white/80">
              {" — "}{r.dailyBoxAvailable ? "Your daily box is ready below." : "Keep the flame alive — come back tomorrow too."}
            </span>
          </p>
          {r.dailyBoxAvailable && (
            <Link href="/rewards" className="bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-colors flex-shrink-0">
              <Gift className="w-3 h-3" /> Claim
            </Link>
          )}
          <button onClick={() => setWelcome(false)} className="text-white/70 hover:text-white flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {showCooloff && (
        <Link
          href="/cooling-off"
          className="block rounded-xl px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center gap-2.5 hover:border-blue-400 transition-colors"
        >
          <Snowflake className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="flex-1 text-xs font-semibold text-blue-800 dark:text-blue-400 leading-snug">
            {dueForCheck.length} item{dueForCheck.length > 1 ? "s" : ""} ready for your cooling-off check
            <span className="hidden sm:inline font-normal text-blue-600 dark:text-blue-500">
              {" — "}Still want {dueForCheck.length > 1 ? "them" : "it"}? Decide now 🛡️
            </span>
          </p>
          <button onClick={(e) => { e.preventDefault(); setShowCooloff(false); }} className="text-blue-400 hover:text-blue-600 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </Link>
      )}
    </div>
  );
}
