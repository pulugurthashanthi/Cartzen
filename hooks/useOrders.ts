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
  }, []);

  const placeOrder = useCallback(
    (items: CartItem[], journalEntry?: JournalEntry): Order => {
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
        deliveryAddress: "123 Zen Street, Calm Nagar, Bangalore 560001",
        journalEntry,
      };

      ordersStorage.add(order);
      savingsStorage.add(total);
      setOrders((prev) => [order, ...prev]);
      setSavings((prev) => prev + total);

      // Simulate order progression
      let currentOrder = order;
      const delays = [3000, 6000, 10000, 15000];
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

  return { orders, savings, placeOrder, getOrder, refreshOrders };
}
