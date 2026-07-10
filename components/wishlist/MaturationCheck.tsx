"use client";
import { Hourglass, Check, X } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { showToast } from "@/components/ui/Toast";
import { haptics } from "@/lib/haptics";
import { savingsStorage, wishlistFadesStorage } from "@/lib/storage";
import { trackChallenge } from "@/lib/track";
import { trackEvent } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import type { WishlistItem } from "@/types";

// The 30-day rule, compressed: a wish must survive repeated "still want it?"
// checks. First check comes due after 7 days; each "still want it" buys 14 more.
export const FIRST_CHECK_DAYS = 7;
export const RECHECK_DAYS = 14;

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function isDueForCheck(item: WishlistItem): boolean {
  return item.checkedAt
    ? daysSince(item.checkedAt) >= RECHECK_DAYS
    : daysSince(item.addedAt) >= FIRST_CHECK_DAYS;
}

interface MaturationCheckProps {
  due: WishlistItem[];
  removeItem: (productId: string) => void;
  markStillWanted: (productId: string) => void;
}

export function MaturationCheck({ due, removeItem, markStillWanted }: MaturationCheckProps) {
  if (due.length === 0) return null;

  const lostInterest = (item: WishlistItem) => {
    removeItem(item.productId);
    savingsStorage.add(item.product.price);
    wishlistFadesStorage.add(item.product.price);
    trackChallenge("cooldown_resist");
    trackEvent({ name: "wish_faded", amount: item.product.price, waitedDays: daysSince(item.addedAt) });
    haptics.success();
    showToast(`${formatPrice(item.product.price)} banked — the urge faded on its own`, "resist");
  };

  const stillWant = (item: WishlistItem) => {
    markStillWanted(item.productId);
    trackEvent({ name: "wish_kept" });
    haptics.light();
    showToast(`Noted. We'll ask again in ${RECHECK_DAYS} days.`, "info");
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Hourglass className="w-4 h-4 text-amber-500" />
        <h2 className="font-display text-lg font-bold">Time to decide</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        These have been waiting a while. Be honest — do you still feel the pull?
      </p>
      <div className="space-y-3">
        {due.map((item) => {
          const waited = daysSince(item.addedAt);
          return (
            <div
              key={item.productId}
              className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <ProductImage src={item.product.image} alt={item.product.name} className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatPrice(item.product.price)} · waiting {waited} day{waited !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => lostInterest(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity"
                >
                  <Check className="w-3.5 h-3.5" /> Lost interest — bank it
                </button>
                <button
                  onClick={() => stillWant(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 hover:border-rose-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Still want it
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
