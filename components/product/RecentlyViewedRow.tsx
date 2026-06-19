"use client";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatPrice } from "@/lib/utils";

export function RecentlyViewedRow() {
  const { recentProducts } = useRecentlyViewed();

  if (recentProducts.length < 2) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-zen-500" />
        <h2 className="font-display text-lg font-bold">Continue where you left off</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {recentProducts.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="card-hover group overflow-hidden flex-shrink-0 w-36"
          >
            <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="160px"
              />
            </div>
            <div className="p-2.5">
              <p className="text-[10px] text-gray-400 mb-0.5 truncate">{p.brand}</p>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1">{p.name}</p>
              <p className="text-sm font-bold">{formatPrice(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
