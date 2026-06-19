import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Order, OrderStatus, OrderStatusStep } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "CZ";
  let id = prefix;
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export const ORDER_STEPS: { status: OrderStatus; label: string; description: string }[] =
  [
    {
      status: "placed",
      label: "Order Placed",
      description: "Your order has been received",
    },
    {
      status: "packed",
      label: "Packed",
      description: "Items carefully packed and ready",
    },
    {
      status: "shipped",
      label: "Shipped",
      description: "On its way to your city",
    },
    {
      status: "out_for_delivery",
      label: "Out for Delivery",
      description: "With delivery partner",
    },
    {
      status: "delivered",
      label: "Delivered",
      description: "Enjoy your purchase!",
    },
  ];

const STATUS_ORDER: OrderStatus[] = [
  "placed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function getStatusSteps(order: Order): OrderStatusStep[] {
  const currentIndex = STATUS_ORDER.indexOf(order.status);
  return ORDER_STEPS.map((step, i) => {
    const historyEntry = order.statusHistory.find(
      (h) => h.status === step.status
    );
    return {
      ...step,
      timestamp: historyEntry?.timestamp,
      completed: i < currentIndex,
      current: i === currentIndex,
    };
  });
}

export function advanceOrderStatus(order: Order): Order {
  const currentIndex = STATUS_ORDER.indexOf(order.status);
  if (currentIndex >= STATUS_ORDER.length - 1) return order;
  const nextStatus = STATUS_ORDER[currentIndex + 1];
  return {
    ...order,
    status: nextStatus,
    statusHistory: [
      ...order.statusHistory,
      { status: nextStatus, timestamp: new Date().toISOString() },
    ],
  };
}

export function getMonthlySavings(orders: Order[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return orders
    .filter((o) => new Date(o.placedAt) >= startOfMonth)
    .reduce((sum, o) => sum + o.total, 0);
}

export function getAverageCartValue(orders: Order[]): number {
  if (!orders.length) return 0;
  return orders.reduce((sum, o) => sum + o.total, 0) / orders.length;
}

export const MILESTONES = [
  { amount: 1000, label: "First ₹1,000 saved! 🎉" },
  { amount: 5000, label: "₹5,000 saved! You're on a roll! 🚀" },
  { amount: 10000, label: "₹10,000 saved! Amazing discipline! 💪" },
  { amount: 25000, label: "₹25,000 saved! Financial guru! 🧘" },
  { amount: 50000, label: "₹50,000 saved! Legendary! 👑" },
];

export function getNextMilestone(savings: number) {
  return MILESTONES.find((m) => m.amount > savings) ?? null;
}

export function getAchievedMilestones(savings: number) {
  return MILESTONES.filter((m) => m.amount <= savings);
}
