"use client";
import { useEffect, useState, useCallback } from "react";
import { rewardsStorage, savingsStorage } from "@/lib/storage";
import { getPlayerLevel } from "@/lib/rewards";
import { getCurrentLevel, MILESTONES, formatPrice } from "@/lib/utils";
import { Confetti } from "@/components/ui/Confetti";
import { sound } from "@/lib/sound";
import { haptics } from "@/lib/haptics";

interface Celebration {
  kind: "level" | "milestone";
  emoji: string;
  title: string;
  sub: string;
  gradient: string;
}

const SEEN_LEVEL = "cartzen_seen_player_level";
const SEEN_MILE = "cartzen_seen_milestone";

function getNum(key: string): number | null {
  if (typeof window === "undefined") return null;
  try { const v = localStorage.getItem(key); return v == null ? null : Number(v); } catch { return null; }
}
function setNum(key: string, n: number) {
  try { localStorage.setItem(key, String(n)); } catch { /* ignore */ }
}

export function CelebrationManager() {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const active = queue[0] ?? null;

  const detect = useCallback(() => {
    const rewards = rewardsStorage.get();
    const savings = savingsStorage.get();
    const level = getPlayerLevel(rewards.xp).level;
    const newCelebrations: Celebration[] = [];

    // Player level-up
    const seenLevel = getNum(SEEN_LEVEL);
    if (seenLevel == null) {
      setNum(SEEN_LEVEL, level); // initialize without celebrating
    } else if (level > seenLevel) {
      newCelebrations.push({
        kind: "level",
        emoji: "⚡",
        title: `Level ${level}!`,
        sub: "You leveled up. New rewards await.",
        gradient: "from-amber-400 to-orange-500",
      });
      setNum(SEEN_LEVEL, level);
    }

    // Savings milestone
    const seenMile = getNum(SEEN_MILE) ?? 0;
    const crossed = MILESTONES.filter((m) => m.amount > seenMile && savings >= m.amount);
    if (seenMile === 0 && getNum(SEEN_MILE) == null) {
      // initialize to highest already-passed milestone without celebrating retroactively
      const passed = MILESTONES.filter((m) => savings >= m.amount).map((m) => m.amount);
      setNum(SEEN_MILE, passed.length ? Math.max(...passed) : 0);
    } else if (crossed.length > 0) {
      const top = crossed[crossed.length - 1];
      const fin = getCurrentLevel(savings);
      newCelebrations.push({
        kind: "milestone",
        emoji: "🏆",
        title: `${formatPrice(top.amount)} saved!`,
        sub: `${fin.emoji} You're a ${fin.name}. ${top.label.split("!")[1]?.trim() ?? "Keep going!"}`,
        gradient: "from-zen-500 to-calm-500",
      });
      setNum(SEEN_MILE, top.amount);
    }

    if (newCelebrations.length) setQueue((q) => [...q, ...newCelebrations]);
  }, []);

  useEffect(() => {
    const t = setTimeout(detect, 1800); // after initial sync/merge
    const onChange = () => detect();
    window.addEventListener("cartzen:rewards-changed", onChange);
    window.addEventListener("cartzen:savings-changed", onChange);
    window.addEventListener("cartzen:synced", onChange);
    return () => {
      clearTimeout(t);
      window.removeEventListener("cartzen:rewards-changed", onChange);
      window.removeEventListener("cartzen:savings-changed", onChange);
      window.removeEventListener("cartzen:synced", onChange);
    };
  }, [detect]);

  useEffect(() => {
    if (active) {
      sound.reveal(active.kind === "level" ? "epic" : "legendary");
      haptics.heavy();
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => setQueue((q) => q.slice(1))} />
      <Confetti active />
      <div className="relative z-10 text-center rarity-zoom">
        <div className={`mx-auto w-28 h-28 rounded-full bg-gradient-to-br ${active.gradient} flex items-center justify-center text-6xl shadow-2xl mb-6 loot-float`}>
          {active.emoji}
        </div>
        <h2 className="font-display text-3xl font-extrabold text-white mb-2">{active.title}</h2>
        <p className="text-white/80 text-sm max-w-xs mx-auto mb-8">{active.sub}</p>
        <button onClick={() => setQueue((q) => q.slice(1))} className="btn-primary mx-auto">
          Let&apos;s go! 🎉
        </button>
      </div>
    </div>
  );
}
