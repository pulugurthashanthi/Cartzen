"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";
import { products } from "@/data/products";

// Single-line link-out to the deals-sorted grid — keeps the home page product-first
// instead of spending vertical space rendering the deals themselves up top.
export function TodaysDeals() {
  const topDiscount = useMemo(() => {
    return products.reduce((max, p) => Math.max(max, p.discount ?? 0), 0);
  }, []);

  if (topDiscount < 25) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-1">
      <Link
        href="/?sort=discount"
        className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 px-3 py-2 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
          <Zap className="w-4 h-4 fill-rose-500 text-rose-500 flex-shrink-0" />
          Today&apos;s Deals — up to {topDiscount}% off
        </span>
        <ChevronRight className="w-4 h-4 text-rose-400 flex-shrink-0" />
      </Link>
    </section>
  );
}
