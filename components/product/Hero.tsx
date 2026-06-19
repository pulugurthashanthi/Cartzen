"use client";
import { Sparkles, ShoppingBag, Heart, Zap } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/utils";

const stats = [
  { emoji: "💰", label: "Avg. saved per session", value: "₹8,400" },
  { emoji: "🎉", label: "Impulses overcome", value: "10K+" },
  { emoji: "🛍️", label: "Mindful shoppers", value: "50K+" },
];

const floatingEmojis = [
  { emoji: "🛒", top: "12%", left: "6%", delay: "0s", size: "text-3xl" },
  { emoji: "✨", top: "20%", right: "8%", delay: "1.5s", size: "text-2xl" },
  { emoji: "🎁", top: "65%", left: "4%", delay: "3s", size: "text-2xl" },
  { emoji: "💎", top: "70%", right: "6%", delay: "0.8s", size: "text-3xl" },
  { emoji: "🌟", top: "40%", left: "2%", delay: "2s", size: "text-xl" },
  { emoji: "🎀", top: "35%", right: "3%", delay: "1s", size: "text-xl" },
];

export function Hero() {
  const { savings } = useOrders();

  return (
    <section className="relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 zen-gradient-soft opacity-80" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-orange-300/25 to-fuchsia-300/25 blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-yellow-300/20 to-pink-300/20 blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-orange-200/15 to-fuchsia-200/15 blur-3xl" />

      {/* Floating emoji decorations */}
      {floatingEmojis.map((f, i) => (
        <span
          key={i}
          className={`absolute ${f.size} select-none pointer-events-none opacity-60 animate-float`}
          style={{
            top: f.top,
            left: f.left,
            right: (f as { right?: string }).right,
            animationDelay: f.delay,
            animationDuration: `${6 + i}s`,
          }}
        >
          {f.emoji}
        </span>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md shadow-orange-200/50 border border-orange-100 text-sm font-semibold text-orange-700 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-fuchsia-500" />
            The happiest way to NOT spend money
            <Sparkles className="w-4 h-4 text-orange-500" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 animate-slide-up leading-tight text-gray-900 dark:text-white">
            Shop the thrill,{" "}
            <span className="zen-gradient-text">keep the cash</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed animate-slide-up text-balance">
            Get the full joy of browsing, adding to cart, and "buying" —
            without spending a single rupee. CartZen is your guilt-free shopping playground. 🎊
          </p>

          {/* Savings counter */}
          {savings > 0 && (
            <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white dark:bg-gray-900 shadow-xl shadow-orange-200/40 dark:shadow-orange-900/20 border border-orange-100 dark:border-orange-900/30 mb-8 animate-fade-in">
              <div className="w-12 h-12 rounded-xl zen-gradient flex items-center justify-center shadow-md shadow-orange-300/40 text-2xl">
                🏦
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your lifetime savings</p>
                <p className="font-bold text-2xl zen-gradient-text">{formatPrice(savings)}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-gray-800 shadow-md shadow-orange-100/50 dark:shadow-none p-4 text-center animate-fade-in hover:shadow-lg hover:shadow-orange-200/50 transition-shadow"
              >
                <div className="text-3xl mb-1">{s.emoji}</div>
                <p className="font-bold text-xl text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sub-tagline */}
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
            100% free · No credit card · Zero regrets
          </p>
        </div>
      </div>
    </section>
  );
}
