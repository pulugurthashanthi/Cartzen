"use client";
import { useState, useEffect } from "react";
import { BellRing, Check } from "lucide-react";
import { ensureNotifyPermission, canNotify } from "@/lib/notify";
import { cn } from "@/lib/utils";

// Enables browser notifications so the user gets pinged when their order moves
// to "out for delivery" / "delivered" — even if the tab is in the background.
// Transitions are timestamp-derived (lib/delivery) and fired from the tracking
// page; a real backend would later push these server-side.
export function DeliveryNotifyButton({ productName }: { productName?: string }) {
  void productName;
  const [state, setState] = useState<"idle" | "on" | "denied">("idle");

  useEffect(() => {
    if (canNotify()) setState("on");
  }, []);

  async function enable() {
    const ok = await ensureNotifyPermission();
    setState(ok ? "on" : "denied");
  }

  if (state === "on") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400">
        <Check className="w-3.5 h-3.5" />
        Delivery alerts on — we&apos;ll ping you 🔔
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-xs text-gray-400">
        Notifications are blocked. Enable them in your browser settings to get delivery pings.
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
