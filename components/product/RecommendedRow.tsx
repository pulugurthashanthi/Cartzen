"use client";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <h2 className="font-display text-sm font-bold text-gray-900 dark:text-gray-100">
          Recommended For You
        </h2>
        <span className="text-[11px] text-gray-400 hidden sm:inline">· based on your browsing</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 snap-x snap-mandatory scrollbar-hide">
        {recommended.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="snap-start flex-shrink-0 w-24 group"
          >
            <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-square mb-1.5">
              <ProductImage
                src={product.image}
                alt={product.name}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="96px"
              />
              {product.badge && (
                <div className="absolute top-1 left-1 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize">
                  {product.badge}
                </div>
              )}
            </div>
            <p className="text-[10px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-0.5">
              {product.name}
            </p>
            <p className="text-[11px] font-bold">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
