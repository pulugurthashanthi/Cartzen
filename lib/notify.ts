import type { OrderStatus } from "@/types";

const MESSAGES: Partial<Record<OrderStatus, { title: string; body: string }>> = {
  packed: { title: "📦 Packed & ready", body: "Your order has been packed and labelled." },
  shipped: { title: "🚚 On the move", body: "Your order has left the warehouse." },
  out_for_delivery: { title: "🛵 Out for delivery!", body: "Your order is arriving today. (Cost to you: ₹0.)" },
  delivered: { title: "🎉 Delivered!", body: "Your package arrived. Open it in the app to unbox!" },
};

export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

export async function ensureNotifyPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const p = await Notification.requestPermission();
  return p === "granted";
}

export function notifyDelivery(status: OrderStatus, productName?: string) {
  if (!canNotify()) return;
  const msg = MESSAGES[status];
  if (!msg) return;
  try {
    new Notification(msg.title, {
      body: productName ? msg.body.replace("Your order", `"${productName}"`) : msg.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: `cartzen-${status}`,
    });
  } catch {
    // ignore
  }
}
