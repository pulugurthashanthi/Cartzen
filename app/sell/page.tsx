"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Sparkles, Eye, ShieldCheck, IndianRupee, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/components/ui/Toast";
import { LISTING_FEE_INR } from "@/lib/monetization";

const PERKS = [
  {
    icon: Eye,
    title: "Reach mindful shoppers",
    body: "Your products appear in the browse feed where thousands window-shop guilt-free. Wishlist and fake-buy counts show you real demand before you stock inventory.",
  },
  {
    icon: ShieldCheck,
    title: "Human-reviewed catalogue",
    body: "Every listing is reviewed before it goes live, so your products sit next to quality, not spam.",
  },
  {
    icon: IndianRupee,
    title: `Simple pricing: ₹${LISTING_FEE_INR} per listing`,
    body: "No commissions, no subscriptions. One small fee per approved listing, collected after approval.",
  },
];

export default function SellPage() {
  const { user, loading, isSeller, isAdmin, signIn, becomeSeller } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Existing sellers land on their dashboard instead of the pitch
  useEffect(() => {
    if (!loading && isSeller && !isAdmin) router.replace("/sell/dashboard");
  }, [loading, isSeller, isAdmin, router]);

  const register = async () => {
    if (!store.trim()) return;
    setSubmitting(true);
    try {
      await becomeSeller(store.trim());
      showToast("Welcome aboard! Your store is ready.", "success");
      router.push("/sell/dashboard");
    } catch {
      showToast("Couldn't register right now — try again.", "info");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Sell on Fake Basket</h1>
          <p className="text-xs text-gray-400">Put your products in front of shoppers who are paying attention.</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Fake Basket shoppers browse with intent and zero buyer&apos;s remorse. Listing here is
        demand-testing and brand exposure in one.
      </p>

      <div className="space-y-3 mb-8">
        {PERKS.map((p) => (
          <div key={p.title} className="card p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
              <p.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="font-display text-lg font-bold">Open your store</h2>
        </div>
        {!user ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Sign in with Google to register as a seller — takes ten seconds.
            </p>
            <button onClick={signIn} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
              Sign in to get started
            </button>
          </>
        ) : (
          <>
            <label htmlFor="store-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Store name
            </label>
            <input
              id="store-name"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && register()}
              placeholder="e.g. Meera Handlooms"
              maxLength={60}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500"
            />
            <button
              onClick={register}
              disabled={!store.trim() || submitting}
              className="mt-4 btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Register as a seller
            </button>
            <p className="mt-3 text-[11px] text-gray-400">
              Registering is free. The ₹{LISTING_FEE_INR} listing fee applies per approved product.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
