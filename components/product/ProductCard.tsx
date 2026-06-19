"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Snowflake } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";

const BADGE_STYLES = {
  bestseller: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  new: "bg-zen-100 text-zen-700 dark:bg-zen-900/50 dark:text-zen-400",
  trending: "bg-calm-100 text-calm-700 dark:bg-calm-900/50 dark:text-calm-400",
  sale: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400",
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const { addItem: addToCooling, isInCoolingOff } = useCoolingOff();
  const inCart = items.some((i) => i.productId === product.id);
  const inCooling = isInCoolingOff(product.id);

  return (
    <div
      className={cn(
        "card-hover group overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <span className={cn("badge absolute top-3 left-3 shadow-sm", BADGE_STYLES[product.badge])}>
            {product.badge === "bestseller" ? "🏆 Bestseller"
              : product.badge === "new" ? "✨ New"
              : product.badge === "trending" ? "🔥 Trending"
              : `${product.discount}% OFF`}
          </span>
        )}
        {product.discount && !product.badge && (
          <span className="badge absolute top-3 left-3 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 shadow-sm">
            {product.discount}% OFF
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
            {product.brand}
          </p>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-zen-600 dark:hover:text-zen-400 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i <= Math.round(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 dark:text-gray-700"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => inCart ? router.push("/cart") : addItem(product)}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95",
              inCart
                ? "bg-zen-100 dark:bg-zen-900/50 text-zen-700 dark:text-zen-400"
                : "btn-primary"
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inCart ? "Go to Cart" : "Add to Cart"}
          </button>
          <button
            onClick={() => addToCooling(product)}
            disabled={inCooling}
            title="Add to Cooling-Off list"
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200 active:scale-95",
              inCooling
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-500"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-500"
            )}
          >
            <Snowflake className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
