"use client";
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useRewards } from "@/hooks/useRewards";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, cn } from "@/lib/utils";
import { BasketIllustration } from "@/components/ui/BasketIllustration";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";
import { boxSkinGradient } from "@/lib/engagement";
import { sound } from "@/lib/sound";
import { ShoppingBasket, Flame, Star, Coins } from "lucide-react";
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

      <div className="relative overflow-hidden rounded-3xl bg-blue-50 dark:bg-gray-900 p-5 sm:p-6 md:p-8">
        {/* justify-center + an explicit gap (not justify-between) — with
            between, any slack in the max-w wrapper became dead space in the
            middle regardless of the gap value, which is what stretched the
            text-to-illustration gap out on wide desktops. */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-5 lg:gap-12 max-w-3xl mx-auto">
          {/* Greeting + CTA */}
          <div className="min-w-0 lg:max-w-md">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-1">
              {timeGreeting()}, {firstName} 👋
            </p>
            <h1 className="font-display text-2xl md:text-4xl font-bold leading-tight mb-2">
              <span className="text-blue-600 dark:text-blue-400">Fake Basket</span>
              <br />
              <span className="text-gray-900 dark:text-white">Feel the shopping</span>
              <br />
              <span className="text-gray-900 dark:text-white">Pay nothing</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
              Shop, collect joy and save mindfully.
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
              <ShoppingBasket className="w-4 h-4" />
              {r.dailyBoxAvailable ? "Open Daily Box" : "Daily Box Claimed"}
            </button>

            {/* Compact stats strip — secondary info, kept out of the way of
                the headline/CTA and out of the illustration's alignment. */}
            <div className="flex items-center gap-2 flex-wrap mt-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/70 text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {formatPrice(savings)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/70 text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                {r.engagement.streakCurrent} Day{r.engagement.streakCurrent === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/70 text-xs font-semibold text-gray-700 dark:text-gray-200">
                <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                {r.xp} XP
              </span>
            </div>
          </div>

          {/* Illustration — decorative, so it's the first thing dropped on
              smaller screens to get search/products above the fold sooner. */}
          <BasketIllustration className="hidden lg:block w-32 h-32 flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}
