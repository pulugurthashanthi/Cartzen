"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function TodaysDeals() {
  const { h, m, s } = useCountdown();

  const deals = useMemo(() => {
    return products
      .filter((p) => p.discount && p.discount >= 25)
      .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
      .slice(0, 8);
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
              Today&apos;s Deals
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl px-3 py-1.5">
          <span className="text-xs text-gray-400">Ends in</span>
          <span className="font-mono font-bold text-sm text-rose-400">
            {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        </div>
      </div>

      {/* Deals row */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
        {deals.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="snap-start flex-shrink-0 w-36 group"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-square mb-2">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{product.discount}%
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-1">
              {product.name}
            </p>
            <p className="text-xs font-bold text-rose-600">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </Link>
        ))}

        {/* See all tile */}
        <Link
          href="/?sort=discount"
          className="snap-start flex-shrink-0 w-36 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-dashed border-rose-200 dark:border-rose-900 flex flex-col items-center justify-center gap-2 aspect-square text-rose-600 hover:bg-rose-100 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
          <span className="text-xs font-semibold text-center">See all deals</span>
        </Link>
      </div>
    </section>
  );
}
