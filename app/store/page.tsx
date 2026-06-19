"use client";
import { ShoppingBag, Check, Lock } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { STORE_ITEMS } from "@/lib/engagement";
import { showToast } from "@/components/ui/Toast";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export default function StorePage() {
  const r = useRewards();

  const boxSkins = STORE_ITEMS.filter((s) => s.kind === "boxSkin");
  const titles = STORE_ITEMS.filter((s) => s.kind === "title");

  const handleBuy = (id: string, price: number, name: string) => {
    if (r.coins < price) {
      showToast(`Need ${price - r.coins} more Zen Coins 🪙`, "info");
      return;
    }
    if (r.purchase(id)) {
      sound.reveal("rare");
      showToast(`Unlocked ${name}! Equipped ✨`, "info");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Coin Store</h1>
            <p className="text-xs text-gray-400">Spend your Zen Coins on cosmetics</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-full px-3 py-1.5">
          <span className="text-lg">🪙</span>
          <span className="font-bold text-amber-700 dark:text-amber-400">{r.coins}</span>
        </div>
      </div>

      {/* Box skins */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Loot Box Skins</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {boxSkins.map((item) => {
          const owned = r.store.owned.includes(item.id);
          const active = r.store.activeBoxSkin === item.id;
          const affordable = r.coins >= item.price;
          return (
            <div key={item.id} className="card p-3 text-center">
              <div className={cn("w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl mb-2 shadow-md", item.gradient)}>
                {item.emoji}
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
              {owned ? (
                active ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                    <Check className="w-3 h-3" /> Equipped
                  </span>
                ) : (
                  <button onClick={() => r.equip(item.id)} className="mt-2 text-xs font-semibold text-zen-600 hover:underline">
                    Equip
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleBuy(item.id, item.price, item.name)}
                  className={cn(
                    "mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    affordable ? "btn-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  )}
                >
                  {!affordable && <Lock className="w-3 h-3" />}
                  🪙 {item.price}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Titles */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Profile Titles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {titles.map((item) => {
          const owned = r.store.owned.includes(item.id);
          const active = r.store.activeTitle === item.id;
          const affordable = r.coins >= item.price;
          return (
            <div key={item.id} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              {owned ? (
                active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                    <Check className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <button onClick={() => r.equip(item.id)} className="text-xs font-semibold text-zen-600 hover:underline">
                    Equip
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleBuy(item.id, item.price, item.name)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                    affordable ? "btn-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  )}
                >
                  {!affordable && <Lock className="w-3 h-3" />}
                  🪙 {item.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
