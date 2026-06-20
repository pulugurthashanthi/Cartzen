"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  X,
  PlusCircle,
  Snowflake,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartBuddy } from "@/components/ui/CartBuddy";
import { products as allProducts } from "@/data/products";
import { showToast } from "@/components/ui/Toast";
import { formatPrice, cn } from "@/lib/utils";

// Coupons all "work" — because the total is ₹0 anyway. The joke is the point.
const COUPONS: Record<string, string> = {
  SAVE100: "₹100 off! On ₹0. You now owe us −₹100. Just kidding. 🎉",
  BROKE50: "50% off nothing is still nothing. Math checks out. 🧮",
  IMPULSE0: "Impulse neutralised. Discount: 100%. Always was. 😌",
  TREATYOURSELF: "Treat unlocked! It's free. It was always free. 💝",
  ZENMODE: "Zen mode activated. Inner peace: +10. Wallet: untouched. 🧘",
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart, addItem } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; message: string } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Frequently bought together — products in the same categories as cart items
  const suggestions = useMemo(() => {
    if (items.length === 0) return [];
    const cartIds = new Set(items.map((i) => i.productId));
    const cartCategories = new Set(items.map((i) => i.product.category));
    return allProducts
      .filter((p) => cartCategories.has(p.category) && !cartIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [items]);

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setAppliedCoupon({ code, message: COUPONS[code] });
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError(`"${code}" isn't real. Then again, neither is this store. Try SAVE100 😉`);
      setAppliedCoupon(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CartBuddy mood="empty" size="lg" className="justify-center mb-6" />
          <h2 className="font-display text-2xl font-bold mb-2">Cart's looking lonely 👀</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Your wallet is thriving though.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Go find something expensive to <em>not</em>-buy.
          </p>
          <Link href="/" className="btn-primary">
            <ShoppingBag className="w-4 h-4" />
            Browse Stuff (It's Free to Add)
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
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Your (Very Real) Imaginary Cart
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} item{items.length !== 1 ? "s" : ""} · Total damage to your wallet: ₹0
          </p>
        </div>
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

          {/* Frequently bought together */}
          {suggestions.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                Frequently bought together
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                People who didn&apos;t buy this also didn&apos;t buy these. 🤝
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {suggestions.map((p) => (
                  <div key={p.id} className="group">
                    <Link href={`/product/${p.id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-2">
                      <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="150px" />
                    </Link>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{p.name}</p>
                    <p className="text-xs font-bold mb-2">{formatPrice(p.price)}</p>
                    <button
                      onClick={() => { addItem(p); showToast(`Added "${p.name}" 🛒`); }}
                      className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-zen-50 dark:bg-zen-950/40 text-zen-700 dark:text-zen-400 hover:bg-zen-100 dark:hover:bg-zen-900/50 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

            {/* Coupon */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-green-700 dark:text-green-400">
                      {appliedCoupon.code} applied
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{appliedCoupon.message}</p>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-green-500 hover:text-green-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        className="input pl-9 text-sm py-2 uppercase"
                      />
                    </div>
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-rose-500 mt-1.5">{couponError}</p>}
                  <p className="text-[11px] text-gray-400 mt-1.5">Psst: every code works. Try SAVE100, ZENMODE, IMPULSE0 😉</p>
                </>
              )}
            </div>

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

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                ⚠️ <span className="font-bold">Warning:</span> You are about to "spend" {formatPrice(total)}.
                In real life, this would hurt. Here, it does not. Proceed with reckless financial abandon.
              </p>
            </div>

            {/* Reward teaser — makes the payoff visible before checkout */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white flex items-center gap-2.5">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="text-sm font-bold leading-tight">Checkout = 1 guaranteed loot box</p>
                <p className="text-[11px] text-white/80">+ XP, Zen Coins, and a shot at a Legendary badge</p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full"
            >
              Place Order & Open Loot Box 🎁
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Cooling-off CTA — mission-aligned resist option */}
            <Link
              href="/cooling-off"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 font-semibold text-sm hover:border-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all active:scale-95"
            >
              <Snowflake className="w-4 h-4" />
              Not sure? Cool Off First (+35 🪙)
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
