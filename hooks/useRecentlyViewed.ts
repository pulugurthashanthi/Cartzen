"use client";
import { useState, useEffect, useCallback } from "react";
import { recentlyViewedStorage } from "@/lib/storage";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/types";

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(recentlyViewedStorage.get());
  }, []);

  const track = useCallback((productId: string) => {
    recentlyViewedStorage.add(productId);
    setIds(recentlyViewedStorage.get());
  }, []);

  // Resolve to full products (static catalogue only; Firestore items resolve where available)
  const recentProducts = ids
    .map((id) => staticProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return { ids, recentProducts, track };
}
