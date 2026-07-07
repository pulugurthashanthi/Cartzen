"use client";
import { useState } from "react";
import Link from "next/link";
import { Flame, Gift, Calendar, Sparkles } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";
import { boxSkinGradient } from "@/lib/engagement";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { RewardDrop } from "@/types";

// Slim icon-button strip — each button performs its action directly (claim/open modal)
// rather than expanding inline, so the home page stays product-first.
export function DailyHub() {
  const r = useRewards();
  const [activeBox, setActiveBox] = useState<{ drop: RewardDrop; title: string } | null>(null);
  const skin = boxSkinGradient(r.store.activeBoxSkin);

  const handleDaily = () => {
    const drop = r.claimDailyBox();
    if (drop) {
      sound.tick();
      setActiveBox({ drop, title: "Your daily reward box!" });
    }
  };

  const handleLogin = () => {
    const res = r.claimLogin();
    if (res?.box) setActiveBox({ drop: res.box, title: "Day 7 bonus box!" });
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-1.5">
      {activeBox && (
        <LootBoxModal
          drop={activeBox.drop}
          skinGradient={skin}
          title={activeBox.title}
          onClose={() => setActiveBox(null)}
        />
      )}

      <div className="flex items-center gap-1.5">
        {/* Streak */}
        <Link
          href="/rewards"
          className={cn(
            "flex items-center gap-1 rounded-full pl-1.5 pr-2.5 py-1.5 border transition-all active:scale-95",
            r.engagement.streakCurrent > 0
              ? "bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/30 border-orange-200 dark:border-orange-900"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          )}
          title="Login streak"
        >
          <Flame className={cn("w-4 h-4", r.engagement.streakCurrent > 0 ? "text-orange-500 fill-orange-400" : "text-gray-300")} />
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{r.engagement.streakCurrent}d</span>
        </Link>

        {/* Daily box — tap opens the reward modal directly */}
        <button
          onClick={handleDaily}
          disabled={!r.dailyBoxAvailable}
          className={cn(
            "relative flex items-center gap-1 rounded-full pl-1.5 pr-2.5 py-1.5 border transition-all active:scale-95",
            r.dailyBoxAvailable
              ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 border-transparent text-white shadow-sm"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          )}
          title="Daily box"
        >
          <Gift className={cn("w-4 h-4", r.dailyBoxAvailable ? "text-white" : "text-gray-300")} />
          <span className={cn("text-xs font-bold", r.dailyBoxAvailable ? "text-white" : "text-gray-400")}>
            {r.dailyBoxAvailable ? "Open" : "Box"}
          </span>
          {r.dailyBoxAvailable && <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse absolute -top-1 -right-1" />}
        </button>

        {/* Login bonus — tap claims directly */}
        <button
          onClick={handleLogin}
          disabled={!r.loginAvailable}
          className={cn(
            "flex items-center gap-1 rounded-full pl-1.5 pr-2.5 py-1.5 border transition-all active:scale-95",
            r.loginAvailable
              ? "bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-white shadow-sm"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          )}
          title="Login bonus"
        >
          <Calendar className={cn("w-4 h-4", r.loginAvailable ? "text-white" : "text-gray-300")} />
          <span className={cn("text-xs font-bold", r.loginAvailable ? "text-white" : "text-gray-400")}>
            {r.loginAvailable ? `+${r.nextLogin.coins || "Box"}` : "Login"}
          </span>
        </button>

        {/* Coins → store */}
        <Link
          href="/store"
          className="flex items-center gap-1 rounded-full pl-1.5 pr-2.5 py-1.5 border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-all active:scale-95 ml-auto"
          title="Zen Coins"
        >
          <span className="text-sm">🪙</span>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{r.coins}</span>
        </Link>
      </div>
    </section>
  );
}
