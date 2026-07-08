"use client";
import { useState, useEffect, useCallback } from "react";
import { rewardsStorage } from "@/lib/storage";
import { rollLootBox, getPlayerLevel } from "@/lib/rewards";
import {
  EMPTY_ENGAGEMENT, EMPTY_STORE,
  applyDailyVisit, canClaimDailyBox, todayStr,
  freshChallengeState, incrementMetric, getTodaysChallenges, challengeIsComplete,
  canClaimLogin, nextLoginReward, LOGIN_CALENDAR,
  canClaimWeekly, weekKey, WEEKLY_REWARD,
  getStoreItem,
} from "@/lib/engagement";
import type { RewardsState, RewardDrop, ChallengeMetric, DailyChallengeDef } from "@/types";

const REWARDS_EVENT = "cartzen:rewards-changed";

const INITIAL: RewardsState = {
  zenPoints: 0,
  xp: 0,
  savingsCoins: 0,
  badges: [],
  history: [],
  engagement: EMPTY_ENGAGEMENT,
  store: EMPTY_STORE,
};

export function useRewards() {
  const [state, setState] = useState<RewardsState>(INITIAL);

  const commit = useCallback((next: RewardsState) => {
    rewardsStorage.set(next);
    setState(next);
    window.dispatchEvent(new Event(REWARDS_EVENT));
  }, []);

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

  // ─── LOOT BOX ───────────────────────────────────────────────────────────────
  const rollDrop = useCallback((): RewardDrop => {
    return rollLootBox(rewardsStorage.get().badges);
  }, []);

  const applyDropTo = (current: RewardsState, drop: RewardDrop): RewardsState => {
    const next: RewardsState = {
      ...current,
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
    return next;
  };

  const claimDrop = useCallback((drop: RewardDrop) => {
    commit(applyDropTo(rewardsStorage.get(), drop));
  }, [commit]);

  // ─── STREAK / DAILY VISIT ─────────────────────────────────────────────────────
  const registerVisit = useCallback(() => {
    const current = rewardsStorage.get();
    const { next, streakChanged } = applyDailyVisit(current.engagement);
    if (!streakChanged) return;
    commit({ ...current, engagement: next });
  }, [commit]);

  // ─── DAILY BOX ────────────────────────────────────────────────────────────────
  // Returns the drop to animate; marks claimed + applies rewards.
  const claimDailyBox = useCallback((): RewardDrop | null => {
    const current = rewardsStorage.get();
    if (!canClaimDailyBox(current.engagement)) return null;
    const drop = rollLootBox(current.badges);
    const applied = applyDropTo(current, drop);
    commit({ ...applied, engagement: { ...applied.engagement, dailyBoxLastClaimed: todayStr() } });
    return drop;
  }, [commit]);

  // ─── CHALLENGES ───────────────────────────────────────────────────────────────
  const trackMetric = useCallback((metric: ChallengeMetric, by = 1) => {
    const current = rewardsStorage.get();
    const eng = incrementMetric(current.engagement, metric, by);
    commit({ ...current, engagement: eng });
  }, [commit]);

  const claimChallenge = useCallback((def: DailyChallengeDef): boolean => {
    const current = rewardsStorage.get();
    const eng = freshChallengeState(current.engagement);
    if (eng.challengeClaimed.includes(def.id)) return false;
    if (!challengeIsComplete(def, eng)) return false;
    commit({
      ...current,
      zenPoints: current.zenPoints + def.rewardCoins,
      xp: current.xp + def.rewardXp,
      engagement: { ...eng, challengeClaimed: [...eng.challengeClaimed, def.id] },
    });
    return true;
  }, [commit]);

  // ─── LOGIN / WEEKLY ─────────────────────────────────────────────────────────
  const claimLogin = useCallback((): { coins: number; xp: number; box: RewardDrop | null } | null => {
    const current = rewardsStorage.get();
    if (!canClaimLogin(current.engagement)) return null;
    const reward = nextLoginReward(current.engagement);
    let next: RewardsState = {
      ...current,
      zenPoints: current.zenPoints + reward.coins,
      xp: current.xp + reward.xp,
    };
    let box: RewardDrop | null = null;
    if (reward.isBox) {
      box = rollLootBox(current.badges);
      next = applyDropTo(next, box);
    }
    next = {
      ...next,
      engagement: {
        ...next.engagement,
        lastLoginDate: todayStr(),
        loginDayIndex: (current.engagement.loginDayIndex + 1) % LOGIN_CALENDAR.length,
      },
    };
    commit(next);
    return { coins: reward.coins, xp: reward.xp, box };
  }, [commit]);

  const claimWeekly = useCallback((): RewardDrop | null => {
    const current = rewardsStorage.get();
    if (!canClaimWeekly(current.engagement)) return null;
    const box = rollLootBox(current.badges);
    let next = applyDropTo(current, box);
    next = {
      ...next,
      zenPoints: next.zenPoints + WEEKLY_REWARD.coins,
      xp: next.xp + WEEKLY_REWARD.xp,
      engagement: { ...next.engagement, weeklyLastClaimed: weekKey() },
    };
    commit(next);
    return box;
  }, [commit]);

  // ─── SAVINGS COINS REDEMPTION ────────────────────────────────────────────────
  // Returns the Fake Basket discount (in rupees) the user chose to apply, and deducts coins.
  const redeemSavingsCoins = useCallback((coinsToSpend: number): number => {
    const current = rewardsStorage.get();
    const clamped = Math.min(coinsToSpend, current.savingsCoins);
    if (clamped <= 0) return 0;
    const discount = Math.floor(clamped / 10); // 10 coins = ₹1
    commit({ ...current, savingsCoins: current.savingsCoins - clamped });
    return discount;
  }, [commit]);

  // ─── DIRECT COIN GRANT (resistance rewards, bonuses) ────────────────────────
  const grantCoins = useCallback((zenPoints: number, savingsCoins = 0) => {
    const current = rewardsStorage.get();
    commit({
      ...current,
      zenPoints: current.zenPoints + zenPoints,
      savingsCoins: current.savingsCoins + savingsCoins,
    });
  }, [commit]);

  // ─── STORE ──────────────────────────────────────────────────────────────────
  const purchase = useCallback((itemId: string): boolean => {
    const current = rewardsStorage.get();
    const item = getStoreItem(itemId);
    if (!item) return false;
    if (current.store.owned.includes(itemId)) return false;
    if (current.zenPoints < item.price) return false;
    commit({
      ...current,
      zenPoints: current.zenPoints - item.price,
      store: {
        ...current.store,
        owned: [...current.store.owned, itemId],
        // auto-equip on purchase
        activeBoxSkin: item.kind === "boxSkin" ? itemId : current.store.activeBoxSkin,
        activeTitle: item.kind === "title" ? itemId : current.store.activeTitle,
      },
    });
    return true;
  }, [commit]);

  const equip = useCallback((itemId: string) => {
    const current = rewardsStorage.get();
    const item = getStoreItem(itemId);
    if (!item || !current.store.owned.includes(itemId)) return;
    commit({
      ...current,
      store: {
        ...current.store,
        activeBoxSkin: item.kind === "boxSkin" ? itemId : current.store.activeBoxSkin,
        activeTitle: item.kind === "title" ? itemId : current.store.activeTitle,
      },
    });
  }, [commit]);

  // ─── DERIVED ──────────────────────────────────────────────────────────────────
  const player = getPlayerLevel(state.xp);
  const challenges = getTodaysChallenges();
  const eng = state.engagement;
  const challengeStateForToday = eng.challengeDate === todayStr() ? eng : { ...eng, challengeProgress: {}, challengeClaimed: [] };

  return {
    ...state,
    coins: state.zenPoints, // spendable currency alias
    player,
    challenges,
    challengeProgress: challengeStateForToday.challengeProgress,
    challengeClaimed: challengeStateForToday.challengeClaimed,
    dailyBoxAvailable: canClaimDailyBox(eng),
    loginAvailable: canClaimLogin(eng),
    weeklyAvailable: canClaimWeekly(eng),
    nextLogin: nextLoginReward(eng),
    rollDrop,
    claimDrop,
    registerVisit,
    claimDailyBox,
    trackMetric,
    claimChallenge,
    claimLogin,
    claimWeekly,
    purchase,
    equip,
    redeemSavingsCoins,
    grantCoins,
  };
}
