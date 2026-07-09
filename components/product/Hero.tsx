"use client";
import { useState } from "react";
import { useRewards } from "@/hooks/useRewards";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { BasketIllustration } from "@/components/ui/BasketIllustration";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";
import { boxSkinGradient } from "@/lib/engagement";
import { sound } from "@/lib/sound";
import { ShoppingBasket } from "lucide-react";
import type { RewardDrop } from "@/types";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Hero() {
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
        {/* Row at every breakpoint (not flex-col on mobile) so the basket
            sits beside the text instead of stacking below it and re-adding
            height. justify-center + a fixed gap, not justify-between, so the
            gap can't stretch with the viewport on wide desktops. */}
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12 max-w-3xl mx-auto">
          {/* Greeting + CTA */}
          <div className="flex-1 min-w-0 lg:max-w-md">
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
          </div>

          {/* Basket sits on a soft blurred glow instead of floating bare on
              the flat background — that glow is the "blending" into the
              panel. Bigger on desktop where there's room to make it a real
              visual anchor, not just a small sticker in a lot of empty blue. */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 m-auto w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full bg-blue-200/60 dark:bg-blue-500/10 blur-2xl" />
            <BasketIllustration className="relative w-20 h-20 sm:w-32 sm:h-32 lg:w-44 lg:h-44" />
          </div>
        </div>
      </div>
    </section>
  );
}
