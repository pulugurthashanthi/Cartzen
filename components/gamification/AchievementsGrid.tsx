"use client";
import { ACHIEVEMENTS, getUnlockedAchievements, cn } from "@/lib/utils";
import type { AchievementData } from "@/lib/utils";

interface Props {
  data: AchievementData;
}

export function AchievementsGrid({ data }: Props) {
  const unlocked = getUnlockedAchievements(data);
  const unlockedIds = new Set(unlocked.map((a) => a.id));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Achievements
        </h2>
        <span className="text-xs text-gray-400 font-medium">
          {unlocked.length} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "rounded-2xl p-3 border-2 transition-all",
                isUnlocked
                  ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50"
              )}
            >
              <div className={cn(
                "text-2xl mb-2",
                !isUnlocked && "grayscale"
              )}>
                {achievement.emoji}
              </div>
              <p className={cn(
                "text-xs font-bold leading-tight mb-0.5",
                isUnlocked ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
              )}>
                {achievement.name}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                {achievement.description}
              </p>
              {isUnlocked && (
                <div className="mt-1.5">
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    ✓ Unlocked
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
