"use client";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { products } from "@/data/products";
import { recentlyViewedStorage } from "@/lib/storage";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export function RecommendedRow() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(recentlyViewedStorage.get());
  }, []);

  const recommended = useMemo((): Product[] => {
    if (recentIds.length === 0) return [];

    // Find categories of recently viewed items
    const recentProducts = products.filter((p) => recentIds.includes(p.id));
    const favCategories = [...new Set(recentProducts.map((p) => p.category))];

    // Score each product: same category = 3pts, same subcategory = 5pts, high rating = +rating
    const scored = products
      .filter((p) => !recentIds.includes(p.id))
      .map((p) => {
        let score = 0;
        if (favCategories.includes(p.category)) score += 3;
        const recentSubs = recentProducts
          .filter((r) => r.category === p.category)
          .map((r) => r.subcategory);
        if (recentSubs.includes(p.subcategory)) score += 5;
        score += p.rating;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.p);

    return scored;
  }, [recentIds]);

  if (recommended.length < 3) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-fuchsia-500" />
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
            Recommended For You
          </h2>
          <p className="text-xs text-gray-400">Based on your browsing</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
        {recommended.map((product) => (
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
              {product.badge && (
                <div className="absolute top-2 left-2 bg-fuchsia-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                  {product.badge}
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-1">
              {product.name}
            </p>
            <p className="text-xs font-bold">{formatPrice(product.price)}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-amber-500">★</span>
              <span className="text-[10px] text-gray-500">{product.rating}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
