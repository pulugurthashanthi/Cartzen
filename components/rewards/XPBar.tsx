"use client";
import { cn } from "@/lib/utils";

interface Props {
  level: number;
  xp: number;
  curLevelXp: number;
  nextLevelXp: number;
  pct: number;
  compact?: boolean;
}

export function XPBar({ level, xp, curLevelXp, nextLevelXp, pct, compact }: Props) {
  return (
    <div className={cn("w-full", compact && "max-w-xs")}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full zen-gradient text-white text-xs font-extrabold shadow-md">
            {level}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Level {level}</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {xp - curLevelXp} / {nextLevelXp - curLevelXp} XP
        </span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
        <div
          className="h-full zen-gradient rounded-full transition-all duration-700 relative overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
      {!compact && (
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          {nextLevelXp - xp} XP to Level {level + 1}
        </p>
      )}
    </div>
  );
}
