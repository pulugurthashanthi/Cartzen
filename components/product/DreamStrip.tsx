"use client";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight } from "lucide-react";
import { useDreamVault } from "@/hooks/useDreamVault";
import { formatPrice } from "@/lib/utils";

// Compact dream-vault strip. Only renders when the user has saved dream items,
// keeping the home page clean for newcomers.
export function DreamStrip() {
  const { items } = useDreamVault();

  if (items.length === 0) return null;

  const totalValue = items.reduce((sum, i) => sum + i.product.price, 0);

  return (
    <section className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fuchsia-500" />
          <h2 className="font-display text-base font-bold text-gray-900 dark:text-gray-100">
            Your Dream Vault
          </h2>
          <span className="text-xs text-gray-400">· {formatPrice(totalValue)} of dreams</span>
        </div>
        <Link
          href="/dream-vault"
          className="flex items-center gap-0.5 text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x scrollbar-hide">
        {items.slice(0, 10).map((item) => (
          <Link
            key={item.productId}
            href={`/product/${item.productId}`}
            className="snap-start flex-shrink-0 w-20 group"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <p className="text-[10px] text-gray-500 line-clamp-1 mt-1">{item.product.name}</p>
          </Link>
        ))}
        <Link
          href="/collections/dream-style"
          className="snap-start flex-shrink-0 w-20 h-20 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-dashed border-fuchsia-200 dark:border-fuchsia-900 flex flex-col items-center justify-center gap-1 text-fuchsia-600 hover:bg-fuchsia-100 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px] font-semibold text-center leading-tight px-1">Explore</span>
        </Link>
      </div>
    </section>
  );
}
