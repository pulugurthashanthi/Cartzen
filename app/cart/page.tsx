"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, cn } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl zen-gradient-soft dark:from-zen-950 dark:to-calm-950 flex items-center justify-center mx-auto mb-6 text-3xl">
            🛒
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Browse our products and add something that catches your eye. No real money needed!
          </p>
          <Link href="/" className="btn-primary">
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const savings = items.reduce(
    (sum, item) =>
      sum + ((item.product.originalPrice ?? item.product.price) - item.product.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          My Cart
          <span className="ml-2 text-base font-normal text-gray-400">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-rose-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex gap-4 animate-fade-in">
              <Link href={`/product/${item.product.id}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{item.product.brand}</p>
                <Link href={`/product/${item.product.id}`}>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-zen-600 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    {item.product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(item.product.originalPrice * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 h-fit rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {savings > 0 && (
            <div className="card p-4 bg-zen-50 dark:bg-zen-950/50 border-zen-100 dark:border-zen-900">
              <div className="flex items-center gap-2 text-zen-700 dark:text-zen-400">
                <Tag className="w-4 h-4" />
                <p className="text-sm font-semibold">You're saving {formatPrice(savings)}!</p>
              </div>
            </div>
          )}

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span className="text-zen-600 dark:text-zen-400 font-medium">FREE</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-zen-700 dark:text-zen-400">
                  <span>Discount</span>
                  <span>−{formatPrice(savings)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
              <span className="font-bold text-xl zen-gradient-text">{formatPrice(total)}</span>
            </div>

            <div className="p-3 rounded-xl bg-calm-50 dark:bg-calm-950/30 border border-calm-100 dark:border-calm-900">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-calm-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-calm-700 dark:text-calm-400">
                  <span className="font-semibold">No real payment.</span> Simulated checkout — you'll save{" "}
                  <span className="font-bold">{formatPrice(total)}</span> in your dashboard!
                </p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="btn-ghost w-full text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
