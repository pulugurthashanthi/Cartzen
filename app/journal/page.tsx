"use client";
import { BookOpen, TrendingUp, Heart, Info } from "lucide-react";
import { useJournal } from "@/hooks/useJournal";
import { formatDate, cn } from "@/lib/utils";

const REASON_LABELS: Record<string, { label: string; emoji: string; insight: string }> = {
  bored: {
    label: "Boredom",
    emoji: "😴",
    insight: "Try a 10-minute walk or calling a friend instead.",
  },
  stressed: {
    label: "Stress",
    emoji: "😰",
    insight: "Retail therapy is temporary. Consider journaling or breathing exercises.",
  },
  rewarding_myself: {
    label: "Self-reward",
    emoji: "🎁",
    insight: "Great! Non-material rewards like experiences last longer.",
  },
  need_product: {
    label: "Genuine need",
    emoji: "✅",
    insight: "If the urge persists after 24h cooling-off, it may be a real need.",
  },
  just_browsing: {
    label: "Browsing",
    emoji: "👀",
    insight: "Curiosity is healthy. Exploring without buying is mindful.",
  },
};

export default function JournalPage() {
  const { entries, reasonCounts } = useJournal();
  const total = entries.length;

  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-calm-100 dark:bg-calm-900/50 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-calm-600 dark:text-calm-400" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Urge Journal</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        A record of why you shopped. Awareness is the first step to mindful spending.
      </p>

      {total === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 animate-bounce-gentle">📖</div>
          <h3 className="font-semibold text-lg mb-2">No urges logged yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            You're either very zen, or you haven't tried shopping yet.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Every checkout asks WHY you're shopping. Spoiler: it's usually boredom. 😄
          </p>
        </div>
      ) : (
        <>
          {/* Insight card */}
          {topReason && (
            <div className="card p-5 mb-6 bg-calm-50 dark:bg-calm-950/30 border-calm-100 dark:border-calm-900">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-calm-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-calm-800 dark:text-calm-400 mb-1">
                    Your top shopping trigger: {REASON_LABELS[topReason[0]]?.emoji} {REASON_LABELS[topReason[0]]?.label}
                  </p>
                  <p className="text-xs text-calm-700 dark:text-calm-500">
                    {REASON_LABELS[topReason[0]]?.insight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4 text-center">
              <TrendingUp className="w-5 h-5 text-zen-500 mx-auto mb-1.5" />
              <p className="font-bold text-xl">{total}</p>
              <p className="text-xs text-gray-400">Shopping sessions</p>
            </div>
            <div className="card p-4 text-center">
              <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
              <p className="font-bold text-xl">
                {Object.values(reasonCounts as Record<string, number>).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-gray-400">Urges tracked</p>
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {entries.map((entry) => {
              const info = REASON_LABELS[entry.reason];
              return (
                <div key={entry.id} className="card p-4 flex gap-3">
                  <span className="text-2xl flex-shrink-0">{info?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {info?.label}
                      </p>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
