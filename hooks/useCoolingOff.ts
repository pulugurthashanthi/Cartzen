"use client";
import { useState, useEffect, useCallback } from "react";
import { coolingOffStorage } from "@/lib/storage";
import { trackChallenge } from "@/lib/track";
import type { CoolingOffItem, Product, ShoppingReason } from "@/types";

export function useCoolingOff() {
  const [items, setItems] = useState<CoolingOffItem[]>(() =>
    typeof window !== "undefined" ? coolingOffStorage.get() : []
  );

  useEffect(() => {
    const onSync = () => setItems(coolingOffStorage.get());
    window.addEventListener("cartzen:synced", onSync);
    return () => window.removeEventListener("cartzen:synced", onSync);
  }, []);

  const addItem = useCallback(
    (product: Product, trigger?: ShoppingReason, coolOffDays: 1 | 7 | 30 = 1) => {
      setItems((prev) => {
        if (prev.find((i) => i.productId === product.id)) return prev;
        const next: CoolingOffItem[] = [
          ...prev,
          {
            productId: product.id,
            product,
            addedAt: new Date().toISOString(),
            trigger,
            coolOffDays,
          },
        ];
        coolingOffStorage.set(next);
        return next;
      });
      trackChallenge("cooldown_add");
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      coolingOffStorage.set(next);
      return next;
    });
  }, []);

  const markChecked = useCallback(
    (productId: string, stillWanted: boolean, reflection?: string) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.productId === productId
            ? {
                ...i,
                checkedAt: new Date().toISOString(),
                stillWanted,
                urgeDisappeared: !stillWanted,
                reflection,
              }
            : i
        );
        coolingOffStorage.set(next);
        return next;
      });
      if (!stillWanted) trackChallenge("cooldown_resist");
    },
    []
  );

  const extendCoolOff = useCallback((productId: string, days: 1 | 7 | 30) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId
          ? { ...i, coolOffDays: days, checkedAt: undefined, stillWanted: undefined }
          : i
      );
      coolingOffStorage.set(next);
      return next;
    });
  }, []);

  const isInCoolingOff = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  // Items whose cool-off period has expired and haven't been checked
  const dueForCheck = items.filter((item) => {
    if (item.checkedAt) return false;
    const addedTime = new Date(item.addedAt).getTime();
    const durationMs = (item.coolOffDays ?? 1) * 24 * 60 * 60 * 1000;
    // Demo mode: 1-day = 1min, 7-day = 2min, 30-day = 3min
    const demoMs = (item.coolOffDays ?? 1) === 1 ? 60_000 : (item.coolOffDays ?? 1) === 7 ? 120_000 : 180_000;
    void durationMs; // would use in production
    return Date.now() - addedTime > demoMs;
  });

  // Analytics
  const resolved = items.filter((i) => i.checkedAt);
  const urgesVanished = resolved.filter((i) => i.urgeDisappeared).length;
  const urgesKept = resolved.filter((i) => i.stillWanted).length;
  const vanishRate = resolved.length > 0 ? Math.round((urgesVanished / resolved.length) * 100) : 0;
  const totalSavedFromVanished = items
    .filter((i) => i.urgeDisappeared)
    .reduce((sum, i) => sum + i.product.price, 0);

  return {
    items,
    addItem,
    removeItem,
    markChecked,
    extendCoolOff,
    isInCoolingOff,
    dueForCheck,
    analytics: { urgesVanished, urgesKept, vanishRate, totalSavedFromVanished, resolved: resolved.length },
  };
}
