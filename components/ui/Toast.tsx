"use client";
import { useEffect, useState } from "react";
import { Snowflake, Trophy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastData {
  id: string;
  message: string;
  type?: "cooling" | "info" | "success" | "resist";
}

let listeners: ((t: ToastData) => void)[] = [];

export function showToast(message: string, type: ToastData["type"] = "cooling") {
  const toast: ToastData = { id: Math.random().toString(36).slice(2), message, type };
  listeners.forEach((fn) => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (t: ToastData) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up pointer-events-auto",
            t.type === "cooling" && "bg-blue-600 text-white",
            t.type === "success" && "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
            t.type === "resist" && "bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
            (t.type === "info" || !t.type) && "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
          )}
        >
          {t.type === "cooling" && <Snowflake className="w-4 h-4 flex-shrink-0 animate-spin" style={{ animationDuration: "3s" }} />}
          {t.type === "success" && <Trophy className="w-4 h-4 flex-shrink-0" />}
          {t.type === "resist" && <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
