"use client";
import { useState, useEffect, useCallback } from "react";
import { wishlistStorage } from "@/lib/storage";
import type { WishlistItem, Product } from "@/types";

const WISHLIST_EVENT = "cartzen:wishlist-changed";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(wishlistStorage.get());
    const sync = () => setItems(wishlistStorage.get());
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("cartzen:synced", sync);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("cartzen:synced", sync);
    };
  }, []);

  const persist = (updated: WishlistItem[]) => {
    wishlistStorage.set(updated);
    setItems(updated);
    window.dispatchEvent(new Event(WISHLIST_EVENT));
  };

  const addItem = useCallback((product: Product) => {
    const current = wishlistStorage.get();
    if (current.some((i) => i.productId === product.id)) return;
    persist([
      { productId: product.id, product, addedAt: new Date().toISOString() },
      ...current,
    ]);
  }, []);

  const removeItem = useCallback((productId: string) => {
    persist(wishlistStorage.get().filter((i) => i.productId !== productId));
  }, []);

  const toggle = useCallback((product: Product) => {
    const current = wishlistStorage.get();
    if (current.some((i) => i.productId === product.id)) {
      persist(current.filter((i) => i.productId !== product.id));
      return false;
    }
    persist([
      { productId: product.id, product, addedAt: new Date().toISOString() },
      ...current,
    ]);
    return true;
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  return { items, addItem, removeItem, toggle, isWishlisted };
}
