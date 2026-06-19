"use client";
import Image from "next/image";
import Link from "next/link";
import { Snowflake, Clock, ShoppingCart, Trash2, Check, X } from "lucide-react";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function CoolingOffPage() {
  const { items, removeItem, markChecked, dueForCheck } = useCoolingOff();
  const { addItem } = useCart();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Cooling-Off List</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Items here get a 24-hour pause. If you still want them later, the urge is real — not impulse.
        </p>
      </div>

      {/* Due for check */}
      {dueForCheck.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Time to check in! Do you still want these?
            </p>
          </div>
          <div className="space-y-3">
            {dueForCheck.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <p className="text-sm font-medium flex-1 truncate">{item.product.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => markChecked(item.productId, true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zen-100 dark:bg-zen-900/50 text-zen-700 dark:text-zen-400 text-xs font-semibold hover:bg-zen-200 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Yes
                  </button>
                  <button
                    onClick={() => markChecked(item.productId, false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Nah
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">❄️</div>
          <h3 className="font-semibold text-lg mb-2">Nothing cooling off</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            When you're tempted by something, add it here first. Check if you still want it after 24 hours.
          </p>
          <Link href="/" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const timeSince = formatDistanceToNow(new Date(item.addedAt), { addSuffix: true });
            const urgeVanished = item.checkedAt && !item.stillWanted;

            return (
              <div
                key={item.productId}
                className={cn(
                  "card p-4 flex gap-4",
                  urgeVanished && "opacity-60"
                )}
              >
                <Link
                  href={`/product/${item.product.id}`}
                  className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0"
                >
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{item.product.brand}</p>
                  <Link href={`/product/${item.product.id}`}>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-zen-600 transition-colors mb-1">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="font-bold text-sm mb-2">{formatPrice(item.product.price)}</p>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Added {timeSince}</span>
                  </div>

                  {item.checkedAt && (
                    <div className={cn(
                      "mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                      item.stillWanted
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                        : "bg-zen-100 text-zen-700 dark:bg-zen-900/50 dark:text-zen-400"
                    )}>
                      {item.stillWanted ? (
                        <>✓ Still wanted — urge persisted</>
                      ) : (
                        <>✓ Urge disappeared — saved {formatPrice(item.product.price)}!</>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {item.stillWanted && (
                      <button
                        onClick={() => addItem(item.product)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How it works */}
      {items.length > 0 && (
        <div className="mt-8 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
          <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-400 mb-2">
            ❄️ How Cooling-Off works
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-500 leading-relaxed">
            Research shows that 70% of impulse purchase urges disappear within 24 hours.
            Items here get a reflection period. After 24h, we'll ask if you still want them.
            If yes — the need is real! If no — you just saved yourself some money. 🎉
          </p>
        </div>
      )}
    </div>
  );
}
