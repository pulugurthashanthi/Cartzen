"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartStorage } from "@/lib/storage";
import type { CartItem, Product } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartStorage.get());
  }, []);

  const sync = (next: CartItem[]) => {
    setItems(next);
    cartStorage.set(next);
  };

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      const next = existing
        ? prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { productId: product.id, product, quantity, addedAt: new Date().toISOString() }];
      cartStorage.set(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      cartStorage.set(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => i.productId === productId ? { ...i, quantity } : i);
      cartStorage.set(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    cartStorage.clear();
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
