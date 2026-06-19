"use client";
import { Leaf, TrendingDown, Heart, Sparkles } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/utils";

const stats = [
  { icon: TrendingDown, label: "Avg. saved per session", value: "₹8,400" },
  { icon: Heart, label: "Impulses overcome", value: "10K+" },
  { icon: Sparkles, label: "Mindful shoppers", value: "50K+" },
];

export function Hero() {
  const { savings } = useOrders();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 zen-gradient-soft dark:from-zen-950/50 dark:to-calm-950/50 opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.08),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 mb-6 animate-fade-in">
            <Leaf className="w-4 h-4 text-zen-500" />
            Mindful shopping, zero spending
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up leading-tight">
            Shop the feeling,{" "}
            <span className="zen-gradient-text">skip the bill</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed animate-slide-up text-balance">
            CartZen lets you experience the joy of shopping without spending a rupee.
            Browse, add to cart, "buy" — and discover how much you truly need.
          </p>

          {/* Savings counter */}
          {savings > 0 && (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-gray-900 shadow-md border border-gray-100 dark:border-gray-800 mb-8 animate-fade-in">
              <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400">Your lifetime savings</p>
                <p className="font-bold text-xl zen-gradient-text">{formatPrice(savings)}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {stats.map((s) => (
              <div key={s.label} className="card p-4 text-center animate-fade-in">
                <s.icon className="w-5 h-5 text-zen-500 mx-auto mb-1.5" />
                <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
