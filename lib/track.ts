import { rewardsStorage } from "@/lib/storage";
import { incrementMetric } from "@/lib/engagement";
import type { ChallengeMetric } from "@/types";

// Records progress toward daily challenges from anywhere (hooks, components)
// without needing the useRewards hook. Persists + notifies listeners.
export function trackChallenge(metric: ChallengeMetric, by = 1) {
  if (typeof window === "undefined") return;
  const current = rewardsStorage.get();
  const eng = incrementMetric(current.engagement, metric, by);
  rewardsStorage.set({ ...current, engagement: eng });
  window.dispatchEvent(new Event("cartzen:rewards-changed"));
}
