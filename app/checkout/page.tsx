"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, MapPin, User, Phone } from "lucide-react";
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

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

interface Address {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

type Step = "journal" | "address" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "journal", label: "Mindset" },
  { id: "address", label: "Address" },
  { id: "review", label: "Place Order" },
];

function isAddressValid(a: Address) {
  return a.fullName.trim() && a.phone.trim().length >= 10 && a.line1.trim() && a.city.trim() && a.state && a.pincode.trim().length === 6;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { addEntry } = useJournal();
  const [step, setStep] = useState<Step>("journal");
  const [selectedReason, setSelectedReason] = useState<ShoppingReason | null>(null);
  const [note, setNote] = useState("");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
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
    await new Promise((r) => setTimeout(r, 1400));
    const journalEntry = addEntry(selectedReason, note || undefined);
    const deliveryAddress = `${address.fullName}, ${address.line1}, ${address.city}, ${address.state} - ${address.pincode} | ${address.phone}`;
    const order = placeOrder(items, journalEntry, deliveryAddress);
    clearCart();
    router.push(`/checkout-success/${order.id}`);
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                i < stepIndex ? "zen-gradient text-white" :
                i === stepIndex ? "zen-gradient text-white ring-4 ring-zen-200 dark:ring-zen-900" :
                "bg-gray-100 dark:bg-gray-800 text-gray-400"
              )}>
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <span className={cn("text-sm font-medium hidden sm:block", i === stepIndex ? "text-zen-600 dark:text-zen-400" : "text-gray-400")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-800 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Mindset */}
      {step === "journal" && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-calm-100 dark:bg-calm-900/50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-calm-600 dark:text-calm-400" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Why are you shopping today?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Understand your triggers. No judgment.</p>
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
                  selectedReason === reason.value ? "border-zen-500 bg-zen-500" : "border-gray-300 dark:border-gray-600"
                )} />
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Any thoughts? (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., I've been wanting this for months…" rows={3} className="input resize-none" />
          </div>
          <button onClick={() => setStep("address")} disabled={!selectedReason} className="btn-primary w-full">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2 — Address */}
      {step === "address" && (
        <div className="space-y-6 animate-fade-in">
          <button onClick={() => setStep("journal")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-blue-500" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1">Delivery Address</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Where should we simulate the delivery?</p>
          </div>

          <div className="card p-6 space-y-4">
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <User className="inline w-3.5 h-3.5 mr-1" />Full Name *
                </label>
                <input
                  className="input"
                  placeholder="Ravi Kumar"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <Phone className="inline w-3.5 h-3.5 mr-1" />Phone Number *
                </label>
                <input
                  className="input"
                  placeholder="9876543210"
                  maxLength={10}
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/, "") })}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Address (House, Street, Area) *</label>
              <input
                className="input"
                placeholder="42, MG Road, Indiranagar"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">City *</label>
                <input
                  className="input"
                  placeholder="Bangalore"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">State *</label>
                <select
                  className="input"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                >
                  <option value="">Select</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Pincode *</label>
                <input
                  className="input"
                  placeholder="560001"
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/, "") })}
                />
              </div>
            </div>
          </div>

          <button onClick={() => setStep("review")} disabled={!isAddressValid(address)} className="btn-primary w-full">
            Review Order <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 3 — Review & Place */}
      {step === "review" && (
        <div className="space-y-6 animate-fade-in">
          <button onClick={() => setStep("address")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Delivery address summary */}
          <div className="card p-4 border-blue-100 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{address.fullName} · {address.phone}</p>
                <p className="text-gray-500">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
              </div>
              <button onClick={() => setStep("address")} className="ml-auto text-xs text-zen-500 hover:text-zen-600 font-medium">Change</button>
            </div>
          </div>

          {/* Order items */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})</h2>
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
            <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Delivery</span><span>FREE</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span>
                <span className="zen-gradient-text">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-calm-50 dark:bg-calm-950/30 border-calm-100 dark:border-calm-900">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-calm-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-calm-700 dark:text-calm-400">
                <span className="font-semibold">You're saving {formatPrice(total)}!</span>{" "}
                This is a simulated order — no payment, no delivery, 100% savings.
              </p>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full text-base py-4">
            {placing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Place Simulated Order</>
            )}
          </button>
          <p className="text-center text-xs text-gray-400">No real payment · No real delivery · 100% savings</p>
        </div>
      )}
    </div>
  );
}
