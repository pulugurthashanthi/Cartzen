"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Trash2, ExternalLink } from "lucide-react";
import { useDreamVault } from "@/hooks/useDreamVault";
import { formatPrice, cn } from "@/lib/utils";
import type { DreamVaultCategory } from "@/types";

const VAULTS: { id: DreamVaultCategory; label: string; emoji: string; description: string; color: string; bg: string }[] = [
  {
    id: "dream_office",
    label: "Dream Office",
    emoji: "🖥️",
    description: "Your perfect work setup",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
  },
  {
    id: "dream_home",
    label: "Dream Home",
    emoji: "🏠",
    description: "Everything for your dream space",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
  },
  {
    id: "dream_travel",
    label: "Dream Travel",
    emoji: "✈️",
    description: "Gear for your next adventure",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900",
  },
  {
    id: "dream_garage",
    label: "Dream Garage",
    emoji: "🚗",
    description: "Wheels, gadgets & man-cave picks",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
  },
  {
    id: "dream_style",
    label: "Dream Style",
    emoji: "👗",
    description: "Fashion you aspire to wear",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900",
  },
];

export default function DreamVaultPage() {
  const { items, removeItem } = useDreamVault();
  const [activeVault, setActiveVault] = useState<DreamVaultCategory | "all">("all");

  const vaultItems = activeVault === "all"
    ? items
    : items.filter((i) => i.vaultCategory === activeVault);

  const totalFantasyValue = items.reduce((sum, i) => sum + i.product.price, 0);

  const vaultInfo = VAULTS.find((v) => v.id === activeVault);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl zen-gradient flex items-center justify-center shadow-lg shadow-blue-300/30 text-2xl">
            ✨
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Dream Vault</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your aspirational wishlist — no spending required</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Total fantasy value:</span>
            <span className="font-bold zen-gradient-text">{formatPrice(totalFantasyValue)}</span>
          </div>
        )}
      </div>

      {/* Vault tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6">
        <button
          onClick={() => setActiveVault("all")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
            activeVault === "all"
              ? "zen-gradient text-white shadow-md shadow-blue-300/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          🌟 All Dreams
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            activeVault === "all" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
          )}>
            {items.length}
          </span>
        </button>
        {VAULTS.map((v) => {
          const count = items.filter((i) => i.vaultCategory === v.id).length;
          return (
            <button
              key={v.id}
              onClick={() => setActiveVault(v.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                activeVault === v.id
                  ? "zen-gradient text-white shadow-md shadow-blue-300/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {v.emoji} {v.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeVault === v.id ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Vault description */}
      {vaultInfo && activeVault !== "all" && (
        <div className={cn("rounded-xl border px-4 py-3 mb-5 text-sm", vaultInfo.bg)}>
          <span className="mr-2">{vaultInfo.emoji}</span>
          <span className={cn("font-semibold", vaultInfo.color)}>{vaultInfo.label}:</span>
          <span className="text-gray-600 dark:text-gray-400 ml-1">{vaultInfo.description}</span>
          {vaultItems.length > 0 && (
            <span className="ml-2 text-gray-500">
              · {formatPrice(vaultItems.reduce((s, i) => s + i.product.price, 0))} fantasy spend
            </span>
          )}
        </div>
      )}

      {/* Items grid */}
      {vaultItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            {activeVault === "all" ? "✨" : (VAULTS.find(v => v.id === activeVault)?.emoji ?? "✨")}
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {activeVault === "all" ? "Your Dream Vault is empty" : `No items in ${VAULTS.find(v => v.id === activeVault)?.label}`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            Browse products and save them to your Dream Vault. Collect aspirations, not debt.
          </p>
          <Link href="/" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {vaultItems.map((item) => {
            const vault = VAULTS.find((v) => v.id === item.vaultCategory);
            return (
              <div key={item.productId} className="card-hover overflow-hidden group">
                <Link href={`/product/${item.productId}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {vault && (
                    <span className="absolute top-2 left-2 text-lg drop-shadow">{vault.emoji}</span>
                  )}
                </Link>
                <div className="p-3">
                  <p className="text-xs text-gray-400 truncate">{item.product.brand}</p>
                  <Link href={`/product/${item.productId}`}>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-1">
                      {item.product.name}
                    </p>
                  </Link>
                  <p className="font-bold text-sm zen-gradient-text">{formatPrice(item.product.price)}</p>
                  <div className="flex gap-1 mt-2">
                    <Link
                      href={`/product/${item.productId}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
