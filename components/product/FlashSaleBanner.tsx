"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

const DEALS = [
  { label: "boAt Earbuds", discount: "73% off", emoji: "🎧", href: "/product/p17" },
  { label: "Kanjivaram Saree", discount: "31% off", emoji: "🥻", href: "/product/s1" },
  { label: "Noise Smartwatch", discount: "69% off", emoji: "⌚", href: "/product/p18" },
  { label: "Anarkali Kurti", discount: "36% off", emoji: "👘", href: "/product/k1" },
  { label: "Philips Air Fryer", discount: "33% off", emoji: "🍟", href: "/product/h5" },
];

function getEndOfDay() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime() - now.getTime();
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return { h, m, sec };
}

export function FlashSaleBanner() {
  // Start both at fixed values so server and client markup match on first paint;
  // real values are set in the effect below, right after mount.
  const [ms, setMs] = useState(0);
  const [deal, setDeal] = useState(DEALS[0]);

  useEffect(() => {
    setDeal(DEALS[Math.floor(Math.random() * DEALS.length)]);
    setMs(getEndOfDay());
    const id = setInterval(() => setMs(getEndOfDay()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, sec } = formatTime(ms);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
      <div className="relative overflow-hidden rounded-xl zen-gradient p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Decorative blobs */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />

        <Link href={deal.href} className="relative flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs sm:text-sm">✨ Community Picks</span>
              <span className="bg-white/20 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                Trending now
              </span>
            </div>
            <p className="text-white/80 text-[11px] sm:text-xs">
              {deal.emoji} {deal.label} — <span className="font-bold text-white">{deal.discount}</span>
              <span className="text-white/60 ml-1 text-[10px] hidden sm:inline">(still ₹0 at checkout, obviously)</span>
            </p>
          </div>
        </Link>

        {/* Countdown */}
        <div className="relative flex items-center gap-1.5 flex-shrink-0">
          <span className="text-white/70 text-[10px] font-medium hidden sm:block">Ends in</span>
          {[h, m, sec].map((unit, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="bg-white/20 backdrop-blur rounded-md px-2 py-1 text-center min-w-[2rem]">
                <span className="text-white font-bold text-sm leading-none tabular-nums">{unit}</span>
              </div>
              {i < 2 && <span className="text-white/60 font-bold text-xs">:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
