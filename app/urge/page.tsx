"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Wind, ShoppingCart, Link2, Check, ArrowRight, Snowflake } from "lucide-react";
import { useJournal } from "@/hooks/useJournal";
import { showToast } from "@/components/ui/Toast";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { ShoppingReason } from "@/types";

const REASONS: { id: ShoppingReason; label: string; emoji: string }[] = [
  { id: "bored", label: "I'm bored", emoji: "😴" },
  { id: "stressed", label: "I'm stressed", emoji: "😤" },
  { id: "rewarding_myself", label: "I deserve a treat", emoji: "🎁" },
  { id: "just_browsing", label: "Just saw it somewhere", emoji: "👀" },
  { id: "need_product", label: "I genuinely need it", emoji: "✅" },
];

// One honest line per trigger, shown before the user picks a path.
const REASON_RESPONSES: Record<ShoppingReason, string> = {
  bored: "Boredom urges peak for 20–30 minutes, then fade on their own. You don't need the thing — you need the next half hour.",
  stressed: "Stress shopping trades a real feeling for a fake fix. The package arrives; the stress doesn't leave with the box.",
  rewarding_myself: "You do deserve a reward. The question is whether this purchase is the reward — or just the receipt.",
  just_browsing: "Seeing it created the wanting. Ten minutes ago you were fine without it — that version of you was right.",
  need_product: "A genuine need survives a day of waiting. Give it 24 hours in cooling-off — if it's real, buy it deliberately and guilt-free.",
};

const SURF_SECONDS = 60;

type Stage = "what" | "why" | "respond" | "surfing" | "done";

export default function UrgePage() {
  const router = useRouter();
  const { addEntry } = useJournal();
  const [stage, setStage] = useState<Stage>("what");
  const [what, setWhat] = useState("");
  const [reason, setReason] = useState<ShoppingReason | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SURF_SECONDS);
  const [outcome, setOutcome] = useState<"surfed" | "redirected" | null>(null);
  const logged = useRef(false);

  const isLink = /^https?:\/\/\S+$/i.test(what.trim());

  const logUrge = (note: string) => {
    if (logged.current || !reason) return;
    logged.current = true;
    addEntry(reason, note);
  };

  // Urge-surf countdown
  useEffect(() => {
    if (stage !== "surfing") return;
    if (secondsLeft <= 0) {
      logUrge(what.trim() ? `Urge: ${what.trim()} — rode it out` : "Rode out an urge");
      haptics.success();
      showToast("You outlasted it. That's the whole skill.", "resist");
      setOutcome("surfed");
      setStage("done");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, secondsLeft]);

  const fakeBuy = () => {
    logUrge(what.trim() ? `Urge: ${what.trim()} — redirected to fake basket` : "Urge redirected to fake basket");
    setOutcome("redirected");
    if (isLink) router.push(`/import?url=${encodeURIComponent(what.trim())}`);
    else if (what.trim()) router.push(`/import`);
    else router.push(`/`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">The urge is here.</h1>
          <p className="text-xs text-gray-400">Good — you came here instead. That already counts.</p>
        </div>
      </div>

      {/* Stage: what */}
      {stage === "what" && (
        <div className="card p-5 animate-fade-in">
          <p className="text-sm font-semibold mb-1">What do you want to buy?</p>
          <p className="text-xs text-gray-400 mb-3">Name it, or paste the link that's tempting you. Naming it loosens its grip.</p>
          <input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setStage("why")}
            placeholder="e.g. white sneakers, or https://…"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => setStage("why")} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5">
              Next <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setStage("why")} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              Can&apos;t name it
            </button>
          </div>
        </div>
      )}

      {/* Stage: why */}
      {stage === "why" && (
        <div className="card p-5 animate-fade-in">
          <p className="text-sm font-semibold mb-1">Why now?</p>
          <p className="text-xs text-gray-400 mb-4">Be honest — nobody&apos;s watching.</p>
          <div className="grid grid-cols-1 gap-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => { setReason(r.id); setStage("respond"); haptics.light(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-left hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
              >
                <span className="text-xl">{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage: respond */}
      {stage === "respond" && reason && (
        <div className="card p-5 animate-fade-in">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-5">
            {REASON_RESPONSES[reason]}
          </p>
          <div className="flex flex-col gap-2">
            {reason === "need_product" ? (
              <>
                <button
                  onClick={fakeBuy}
                  className="btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                >
                  <Snowflake className="w-4 h-4" />
                  {isLink ? "Import it & think it over" : "Add it & think it over"}
                </button>
                <button
                  onClick={() => { setSecondsLeft(SURF_SECONDS); setStage("surfing"); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors"
                >
                  <Wind className="w-4 h-4" /> Not sure it&apos;s a need — ride the urge 60s
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setSecondsLeft(SURF_SECONDS); setStage("surfing"); haptics.light(); }}
                  className="btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                >
                  <Wind className="w-4 h-4" /> Ride the urge — 60 seconds
                </button>
                <button
                  onClick={fakeBuy}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-orange-300 transition-colors"
                >
                  {isLink ? <Link2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  Fake-buy it instead — spend ₹0
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stage: surfing */}
      {stage === "surfing" && (
        <div className="card p-8 text-center animate-fade-in">
          <div className="relative w-36 h-36 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-950/40 animate-pulse-slow" />
            <div className="absolute inset-3 rounded-full bg-blue-200/70 dark:bg-blue-900/40 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">{secondsLeft}</span>
            </div>
          </div>
          <p className="text-sm font-semibold mb-1">Breathe with the circle.</p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            An urge is a wave — it rises, peaks, and breaks on its own. You don&apos;t have to fight it. Just don&apos;t feed it.
          </p>
          <button
            onClick={() => setStage("respond")}
            className="mt-6 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Stage: done */}
      {stage === "done" && (
        <div className="card p-8 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-3">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <p className="font-display text-xl font-bold mb-1">
            {outcome === "surfed" ? "The wave broke. You're still standing." : "Urge redirected."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Logged to your journal — every urge you name makes the next one weaker.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/journal" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
              See your journal
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-zen-400 transition-colors"
            >
              Back to browsing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
