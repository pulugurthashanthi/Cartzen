"use client";
import { useState } from "react";
import Link from "next/link";
import { Gift, Sparkles, History, Flame, Check, ShoppingBag, Trophy } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { BADGES, RARITIES, getBadge } from "@/lib/rewards";
import { LOGIN_CALENDAR, boxSkinGradient, getStoreItem, WEEKLY_REWARD } from "@/lib/engagement";
import { XPBar } from "@/components/rewards/XPBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { RewardDrop } from "@/types";

export default function RewardsPage() {
  const r = useRewards();
  const { zenPoints, xp, savingsCoins, badges, history, player, engagement, store } = r;
  const [box, setBox] = useState<{ drop: RewardDrop; title: string } | null>(null);
  const ownedSet = new Set(badges);
  const skin = boxSkinGradient(store.activeBoxSkin);
  const activeTitle = store.activeTitle ? getStoreItem(store.activeTitle) : null;

  const openDaily = () => {
    const drop = r.claimDailyBox();
    if (drop) { sound.tick(); setBox({ drop, title: "Daily reward box!" }); }
  };
  const openWeekly = () => {
    const drop = r.claimWeekly();
    if (drop) { sound.tick(); setBox({ drop, title: "Weekly mega box! 🎉" }); }
  };
  const openLogin = () => {
    const res = r.claimLogin();
    if (res?.box) setBox({ drop: res.box, title: "7-day bonus box!" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {box && <LootBoxModal drop={box.drop} skinGradient={skin} title={box.title} onClose={() => setBox(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Rewards</h1>
            {activeTitle && (
              <p className="text-xs font-semibold zen-gradient-text">{activeTitle.emoji} {activeTitle.name}</p>
            )}
          </div>
        </div>
        <Link href="/store" className="btn-secondary text-sm py-2">
          <ShoppingBag className="w-4 h-4" /> Store
        </Link>
      </div>

      {/* Streak banner */}
      <div className={cn(
        "rounded-2xl p-5 mb-5 flex items-center gap-4",
        engagement.streakCurrent > 0
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          : "card"
      )}>
        <Flame className={cn("w-12 h-12 flex-shrink-0", engagement.streakCurrent > 0 ? "text-white fill-white/40" : "text-gray-300")} />
        <div className="flex-1">
          <p className={cn("text-3xl font-bold leading-none", engagement.streakCurrent > 0 ? "text-white" : "text-gray-900 dark:text-gray-100")}>
            {engagement.streakCurrent} day{engagement.streakCurrent !== 1 ? "s" : ""}
          </p>
          <p className={cn("text-sm mt-1", engagement.streakCurrent > 0 ? "text-white/80" : "text-gray-500")}>
            Mindful Streak · best: {engagement.streakLongest}
          </p>
        </div>
        <p className={cn("text-xs text-right max-w-[40%]", engagement.streakCurrent > 0 ? "text-white/70" : "text-gray-400")}>
          Open Fake Basket daily to keep the flame alive 🔥
        </p>
      </div>

      {/* Claim buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={openDaily}
          disabled={!r.dailyBoxAvailable}
          className={cn("rounded-2xl p-4 text-center border-2 transition-all active:scale-95",
            r.dailyBoxAvailable ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30" : "border-gray-100 dark:border-gray-800 opacity-60")}
        >
          <Gift className={cn("w-6 h-6 mx-auto mb-1", r.dailyBoxAvailable ? "text-indigo-500" : "text-gray-300")} />
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Daily Box</p>
          <p className="text-[10px] text-gray-400">{r.dailyBoxAvailable ? "Ready!" : "Tomorrow"}</p>
        </button>
        <button
          onClick={openLogin}
          disabled={!r.loginAvailable}
          className={cn("rounded-2xl p-4 text-center border-2 transition-all active:scale-95",
            r.loginAvailable ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : "border-gray-100 dark:border-gray-800 opacity-60")}
        >
          <Sparkles className={cn("w-6 h-6 mx-auto mb-1", r.loginAvailable ? "text-amber-500" : "text-gray-300")} />
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Login Bonus</p>
          <p className="text-[10px] text-gray-400">{r.loginAvailable ? `+${r.nextLogin.coins || "Box"}` : "Claimed"}</p>
        </button>
        <button
          onClick={openWeekly}
          disabled={!r.weeklyAvailable}
          className={cn("rounded-2xl p-4 text-center border-2 transition-all active:scale-95",
            r.weeklyAvailable ? "border-purple-300 bg-purple-50 dark:bg-purple-950/30" : "border-gray-100 dark:border-gray-800 opacity-60")}
        >
          <Trophy className={cn("w-6 h-6 mx-auto mb-1", r.weeklyAvailable ? "text-purple-500" : "text-gray-300")} />
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Weekly Mega</p>
          <p className="text-[10px] text-gray-400">{r.weeklyAvailable ? `+${WEEKLY_REWARD.coins}` : "Claimed"}</p>
        </button>
      </div>

      {/* Login calendar */}
      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">7-Day Login Calendar</p>
        <div className="flex gap-1.5 justify-between">
          {LOGIN_CALENDAR.map((d, i) => {
            const reached = i < (engagement.loginDayIndex % 7);
            const isNext = i === (engagement.loginDayIndex % 7);
            return (
              <div key={d.day} className={cn(
                "flex-1 rounded-xl p-2 text-center border",
                reached ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" :
                isNext ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-1 ring-amber-300" :
                "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
              )}>
                <p className="text-[9px] text-gray-400">D{d.day}</p>
                <p className="text-base">{d.isBox ? "🎁" : "🪙"}</p>
                {reached && <Check className="w-3 h-3 text-green-500 mx-auto" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Player level + XP */}
      <div className="card p-5 mb-5">
        <XPBar level={player.level} xp={xp} curLevelXp={player.curLevelXp} nextLevelXp={player.nextLevelXp} pct={player.pct} />
      </div>

      {/* Daily challenges */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎯</span>
          <h2 className="font-semibold">Daily Challenges</h2>
          <span className="ml-auto text-xs text-gray-400">resets at midnight</span>
        </div>
        <div className="space-y-3">
          {r.challenges.map((c) => {
            const prog = Math.min(r.challengeProgress[c.metric] ?? 0, c.goal);
            const complete = prog >= c.goal;
            const claimed = r.challengeClaimed.includes(c.id);
            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.label}</p>
                    <p className="text-xs text-gray-400">🪙{c.rewardCoins} · {c.rewardXp}xp</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full zen-gradient rounded-full transition-all duration-500" style={{ width: `${(prog / c.goal) * 100}%` }} />
                  </div>
                </div>
                {claimed ? (
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5"><Check className="w-3.5 h-3.5" /></span>
                ) : complete ? (
                  <button onClick={() => { r.claimChallenge(c); sound.reveal("common"); }} className="btn-primary text-xs py-1.5 px-3">
                    Claim
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">{prog}/{c.goal}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Currencies */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/store" className="card p-4 text-center hover:border-zen-300 transition-colors">
          <div className="text-2xl mb-1">🪙</div>
          <AnimatedNumber value={zenPoints} className="text-xl font-bold text-gray-900 dark:text-gray-100 block" />
          <p className="text-xs text-gray-400">Zen Coins</p>
        </Link>
        <Link href="/checkout" className="card p-4 text-center hover:border-amber-300 transition-colors">
          <div className="text-2xl mb-1">💰</div>
          <AnimatedNumber value={savingsCoins} className="text-xl font-bold text-gray-900 dark:text-gray-100 block" />
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Savings Coins</p>
          {savingsCoins >= 10 && (
            <p className="text-[10px] text-gray-400 mt-0.5">= ₹{Math.floor(savingsCoins / 10)} off at checkout</p>
          )}
        </Link>
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">🏅</div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{badges.length}/{BADGES.length}</p>
          <p className="text-xs text-gray-400">Badges</p>
        </div>
      </div>

      {/* Savings Coins explanation — only shown when user has coins */}
      {savingsCoins > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <span className="text-2xl flex-shrink-0">💰</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-0.5">
              You have {savingsCoins} Savings Coins — worth ₹{Math.floor(savingsCoins / 10)} at checkout
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              10 coins = ₹1 bonus savings. Earned from loot boxes. Applied at your next checkout to boost your total savings score.
            </p>
            <Link href="/cart" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline">
              Use at checkout →
            </Link>
          </div>
        </div>
      )}

      {/* Badge collection */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h2 className="font-semibold">Badge Collection</h2>
          <span className="ml-auto text-xs text-gray-400">{badges.length}/{BADGES.length} collected</span>
        </div>
        {/* Per-rarity progress */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(["common", "rare", "epic", "legendary"] as const).map((rar) => {
            const pool = BADGES.filter((b) => b.rarity === rar);
            const owned = pool.filter((b) => ownedSet.has(b.id)).length;
            const rr = RARITIES[rar];
            return (
              <div key={rar} className="text-center">
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-1">
                  <div className={cn("h-full rounded-full bg-gradient-to-r", rr.gradient)} style={{ width: `${pool.length ? (owned / pool.length) * 100 : 0}%` }} />
                </div>
                <p className={cn("text-[10px] font-semibold capitalize", rr.text)}>{rar}</p>
                <p className="text-[10px] text-gray-400">{owned}/{pool.length}</p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const owned = ownedSet.has(b.id);
            const rr = RARITIES[b.rarity];
            return (
              <div
                key={b.id}
                className={cn("rounded-2xl p-3 text-center border-2 transition-all",
                  owned ? cn("bg-gradient-to-br", rr.gradient, "border-transparent text-white shadow-md", rr.glow)
                        : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60")}
                title={owned ? b.description : "Locked — open loot boxes to find it"}
              >
                <div className={cn("text-3xl mb-1", !owned && "grayscale opacity-40")}>{b.emoji}</div>
                <p className={cn("text-[11px] font-bold leading-tight", owned ? "text-white" : "text-gray-400")}>{owned ? b.name : "???"}</p>
                <p className={cn("text-[9px] mt-0.5 uppercase tracking-wide font-semibold", owned ? "text-white/70" : "text-gray-300 dark:text-gray-600")}>{b.rarity}</p>
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
          {history.length > 0 && (
            <span className="ml-auto text-xs text-gray-400">
              {history.length} box{history.length !== 1 ? "es" : ""} · {history.filter((d) => d.rarity === "legendary").length} legendary
            </span>
          )}
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-sm text-gray-500 mb-1">No loot boxes opened yet</p>
            <p className="text-xs text-gray-400 mb-5">Open your daily box or complete a checkout!</p>
            <Link href="/" className="btn-primary">Start</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 20).map((drop) => {
              const rr = RARITIES[drop.rarity];
              return (
                <div key={drop.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <span className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-br flex-shrink-0", rr.gradient)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span className={cn("font-bold", rr.text)}>{rr.label}</span> box
                    </p>
                    <p className="text-xs text-gray-400 truncate">
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
