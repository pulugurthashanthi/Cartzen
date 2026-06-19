"use client";
import { useState } from "react";
import { Bell, BellRing, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { delay: 4000, title: "📦 CartZen Delivery", body: "Your package has been picked up and is on its way!" },
  { delay: 9000, title: "🛵 Out for delivery!", body: "Your (imaginary) order is arriving today. Be home! …or don't, it's not real." },
  { delay: 14000, title: "🎉 Delivered!", body: "Package left at your doorstep. Cost to you: ₹0. Open it in the app!" },
];

export function DeliveryNotifyButton({ productName }: { productName?: string }) {
  const [state, setState] = useState<"idle" | "scheduled" | "denied">("idle");

  async function enable() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setState("denied");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      return;
    }
    setState("scheduled");
    STEPS.forEach((step) => {
      setTimeout(() => {
        try {
          new Notification(step.title, {
            body: productName ? step.body.replace("Your package", `"${productName}"`) : step.body,
            icon: "/icon.svg",
            badge: "/icon.svg",
          });
        } catch {
          // notification failed silently
        }
      }, step.delay);
    });
  }

  if (state === "scheduled") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400">
        <Check className="w-3.5 h-3.5" />
        Notifications on — watch for delivery pings! 🔔
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-xs text-gray-400">
        Notifications are blocked. Enable them in your browser to get delivery pings.
      </p>
    );
  }

  return (
    <button
      onClick={enable}
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full",
        "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400",
        "hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors active:scale-95"
      )}
    >
      <BellRing className="w-3.5 h-3.5" />
      Notify me about delivery
    </button>
  );
}
