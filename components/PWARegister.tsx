"use client";
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Register after load so it never competes with first paint.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registration failed — app still works, just no offline support
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
