"use client";
import Link from "next/link";
import { Gift, Sparkles, History } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { BADGES, RARITIES, getBadge } from "@/lib/rewards";
import { XPBar } from "@/components/rewards/XPBar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function RewardsPage() {
  const { zenPoints, xp, savingsCoins, badges, history, player } = useRewards();

  const ownedSet = new Set(badges);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Rewards</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Earn loot boxes every time you complete a mindful checkout.
        </p>
      </div>

      {/* Player level + XP */}
      <div className="card p-5 mb-5">
        <XPBar
          level={player.level}
          xp={xp}
          curLevelXp={player.curLevelXp}
          nextLevelXp={player.nextLevelXp}
          pct={player.pct}
        />
      </div>

      {/* Currencies */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">🧘</div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{zenPoints}</p>
          <p className="text-xs text-gray-400">Zen Points</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">🪙</div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{savingsCoins}</p>
          <p className="text-xs text-gray-400">Savings Coins</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">🏅</div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{badges.length}/{BADGES.length}</p>
          <p className="text-xs text-gray-400">Badges</p>
        </div>
      </div>

      {/* Badge collection */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-fuchsia-500" />
          <h2 className="font-semibold">Badge Collection</h2>
          <span className="ml-auto text-xs text-gray-400">{badges.length} collected</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const owned = ownedSet.has(b.id);
            const r = RARITIES[b.rarity];
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-2xl p-3 text-center border-2 transition-all",
                  owned
                    ? cn("bg-gradient-to-br", r.gradient, "border-transparent text-white shadow-md", r.glow)
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60"
                )}
                title={owned ? b.description : "Locked — open loot boxes to find it"}
              >
                <div className={cn("text-3xl mb-1", !owned && "grayscale opacity-40")}>{b.emoji}</div>
                <p className={cn("text-[11px] font-bold leading-tight", owned ? "text-white" : "text-gray-400")}>
                  {owned ? b.name : "???"}
                </p>
                <p className={cn("text-[9px] mt-0.5 uppercase tracking-wide font-semibold", owned ? "text-white/70" : "text-gray-300 dark:text-gray-600")}>
                  {b.rarity}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reward history */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold">Reward History</h2>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-sm text-gray-500 mb-1">No loot boxes opened yet</p>
            <p className="text-xs text-gray-400 mb-5">Complete a checkout to earn your first box!</p>
            <Link href="/" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 20).map((drop) => {
              const r = RARITIES[drop.rarity];
              return (
                <div key={drop.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <span className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-br flex-shrink-0", r.gradient)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span className={cn("font-bold", r.text)}>{r.label}</span> box
                    </p>
                    <p className="text-xs text-gray-400">
                      {drop.rewards.map((rw) => `${rw.emoji} ${rw.kind === "badge" ? getBadge(rw.badgeId ?? "")?.name ?? "Badge" : rw.label}`).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(drop.openedAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
