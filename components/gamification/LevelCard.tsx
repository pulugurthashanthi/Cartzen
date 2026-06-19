"use client";
import { formatPrice, getCurrentLevel, getLevelProgress, LEVELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  savings: number;
}

export function LevelCard({ savings }: Props) {
  const level = getCurrentLevel(savings);
  const { pct, nextLevel, toNext } = getLevelProgress(savings);

  return (
    <div className="card p-5 mb-5">
      {/* Level header */}
      <div className={`bg-gradient-to-r ${level.gradient} rounded-2xl p-4 text-white mb-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-0.5">Your Level</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {level.emoji} {level.name}
            </p>
            <p className="text-white/80 text-xs mt-1">{level.tagline}</p>
          </div>
          <div className="text-5xl opacity-20">{level.emoji}</div>
        </div>
      </div>

      {/* Progress to next */}
      {nextLevel ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progress to {nextLevel.emoji} {nextLevel.name}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.gradient} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            Save {formatPrice(toNext)} more to reach <span className="font-semibold">{nextLevel.name}</span>
          </p>
        </div>
      ) : (
        <p className="text-xs text-center text-amber-600 font-semibold">
          👑 Maximum level achieved. You are the way.
        </p>
      )}

      {/* Level ladder */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        {LEVELS.map((l, i) => {
          const unlocked = savings >= l.minSavings;
          const isCurrent = l.name === level.name;
          return (
            <div key={l.name} className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
                isCurrent
                  ? `bg-gradient-to-r ${l.gradient} shadow-md`
                  : unlocked
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-900 opacity-40"
              )}>
                {l.emoji}
              </div>
              <span className={cn(
                "text-[9px] font-medium text-center leading-tight max-w-[48px]",
                isCurrent ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
              )}>
                {l.name.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
