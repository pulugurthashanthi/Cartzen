"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

function cartKey(uid: string | null) {
  return uid ? `cartzen_cart_${uid}` : "cartzen_cart_guest";
}

function loadCart(uid: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(cartKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(uid: string | null, items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartKey(uid), JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const uid = user?.uid ?? null;
  const [items, setItems] = useState<CartItem[]>([]);

  // Reload cart whenever the logged-in user changes
  useEffect(() => {
    if (loading) return;
    setItems(loadCart(uid));
  }, [uid, loading]);

  const sync = useCallback((next: CartItem[]) => {
    setItems(next);
    saveCart(uid, next);
  }, [uid]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      const next = existing
        ? prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { productId: product.id, product, quantity, addedAt: new Date().toISOString() }];
      saveCart(uid, next);
      return next;
    });
  }, [uid]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveCart(uid, next);
      return next;
    });
  }, [uid]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => i.productId === productId ? { ...i, quantity } : i);
      saveCart(uid, next);
      return next;
    });
  }, [uid]);

  const clearCart = useCallback(() => {
    saveCart(uid, []);
    setItems([]);
  }, [uid]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
