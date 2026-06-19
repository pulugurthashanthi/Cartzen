"use client";
import { useState, useEffect, useCallback } from "react";
import { dreamVaultStorage } from "@/lib/storage";
import type { DreamVaultItem, DreamVaultCategory, Product } from "@/types";

export function useDreamVault() {
  const [items, setItems] = useState<DreamVaultItem[]>([]);

  useEffect(() => {
    setItems(dreamVaultStorage.get());
  }, []);

  const addItem = useCallback((product: Product, category: DreamVaultCategory) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.productId !== product.id);
      const updated: DreamVaultItem[] = [
        { productId: product.id, product, vaultCategory: category, addedAt: new Date().toISOString() },
        ...filtered,
      ];
      dreamVaultStorage.set(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      dreamVaultStorage.set(updated);
      return updated;
    });
  }, []);

  const isInVault = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const getVaultCategory = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.vaultCategory,
    [items]
  );

  return { items, addItem, removeItem, isInVault, getVaultCategory };
}
