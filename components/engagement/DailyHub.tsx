"use client";
import { useState } from "react";
import Link from "next/link";
import { Flame, Gift, Check, ChevronRight, Calendar, Sparkles } from "lucide-react";
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

      {/* Daily box hero — full-width when available, collapses into grid when claimed */}
      {r.dailyBoxAvailable ? (
        <div className="mb-2.5">
          <button
            onClick={handleDaily}
            className="w-full rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-violet-700 text-white shadow-lg shadow-fuchsia-500/30 active:scale-[0.98] transition-all relative overflow-hidden"
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
            <div className="relative w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-lg leading-none text-white">Daily Box Ready!</p>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/80 text-sm">Tap to open your free reward box 🎁</p>
            </div>
            <div className="flex-shrink-0 bg-white/20 rounded-xl px-4 py-2">
              <p className="text-xs font-bold text-white/70 mb-0.5">TAP TO</p>
              <p className="text-sm font-extrabold text-white">OPEN</p>
            </div>
          </button>
        </div>
      ) : null}

      <div className={cn("grid gap-2.5", r.dailyBoxAvailable ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
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

        {/* Daily box — compact tile when claimed */}
        {!r.dailyBoxAvailable && (
          <button
            disabled
            className="rounded-2xl p-3 flex items-center gap-2.5 border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-left"
          >
            <Gift className="w-7 h-7 flex-shrink-0 text-gray-300" />
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight text-gray-400">Claimed</p>
              <p className="text-[11px] leading-tight text-gray-400">daily box</p>
            </div>
          </button>
        )}

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
