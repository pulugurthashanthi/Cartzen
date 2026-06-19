"use client";
import { useState, useEffect, useCallback } from "react";
import { coolingOffStorage } from "@/lib/storage";
import type { CoolingOffItem, Product } from "@/types";

export function useCoolingOff() {
  const [items, setItems] = useState<CoolingOffItem[]>([]);

  useEffect(() => {
    setItems(coolingOffStorage.get());
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.find((i) => i.productId === product.id)) return prev;
      const next: CoolingOffItem[] = [
        ...prev,
        {
          productId: product.id,
          product,
          addedAt: new Date().toISOString(),
        },
      ];
      coolingOffStorage.set(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      coolingOffStorage.set(next);
      return next;
    });
  }, []);

  const markChecked = useCallback(
    (productId: string, stillWanted: boolean) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.productId === productId
            ? {
                ...i,
                checkedAt: new Date().toISOString(),
                stillWanted,
                urgeDisappeared: !stillWanted,
              }
            : i
        );
        coolingOffStorage.set(next);
        return next;
      });
    },
    []
  );

  const isInCoolingOff = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  // Items added more than 24h ago that haven't been checked
  const dueForCheck = items.filter((item) => {
    if (item.checkedAt) return false;
    const addedTime = new Date(item.addedAt).getTime();
    const now = Date.now();
    // For demo purposes, use 1 minute instead of 24 hours
    return now - addedTime > 60 * 1000;
  });

  return { items, addItem, removeItem, markChecked, isInCoolingOff, dueForCheck };
}
