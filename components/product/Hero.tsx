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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 md:pt-4">
      {activeBox && (
        <LootBoxModal
          drop={activeBox.drop}
          skinGradient={skin}
          title={activeBox.title}
          onClose={() => setActiveBox(null)}
        />
      )}

      {/* Compact banner: introduces the app, doesn't dominate the page.
          Height budget ≈ 160–190px mobile / 180–220px tablet / 220–260px
          desktop, so search + categories + first products land on the
          first screen of every device. */}
      <div className="relative overflow-hidden rounded-3xl bg-blue-50 dark:bg-gray-900 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-8 lg:gap-14 max-w-3xl mx-auto">
          {/* Greeting + CTA */}
          <div className="flex-1 min-w-0 lg:max-w-md py-1">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm mb-0.5">
              {timeGreeting()}, {firstName} 👋
            </p>
            {/* leading-tight must sit on each span: the font-size utilities
                carry their own line-height, which beats an inherited one. */}
            <h1 className="font-display font-bold mb-1.5 sm:mb-2">
              <span className="block text-blue-600 dark:text-blue-400 text-base sm:text-xl lg:text-2xl leading-tight">Fake Basket</span>
              <span className="block text-gray-900 dark:text-white text-lg sm:text-2xl lg:text-3xl leading-tight whitespace-nowrap">Feel the shopping</span>
              <span className="block text-gray-900 dark:text-white text-lg sm:text-2xl lg:text-3xl leading-tight">Pay nothing</span>
            </h1>
            {/* Sub-copy is a nice-to-have — desktop only; on phones and
                tablets vertical space is the scarcest resource. */}
            <p className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 mb-3 max-w-sm">
              Shop, collect joy and save mindfully.
            </p>
            <button
              onClick={handleDaily}
              disabled={!r.dailyBoxAvailable}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-xs sm:text-sm transition-all active:scale-95 mt-1 sm:mt-0",
                r.dailyBoxAvailable
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              )}
            >
              <ShoppingBasket className="w-4 h-4" />
              {r.dailyBoxAvailable ? "Open Daily Box" : "Daily Box Claimed"}
            </button>
          </div>

          {/* Basket of finds — scales with the breakpoint, sits flush in the
              panel (flat ground blob is drawn inside the SVG itself). */}
          <BasketIllustration className="w-28 min-[420px]:w-32 sm:w-52 lg:w-64 h-auto flex-shrink-0 -my-1" />
        </div>
      </div>
    </section>
  );
}
