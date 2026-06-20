"use client";
import { useEffect, useRef } from "react";
import { rewardsStorage } from "@/lib/storage";
import { getTodaysChallenges, freshChallengeState } from "@/lib/engagement";
import { showToast } from "@/components/ui/Toast";

export function ChallengeWatcher() {
  const prevProgressRef = useRef<Record<string, number>>({});
  const prevClaimedRef = useRef<string[]>([]);

  useEffect(() => {
    // Initialize refs without firing toasts on first load.
    const init = rewardsStorage.get();
    const eng = freshChallengeState(init.engagement);
    prevProgressRef.current = { ...eng.challengeProgress };
    prevClaimedRef.current = [...eng.challengeClaimed];

    const check = () => {
      const state = rewardsStorage.get();
      const eng = freshChallengeState(state.engagement);
      const challenges = getTodaysChallenges();

      for (const c of challenges) {
        const prev = prevProgressRef.current[c.metric] ?? 0;
        const curr = eng.challengeProgress[c.metric] ?? 0;
        const alreadyClaimed = prevClaimedRef.current.includes(c.id);

        // Crossed threshold for the first time and not yet claimed
        if (!alreadyClaimed && prev < c.goal && curr >= c.goal) {
          showToast(
            `${c.emoji} Challenge complete! "${c.label}" — go claim 🪙${c.rewardCoins}`,
            "success"
          );
        }
      }

      prevProgressRef.current = { ...eng.challengeProgress };
      prevClaimedRef.current = [...eng.challengeClaimed];
    };

    window.addEventListener("cartzen:rewards-changed", check);
    return () => window.removeEventListener("cartzen:rewards-changed", check);
  }, []);

  return null;
}
