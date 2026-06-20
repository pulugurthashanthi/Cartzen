"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Gift, X } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { RARITIES, getBadge } from "@/lib/rewards";
import { sound } from "@/lib/sound";
import { haptics } from "@/lib/haptics";
import { trackChallenge } from "@/lib/track";
import { Confetti } from "@/components/ui/Confetti";
import { cn } from "@/lib/utils";
import type { RewardDrop } from "@/types";

type Phase = "sealed" | "opening" | "revealed";

interface Props {
  onClose: () => void;
  // If provided, the box reveals this pre-rolled drop and does NOT claim it
  // (caller already applied rewards). Otherwise the box rolls + claims itself.
  drop?: RewardDrop;
  // Optional gradient (Tailwind classes) for the sealed/opening box skin.
  skinGradient?: string;
  title?: string;
}

// Pre-computed particle vectors for the burst effect.
function useParticles(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 160;
      return {
        dx: `${Math.cos(angle) * dist}px`,
        dy: `${Math.sin(angle) * dist}px`,
        bd: `${0.7 + Math.random() * 0.6}s`,
        size: 4 + Math.random() * 8,
        left: 50 + (Math.random() * 10 - 5),
        top: 50 + (Math.random() * 10 - 5),
        hue: Math.floor(Math.random() * 360),
      };
    });
  }, [count]);
}

export function LootBoxModal({ onClose, drop: providedDrop, skinGradient, title }: Props) {
  const { rollDrop, claimDrop } = useRewards();
  const [phase, setPhase] = useState<Phase>("sealed");
  const [drop, setDrop] = useState<RewardDrop | null>(providedDrop ?? null);
  const particles = useParticles(28);
  const boxGradient = skinGradient || "zen-gradient";
  const skinClass = skinGradient ? `bg-gradient-to-br ${skinGradient}` : "zen-gradient";

  const rarityCfg = drop ? RARITIES[drop.rarity] : RARITIES.common;
  const isBigWin = drop?.rarity === "epic" || drop?.rarity === "legendary";

  const handleOpen = useCallback(() => {
    if (phase !== "sealed") return;
    // Reveal-only mode: caller pre-rolled and already applied the drop.
    const rolled = providedDrop ?? rollDrop();
    setDrop(rolled);
    setPhase("opening");
    sound.open();
    haptics.medium();
    trackChallenge("open_box");

    setTimeout(() => {
      setPhase("revealed");
      sound.reveal(rolled.rarity);
      haptics.byRarity(rolled.rarity);
      if (!providedDrop) claimDrop(rolled);
    }, 1200);
  }, [phase, rollDrop, claimDrop, providedDrop]);
  void boxGradient;

  // Esc to close once revealed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "revealed") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-700",
          phase === "revealed" && isBigWin
            ? "bg-black/80"
            : "bg-black/70"
        )}
      />

      {/* Legendary radial rays */}
      {phase === "revealed" && drop?.rarity === "legendary" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="legendary-rays w-[200vmax] h-[200vmax] opacity-30"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(251,191,36,0.5) 0deg 8deg, transparent 8deg 20deg)",
            }}
          />
        </div>
      )}

      {/* Rarity edge-glow vignette (epic/legendary) */}
      {phase === "revealed" && isBigWin && (
        <div
          className="absolute inset-0 pointer-events-none glow-pulse"
          style={{
            boxShadow: `inset 0 0 140px 40px ${drop?.rarity === "legendary" ? "rgba(251,191,36,0.45)" : "rgba(217,70,239,0.4)"}`,
          }}
        />
      )}

      {/* Confetti for epic/legendary */}
      <Confetti active={phase === "revealed" && isBigWin} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* ─── SEALED ─── */}
        {phase === "sealed" && (
          <div className="text-center">
            <p className="text-white/70 text-sm font-medium mb-2 animate-fade-in">
              {title ?? "You earned a mystery reward!"}
            </p>
            <h2 className="text-white font-display text-2xl font-bold mb-8 animate-fade-in">
              Tap to open your loot box 🎁
            </h2>
            <button
              onClick={handleOpen}
              onMouseEnter={() => sound.tick()}
              className="relative mx-auto block group"
              aria-label="Open loot box"
            >
              {/* Glow */}
              <div className={cn("absolute inset-0 rounded-3xl blur-2xl glow-pulse", skinClass)} />
              {/* Box */}
              <div className={cn("relative loot-float w-40 h-40 mx-auto rounded-3xl flex items-center justify-center shadow-2xl group-active:scale-95 transition-transform", skinClass)}>
                <Gift className="w-20 h-20 text-white drop-shadow-lg" />
              </div>
            </button>
            <p className="text-white/50 text-xs mt-8 animate-pulse">👆 tap the box</p>
          </div>
        )}

        {/* ─── OPENING ─── */}
        {phase === "opening" && (
          <div className="text-center relative h-72 flex items-center justify-center">
            {/* Building glow */}
            <div
              className={cn(
                "absolute w-48 h-48 rounded-full blur-3xl glow-pulse bg-gradient-to-br",
                rarityCfg.gradient
              )}
            />
            {/* Expanding ring */}
            <div
              className={cn(
                "absolute w-40 h-40 rounded-full border-4 ring-expand",
                rarityCfg.ring
              )}
            />
            {/* Particles */}
            {particles.map((p, i) => (
              <span
                key={i}
                className="burst-particle absolute rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: p.size,
                  height: p.size,
                  background: `hsl(${p.hue}, 90%, 60%)`,
                  ["--dx" as string]: p.dx,
                  ["--dy" as string]: p.dy,
                  ["--bd" as string]: p.bd,
                }}
              />
            ))}
            {/* Shaking box */}
            <div className={cn("relative loot-shake w-36 h-36 rounded-3xl flex items-center justify-center shadow-2xl", skinClass)}>
              <Gift className="w-16 h-16 text-white" />
            </div>
          </div>
        )}

        {/* ─── REVEALED ─── */}
        {phase === "revealed" && drop && (
          <div className="text-center">
            {/* Rarity banner */}
            <div className="rarity-zoom mb-6">
              <span
                className={cn(
                  "inline-block text-3xl font-display font-extrabold uppercase tracking-wider bg-gradient-to-r bg-clip-text text-transparent drop-shadow",
                  rarityCfg.gradient
                )}
              >
                {rarityCfg.label}!
              </span>
              {drop.rarity === "legendary" && (
                <p className="text-amber-300 text-sm font-bold mt-1 animate-pulse">
                  ✨ JACKPOT — 3% drop ✨
                </p>
              )}
            </div>

            {/* Rewards card */}
            <div
              className={cn(
                "rounded-3xl p-6 bg-white dark:bg-gray-900 shadow-2xl border-2 ring-2",
                rarityCfg.ring,
                isBigWin && rarityCfg.glow,
                isBigWin && "shadow-2xl"
              )}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-4 font-semibold">
                Your rewards
              </p>
              <div className="space-y-2.5">
                {drop.rewards.map((r, i) => {
                  const badge = r.kind === "badge" && r.badgeId ? getBadge(r.badgeId) : null;
                  return (
                    <div
                      key={i}
                      className="reward-pop flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-fuchsia-50 dark:from-orange-950/30 dark:to-fuchsia-950/30"
                      style={{ animationDelay: `${0.15 + i * 0.15}s` }}
                    >
                      <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {r.kind === "badge" ? "New Badge!" : r.label}
                        </p>
                        {r.kind === "badge" && badge && (
                          <p className="text-xs text-gray-500">{badge.name} — {badge.description}</p>
                        )}
                        {r.kind === "coins" && r.amount != null && r.amount >= 10 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                            = ₹{Math.floor(r.amount / 10)} off at next checkout
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary w-full mt-6 reward-pop"
              style={{ animationDelay: `${0.2 + drop.rewards.length * 0.15}s` }}
            >
              Awesome! Collect 🎉
            </button>
          </div>
        )}
      </div>

      {/* Close (X) only available after reveal */}
      {phase === "revealed" && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
