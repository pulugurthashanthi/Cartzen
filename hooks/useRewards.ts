"use client";
import { useState, useEffect, useCallback } from "react";
import { rewardsStorage } from "@/lib/storage";
import { rollLootBox, getPlayerLevel } from "@/lib/rewards";
import type { RewardsState, RewardDrop } from "@/types";

const REWARDS_EVENT = "cartzen:rewards-changed";

export function useRewards() {
  const [state, setState] = useState<RewardsState>({
    zenPoints: 0,
    xp: 0,
    savingsCoins: 0,
    badges: [],
    history: [],
  });

  useEffect(() => {
    setState(rewardsStorage.get());
    const sync = () => setState(rewardsStorage.get());
    window.addEventListener(REWARDS_EVENT, sync);
    window.addEventListener("cartzen:synced", sync);
    return () => {
      window.removeEventListener(REWARDS_EVENT, sync);
      window.removeEventListener("cartzen:synced", sync);
    };
  }, []);

  // Roll a new loot box without applying it yet (so the UI can animate reveal first).
  const rollDrop = useCallback((): RewardDrop => {
    const current = rewardsStorage.get();
    return rollLootBox(current.badges);
  }, []);

  // Apply a drop's rewards to the persistent state.
  const claimDrop = useCallback((drop: RewardDrop) => {
    const current = rewardsStorage.get();
    const next: RewardsState = {
      zenPoints: current.zenPoints,
      xp: current.xp,
      savingsCoins: current.savingsCoins,
      badges: [...current.badges],
      history: [drop, ...current.history].slice(0, 100),
    };
    for (const r of drop.rewards) {
      if (r.kind === "zen") next.zenPoints += r.amount ?? 0;
      else if (r.kind === "xp") next.xp += r.amount ?? 0;
      else if (r.kind === "coins") next.savingsCoins += r.amount ?? 0;
      else if (r.kind === "badge" && r.badgeId && !next.badges.includes(r.badgeId)) {
        next.badges.push(r.badgeId);
      }
    }
    rewardsStorage.set(next);
    setState(next);
    window.dispatchEvent(new Event(REWARDS_EVENT));
  }, []);

  const player = getPlayerLevel(state.xp);

  return { ...state, player, rollDrop, claimDrop };
}
