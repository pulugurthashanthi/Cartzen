"use client";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/utils";
import { CartBuddy } from "@/components/ui/CartBuddy";

const stats = [
  { emoji: "💸", label: "Spent in total", value: "₹0" },
  { emoji: "🧠", label: "Impulses defeated", value: "10K+" },
  { emoji: "😌", label: "Guilt-free shoppers", value: "50K+" },
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
      <div className="absolute inset-0 zen-gradient-soft opacity-80" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-orange-300/25 to-fuchsia-300/25 blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-yellow-300/20 to-pink-300/20 blur-3xl translate-y-1/3 -translate-x-1/4" />

      {floatingEmojis.map((f, i) => (
        <span
          key={i}
          className={`absolute ${f.size} select-none pointer-events-none opacity-50 animate-float`}
          style={{ top: f.top, left: f.left, right: (f as { right?: string }).right, animationDelay: f.delay, animationDuration: `${6 + i}s` }}
        >
          {f.emoji}
        </span>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-22">
        <div className="text-center max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md shadow-orange-200/50 border border-orange-100 text-sm font-semibold text-orange-700 mb-6 animate-fade-in">
            🛒 The internet's most harmless shopping addiction
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 animate-slide-up leading-tight text-gray-900 dark:text-white">
            Add to cart. Checkout.{" "}
            <span className="zen-gradient-text">Spend ₹0.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed animate-slide-up text-balance">
            CartZen is the only shopping app where <strong>"Buy Now"</strong> secretly means <strong>"Save Now"</strong>.
            {" "}We tricked you. Lovingly. 😇
          </p>

          {/* CartBuddy mascot */}
          <div className="flex justify-center mb-8">
            <CartBuddy mood="home" size="lg" />
          </div>

          {/* Savings counter */}
          {savings > 0 && (
            <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white dark:bg-gray-900 shadow-xl shadow-orange-200/40 border border-orange-100 dark:border-orange-900/30 mb-8 animate-fade-in">
              <div className="w-12 h-12 rounded-xl zen-gradient flex items-center justify-center shadow-md shadow-orange-300/40 text-2xl">
                🏦
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Money you definitely didn't spend</p>
                <p className="font-bold text-2xl zen-gradient-text">{formatPrice(savings)}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-gray-800 shadow-md shadow-orange-100/50 p-4 text-center">
                <div className="text-3xl mb-1">{s.emoji}</div>
                <p className="font-bold text-xl text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-5">
            No credit card · No wallet · No regrets · 100% vibes ✌️
          </p>
        </div>
      </div>
    </section>
  );
}
