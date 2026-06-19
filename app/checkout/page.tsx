"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { useJournal } from "@/hooks/useJournal";
import { formatPrice, cn } from "@/lib/utils";
import type { ShoppingReason } from "@/types";

const REASONS: { value: ShoppingReason; label: string; emoji: string; description: string }[] = [
  { value: "bored", label: "Bored", emoji: "😴", description: "Nothing to do right now" },
  { value: "stressed", label: "Stressed", emoji: "😰", description: "Need a mood boost" },
  { value: "rewarding_myself", label: "Rewarding Myself", emoji: "🎁", description: "I deserve a treat" },
  { value: "need_product", label: "Need It", emoji: "✅", description: "Genuine need" },
  { value: "just_browsing", label: "Just Browsing", emoji: "👀", description: "Exploring options" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { addEntry } = useJournal();
  const [step, setStep] = useState<"journal" | "review">("journal");
  const [selectedReason, setSelectedReason] = useState<ShoppingReason | null>(null);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <Link href="/" className="btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedReason) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const journalEntry = addEntry(selectedReason, note || undefined);
    const order = placeOrder(items, journalEntry);
    clearCart();
    router.push(`/checkout-success/${order.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        <div className={cn("flex items-center gap-1.5 text-sm font-medium", step === "journal" ? "text-zen-600 dark:text-zen-400" : "text-gray-400")}>
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === "journal" ? "zen-gradient text-white" : "bg-zen-100 dark:bg-zen-900 text-zen-600")}>1</div>
          Your Mindset
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-800" />
        <div className={cn("flex items-center gap-1.5 text-sm font-medium", step === "review" ? "text-zen-600 dark:text-zen-400" : "text-gray-400")}>
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === "review" ? "zen-gradient text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500")}>2</div>
          Place Order
        </div>
      </div>

      {step === "journal" ? (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-calm-100 dark:bg-calm-900/50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-calm-600 dark:text-calm-400" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Why are you shopping today?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This helps you understand your shopping triggers. No judgment here.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                  selectedReason === reason.value
                    ? "border-zen-500 bg-zen-50 dark:bg-zen-950/50"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                )}
              >
                <span className="text-2xl">{reason.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{reason.label}</p>
                  <p className="text-xs text-gray-500">{reason.description}</p>
                </div>
                <div className={cn(
                  "ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all",
                  selectedReason === reason.value
                    ? "border-zen-500 bg-zen-500"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {selectedReason === reason.value && (
                    <div className="w-full h-full rounded-full zen-gradient scale-50" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Any additional thoughts? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., I've been wanting this for months…"
              rows={3}
              className="input resize-none"
            />
          </div>

          <button
            onClick={() => setStep("review")}
            disabled={!selectedReason}
            className="btn-primary w-full"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <button onClick={() => setStep("journal")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="card p-5">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="zen-gradient-text text-lg">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="card p-4 bg-calm-50 dark:bg-calm-950/30 border-calm-100 dark:border-calm-900">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-calm-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-calm-700 dark:text-calm-400">
                <span className="font-semibold">You're about to save {formatPrice(total)}!</span>{" "}
                This simulated order will add to your lifetime savings and you won't spend a rupee.
              </p>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="btn-primary w-full text-base py-4"
          >
            {placing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Place Simulated Order
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            No real payment • No real delivery • 100% savings
          </p>
        </div>
      )}
    </div>
  );
}
