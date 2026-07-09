"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";

// Floating panic button: the intervention has to be reachable at the exact
// moment of temptation, from anywhere in the app.
export function UrgeButton() {
  const pathname = usePathname();
  // Hide where it's redundant or would break focus: the flow itself,
  // and mid-checkout.
  if (pathname === "/urge" || pathname.startsWith("/checkout")) return null;

  return (
    <Link
      href="/urge"
      aria-label="I want to buy something — start an urge check-in"
      className="fixed bottom-5 right-4 sm:right-6 z-40 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
    >
      <Flame className="w-4 h-4" />
      Urge?
    </Link>
  );
}
