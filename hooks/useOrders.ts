"use client";
import { useState, useEffect, useCallback } from "react";
import { ordersStorage, savingsStorage } from "@/lib/storage";
import { advanceOrderStatus } from "@/lib/utils";
import type { Order, CartItem, JournalEntry } from "@/types";
import { generateOrderId } from "@/lib/utils";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    setOrders(ordersStorage.get());
    setSavings(savingsStorage.get());
    const onSync = () => {
      setOrders(ordersStorage.get());
      setSavings(savingsStorage.get());
    };
    window.addEventListener("cartzen:synced", onSync);
    return () => window.removeEventListener("cartzen:synced", onSync);
  }, []);

  const placeOrder = useCallback(
    (items: CartItem[], journalEntry?: JournalEntry, deliveryAddress?: string): Order => {
      const total = items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      );
      const order: Order = {
        id: generateOrderId(),
        items,
        total,
        placedAt: new Date().toISOString(),
        status: "placed",
        statusHistory: [
          { status: "placed", timestamp: new Date().toISOString() },
        ],
        deliveryAddress: deliveryAddress ?? "123 Zen Street, Calm Nagar, Bangalore 560001",
        journalEntry,
      };

      ordersStorage.add(order);
      savingsStorage.add(total);
      setOrders((prev) => [order, ...prev]);
      setSavings((prev) => prev + total);

      // Simulate day-by-day delivery (compressed to seconds for demo)
      let currentOrder = order;
      const delays = [4000, 8000, 14000, 22000];
      delays.forEach((delay) => {
        setTimeout(() => {
          currentOrder = advanceOrderStatus(currentOrder);
          ordersStorage.set(
            ordersStorage.get().map((o) => (o.id === currentOrder.id ? currentOrder : o))
          );
          setOrders((prev) =>
            prev.map((o) => (o.id === currentOrder.id ? currentOrder : o))
          );
        }, delay);
      });

      return order;
    },
    []
  );

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const refreshOrders = useCallback(() => {
    setOrders(ordersStorage.get());
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
