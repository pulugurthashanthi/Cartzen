"use client";
import { useState, useEffect, useCallback } from "react";
import { cartStorage } from "@/lib/storage";
import type { CartItem, Product } from "@/types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartStorage.get());
  }, []);

  const sync = useCallback((next: CartItem[]) => {
    setItems(next);
    cartStorage.set(next);
  }, []);

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          next = [
            ...prev,
            {
              productId: product.id,
              product,
              quantity,
              addedAt: new Date().toISOString(),
            },
          ];
        }
        cartStorage.set(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        cartStorage.set(next);
        return next;
      });
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      let next: CartItem[];
      if (quantity <= 0) {
        next = prev.filter((i) => i.productId !== productId);
      } else {
        next = prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
      }
      cartStorage.set(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    cartStorage.clear();
    setItems([]);
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount };
}
