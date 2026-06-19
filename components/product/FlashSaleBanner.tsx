"use client";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

const DEALS = [
  { label: "boAt Earbuds", discount: "73% off", emoji: "🎧" },
  { label: "Kanjivaram Saree", discount: "31% off", emoji: "🥻" },
  { label: "Noise Smartwatch", discount: "69% off", emoji: "⌚" },
  { label: "Anarkali Kurti", discount: "36% off", emoji: "👘" },
  { label: "Philips Air Fryer", discount: "33% off", emoji: "🍟" },
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
  const [ms, setMs] = useState(getEndOfDay());
  const [deal] = useState(() => DEALS[Math.floor(Math.random() * DEALS.length)]);

  useEffect(() => {
    const id = setInterval(() => setMs(getEndOfDay()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, sec } = formatTime(ms);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative overflow-hidden rounded-2xl zen-gradient p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Decorative blobs */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm sm:text-base">⚡ Flash Sale</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Today only
              </span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm">
              {deal.emoji} {deal.label} — <span className="font-bold text-white">{deal.discount}</span>
              <span className="text-white/60 ml-1 text-xs">(still ₹0 at checkout, obviously)</span>
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="relative flex items-center gap-2 flex-shrink-0">
          <span className="text-white/70 text-xs font-medium hidden sm:block">Ends in</span>
          {[h, m, sec].map((unit, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="bg-white/20 backdrop-blur rounded-lg px-2.5 py-1.5 text-center min-w-[2.5rem]">
                <span className="text-white font-bold text-lg leading-none tabular-nums">{unit}</span>
              </div>
              {i < 2 && <span className="text-white/60 font-bold text-sm">:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
