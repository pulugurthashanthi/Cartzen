"use client";
import { useState } from "react";
import Link from "next/link";
import { Flame, Gift, Check, ChevronRight, Calendar } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";
import { boxSkinGradient } from "@/lib/engagement";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { RewardDrop } from "@/types";

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
    <section className="max-w-6xl mx-auto px-4 py-2">
      {activeBox && (
        <LootBoxModal
          drop={activeBox.drop}
          skinGradient={skin}
          title={activeBox.title}
          onClose={() => setActiveBox(null)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Streak */}
        <Link
          href="/rewards"
          className={cn(
            "rounded-2xl p-3 flex items-center gap-2.5 border transition-all active:scale-95",
            r.engagement.streakCurrent > 0
              ? "bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/30 border-orange-200 dark:border-orange-900"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          )}
        >
          <Flame className={cn("w-7 h-7 flex-shrink-0", r.engagement.streakCurrent > 0 ? "text-orange-500 fill-orange-400" : "text-gray-300")} />
          <div className="min-w-0">
            <p className="font-bold text-lg leading-none text-gray-900 dark:text-gray-100">{r.engagement.streakCurrent}</p>
            <p className="text-[11px] text-gray-500 leading-tight">day streak</p>
          </div>
        </Link>

        {/* Daily box */}
        <button
          onClick={handleDaily}
          disabled={!r.dailyBoxAvailable}
          className={cn(
            "rounded-2xl p-3 flex items-center gap-2.5 border transition-all active:scale-95 text-left",
            r.dailyBoxAvailable
              ? "bg-gradient-to-br from-fuchsia-500 to-purple-600 border-transparent text-white shadow-md"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          )}
        >
          <Gift className={cn("w-7 h-7 flex-shrink-0", r.dailyBoxAvailable ? "text-white" : "text-gray-300")} />
          <div className="min-w-0">
            <p className={cn("font-bold text-sm leading-tight", r.dailyBoxAvailable ? "text-white" : "text-gray-400")}>
              {r.dailyBoxAvailable ? "Open!" : "Claimed"}
            </p>
            <p className={cn("text-[11px] leading-tight", r.dailyBoxAvailable ? "text-white/80" : "text-gray-400")}>daily box</p>
          </div>
        </button>

        {/* Login reward */}
        <button
          onClick={handleLogin}
          disabled={!r.loginAvailable}
          className={cn(
            "rounded-2xl p-3 flex items-center gap-2.5 border transition-all active:scale-95 text-left",
            r.loginAvailable
              ? "bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-white shadow-md"
              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
          )}
        >
          <Calendar className={cn("w-7 h-7 flex-shrink-0", r.loginAvailable ? "text-white" : "text-gray-300")} />
          <div className="min-w-0">
            <p className={cn("font-bold text-sm leading-tight", r.loginAvailable ? "text-white" : "text-gray-400")}>
              {r.loginAvailable ? `+${r.nextLogin.coins || "Box"}` : "Claimed"}
            </p>
            <p className={cn("text-[11px] leading-tight", r.loginAvailable ? "text-white/80" : "text-gray-400")}>login bonus</p>
          </div>
        </button>

        {/* Coins → store */}
        <Link
          href="/store"
          className="rounded-2xl p-3 flex items-center gap-2.5 border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-all active:scale-95"
        >
          <span className="text-2xl flex-shrink-0">🪙</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-lg leading-none text-gray-900 dark:text-gray-100">{r.coins}</p>
            <p className="text-[11px] text-gray-500 leading-tight flex items-center gap-0.5">
              Zen Coins <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </Link>
      </div>

      {/* Challenge mini-strip */}
      <Link href="/rewards" className="mt-2.5 flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 hover:border-zen-300 transition-colors">
        <span className="text-lg">🎯</span>
        <div className="flex-1 flex gap-3">
          {r.challenges.map((c) => {
            const prog = r.challengeProgress[c.metric] ?? 0;
            const done = r.challengeClaimed.includes(c.id) || prog >= c.goal;
            return (
              <div key={c.id} className="flex items-center gap-1 text-xs">
                {done ? <Check className="w-3.5 h-3.5 text-green-500" /> : <span className="text-gray-400">{c.emoji}</span>}
                <span className={cn(done ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500")}>
                  {Math.min(prog, c.goal)}/{c.goal}
                </span>
              </div>
            );
          })}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </Link>
    </section>
  );
}
