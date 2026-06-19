"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items } = useWishlist();
  const totalFantasy = items.reduce((sum, i) => sum + i.product.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Wishlist</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Things you love but absolutely do not need. The most honest list you&apos;ll ever make. 💝
      </p>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 animate-bounce-gentle">💔</div>
          <h3 className="font-semibold text-lg mb-2">No wishes yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Tap the ❤️ on any product to stash it here.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Warning: wishlists are where good intentions go to be ignored. 😇
          </p>
          <Link href="/" className="btn-primary">Find Something to Long For</Link>
        </div>
      ) : (
        <>
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-sm font-medium">
            {items.length} item{items.length !== 1 ? "s" : ""} · {formatPrice(totalFantasy)} of pure want
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ProductCard key={item.productId} product={item.product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
