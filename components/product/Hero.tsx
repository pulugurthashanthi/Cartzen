"use client";
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useRewards } from "@/hooks/useRewards";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { GiftBoxIllustration } from "@/components/ui/GiftBoxIllustration";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";
import { boxSkinGradient } from "@/lib/engagement";
import { sound } from "@/lib/sound";
import { Gift, Flame, TrendingUp } from "lucide-react";
import type { RewardDrop } from "@/types";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Hero() {
  const { savings } = useOrders();
  const r = useRewards();
  const { user } = useAuth();
  const [activeBox, setActiveBox] = useState<{ drop: RewardDrop; title: string } | null>(null);
  const skin = boxSkinGradient(r.store.activeBoxSkin);
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const handleDaily = () => {
    const drop = r.claimDailyBox();
    if (drop) {
      sound.tick();
      setActiveBox({ drop, title: "Your daily reward box!" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
      {activeBox && (
        <LootBoxModal
          drop={activeBox.drop}
          skinGradient={skin}
          title={activeBox.title}
          onClose={() => setActiveBox(null)}
        />
      )}

      <div className="relative overflow-hidden rounded-3xl bg-blue-50 dark:bg-gray-900 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Greeting + CTA */}
          <div className="flex-1 min-w-0">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-1">
              {timeGreeting()}, {firstName} 👋
            </p>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
              Spend ₹0 today,
              <br />
              Save more tomorrow.
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
              Every choice you make today builds the life you dream of.
            </p>
            <button
              onClick={handleDaily}
              disabled={!r.dailyBoxAvailable}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95",
                r.dailyBoxAvailable
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              )}
            >
              <Gift className="w-4 h-4" />
              {r.dailyBoxAvailable ? "Open Daily Box" : "Daily Box Claimed"}
            </button>
          </div>

          {/* Stats + illustration */}
          <div className="flex items-center gap-5 sm:gap-8">
            <div className="flex items-center gap-5 sm:gap-8">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Saved</p>
                <AnimatedNumber
                  value={savings}
                  format={formatPrice}
                  className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 block"
                />
                {savings > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Growing daily
                  </p>
                )}
              </div>
              <div className="h-10 w-px bg-blue-200 dark:bg-gray-700 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" /> Streak
                </p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {r.engagement.streakCurrent} Day{r.engagement.streakCurrent === 1 ? "" : "s"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Zen Coins</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">{r.coins}</p>
              </div>
            </div>
            <GiftBoxIllustration className="hidden sm:block w-20 h-20 md:w-28 md:h-28 flex-shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
