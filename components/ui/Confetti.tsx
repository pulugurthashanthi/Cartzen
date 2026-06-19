"use client";
import { useEffect, useState } from "react";

const COLORS = [
  "#f97316", "#d946ef", "#f43f5e", "#facc15",
  "#34d399", "#60a5fa", "#a78bfa", "#fb923c",
  "#e879f9", "#fbbf24",
];

interface Piece {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  isCircle: boolean;
}

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    setPieces(
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 1,
        duration: 1.8 + Math.random() * 1.5,
        size: 6 + Math.random() * 10,
        isCircle: Math.random() > 0.5,
      }))
    );
    const t = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(t);
  }, [active]);

  if (!pieces.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            "--duration": `${p.duration}s`,
            "--delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
