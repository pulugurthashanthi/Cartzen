"use client";
import { useState, useEffect, useCallback } from "react";
import { ordersStorage, savingsStorage } from "@/lib/storage";
import { progressOrders } from "@/lib/delivery";
import type { Order, CartItem, JournalEntry } from "@/types";
import { generateOrderId } from "@/lib/utils";

// Reads orders from storage, applies timestamp-derived delivery progression,
// and persists any changes so progress survives reloads + Firestore sync.
function loadProgressed(): Order[] {
  const raw = ordersStorage.get();
  const { orders, changed } = progressOrders(raw);
  if (changed) ordersStorage.set(orders);
  return orders;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    setOrders(loadProgressed());
    setSavings(savingsStorage.get());
    const onSync = () => {
      setOrders(loadProgressed());
      setSavings(savingsStorage.get());
    };
    window.addEventListener("cartzen:synced", onSync);
    return () => window.removeEventListener("cartzen:synced", onSync);
  }, []);

  const placeOrder = useCallback(
    (items: CartItem[], journalEntry?: JournalEntry, deliveryAddress?: string, coinBonus = 0): Order => {
      const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      const now = new Date().toISOString();
      const order: Order = {
        id: generateOrderId(),
        items,
        total,
        placedAt: now,
        status: "placed",
        statusHistory: [{ status: "placed", timestamp: now }],
        deliveryAddress: deliveryAddress ?? "123 Zen Street, Calm Nagar, Bangalore 560001",
        journalEntry,
        ...(coinBonus > 0 ? { coinBonus } : {}),
      };

      ordersStorage.add(order);
      savingsStorage.add(total + coinBonus);
      setOrders((prev) => [order, ...prev]);
      setSavings((prev) => prev + total + coinBonus);
      if (typeof window !== "undefined") window.dispatchEvent(new Event("cartzen:savings-changed"));
      // No setTimeout needed — status is derived from placedAt on every read,
      // so the order progresses even if the user closes the app.
      return order;
    },
    []
  );

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const refreshOrders = useCallback(() => {
    setOrders(loadProgressed());
    setSavings(savingsStorage.get());
  }, []);

  const markUnboxed = useCallback((orderId: string) => {
    const updated = ordersStorage.get().map((o) =>
      o.id === orderId ? { ...o, unboxed: true } : o
    );
    ordersStorage.set(updated);
    setOrders(updated);
  }, []);

  const saveRealityCheck = useCallback(
    (orderId: string, response: "yes" | "maybe" | "no") => {
      const updated = ordersStorage.get().map((o) =>
        o.id === orderId
          ? { ...o, realityCheck: { response, timestamp: new Date().toISOString() } }
          : o
      );
      ordersStorage.set(updated);
      setOrders(updated);
    },
    []
  );

  return { orders, savings, placeOrder, getOrder, refreshOrders, markUnboxed, saveRealityCheck };
}
