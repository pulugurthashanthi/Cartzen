"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, MapPin, Plus, Shuffle, Check, Gift, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/useOrders";
import { useJournal } from "@/hooks/useJournal";
import { formatPrice, cn } from "@/lib/utils";
import type { ShoppingReason } from "@/types";

const REASONS: { value: ShoppingReason; label: string; emoji: string; description: string }[] = [
  { value: "bored", label: "Boredom", emoji: "😴", description: "The classic. Truly iconic." },
  { value: "stressed", label: "Stress Shopping", emoji: "😰", description: "Retail therapy, but make it free" },
  { value: "rewarding_myself", label: "Treating Myself", emoji: "🎁", description: "Queen/King behaviour, honestly" },
  { value: "need_product", label: "I Actually Need It", emoji: "✅", description: "Suuure you do. (We believe you.)" },
  { value: "just_browsing", label: "Just Browsing", emoji: "👀", description: "Narrator: they were not just browsing" },
];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const RANDOM_ADDRESSES = [
  { fullName: "Ravi Kumar", phone: "9876543210", line1: "42, MG Road, Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038" },
  { fullName: "Priya Sharma", phone: "9123456780", line1: "15, Banjara Hills, Road No 12", city: "Hyderabad", state: "Telangana", pincode: "500034" },
  { fullName: "Amit Patel", phone: "9988776655", line1: "7, Juhu Tara Road, Juhu", city: "Mumbai", state: "Maharashtra", pincode: "400049" },
  { fullName: "Sunita Verma", phone: "9011223344", line1: "301, Lajpat Nagar II", city: "New Delhi", state: "Delhi", pincode: "110024" },
];

// One-tap default so first-timers never have to type to place a fake order.
const DEFAULT_ADDRESS: Address = {
  fullName: "My Home", phone: "9000000000", line1: "Home", city: "Bengaluru", state: "Karnataka", pincode: "560001",
};

interface Address { fullName: string; phone: string; line1: string; city: string; state: string; pincode: string; }
const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };
type Step = "journal" | "confirm";

function isAddressValid(a: Address): boolean {
  return !!(a.fullName.trim() && a.phone.trim().length >= 10 && a.line1.trim() && a.city.trim() && a.state && a.pincode.trim().length === 6);
}

function parseStoredAddress(raw: string): Address | null {
  try {
    const [addrPart, phone] = raw.split(" | ");
    if (!addrPart) return null;
    const parts = addrPart.split(", ");
    const fullName = parts[0] ?? "";
    const line1 = parts[1] ?? "";
    const city = parts[2] ?? "";
    const statePin = parts[3] ?? "";
    const [state, pincode] = statePin.split(" - ");
    if (!fullName || !pincode) return null;
    return { fullName, phone: phone ?? "", line1, city, state: state ?? "", pincode: pincode ?? "" };
  } catch { return null; }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { placeOrder, orders } = useOrders();
  const { addEntry } = useJournal();
  const [step, setStep] = useState<Step>("journal");
  const [selectedReason, setSelectedReason] = useState<ShoppingReason | null>(null);
  const [note, setNote] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);

  // Saved addresses from order history
  const savedAddresses = useMemo(() => {
    const seen = new Set<string>();
    const result: Address[] = [];
    for (const o of orders) {
      if (!o.deliveryAddress) continue;
      const parsed = parseStoredAddress(o.deliveryAddress);
      if (parsed && !seen.has(parsed.pincode + parsed.line1)) {
        seen.add(parsed.pincode + parsed.line1);
        result.push(parsed);
      }
    }
    return result;
  }, [orders]);

  // The selected address: defaults to most-recent saved, else the one-tap default.
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [addressTouched, setAddressTouched] = useState(false);
  // Pre-select the latest saved address once known (unless user already picked one)
  useEffect(() => {
    if (!addressTouched && savedAddresses.length > 0) setAddress(savedAddresses[0]);
  }, [savedAddresses, addressTouched]);

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
    if (!selectedReason || !isAddressValid(address)) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900));
    const journalEntry = addEntry(selectedReason, note || undefined);
    const deliveryAddress = `${address.fullName}, ${address.line1}, ${address.city}, ${address.state} - ${address.pincode} | ${address.phone}`;
    const order = placeOrder(items, journalEntry, deliveryAddress);
    clearCart();
    router.push(`/checkout-success/${order.id}`);
  };

  const useRandom = () => {
    const r = RANDOM_ADDRESSES[Math.floor(Math.random() * RANDOM_ADDRESSES.length)];
    setAddress(r);
    setAddressTouched(true);
    setShowNewForm(false);
  };

  const saveNewAddress = () => {
    if (isAddressValid(newAddress)) {
      setAddress(newAddress);
      setAddressTouched(true);
      setShowNewForm(false);
    }
  };

  const STEPS: { id: Step; label: string }[] = [
    { id: "journal", label: "Mindset" },
    { id: "confirm", label: "Confirm" },
  ];
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // Address options shown as one-tap cards: default + saved (deduped)
  const addressOptions: Address[] = useMemo(() => {
    const opts = savedAddresses.length > 0 ? [...savedAddresses] : [DEFAULT_ADDRESS];
    return opts;
  }, [savedAddresses]);

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
            <p className="text-gray-500 dark:text-gray-400 text-sm">One tap. Understand your triggers. No judgment.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => { setSelectedReason(reason.value); setStep("confirm"); }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98]",
                  selectedReason === reason.value
                    ? "border-zen-500 bg-zen-50 dark:bg-zen-950/50"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                )}
              >
                <span className="text-2xl">{reason.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{reason.label}</p>
                  <p className="text-xs text-gray-500">{reason.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400">Tap a reason to continue — that&apos;s the only required step.</p>
        </div>
      )}

      {/* Step 2 — Confirm (address one-tap + summary + place) */}
      {step === "confirm" && (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStep("journal")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Reward teaser */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white flex items-center gap-3">
            <Gift className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">A loot box is waiting! 🎁</p>
              <p className="text-xs text-white/80">Place this order to open it + earn XP, coins, and badges.</p>
            </div>
          </div>

          {/* Address — one tap */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" /> Deliver to
              </p>
              <div className="flex gap-3">
                <button onClick={useRandom} className="text-xs font-medium text-purple-500 hover:underline flex items-center gap-1">
                  <Shuffle className="w-3 h-3" /> Random
                </button>
                <button onClick={() => { setShowNewForm((v) => !v); setNewAddress(EMPTY_ADDRESS); }} className="text-xs font-medium text-green-600 hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
            </div>

            {!showNewForm && (
              <div className="space-y-2">
                {addressOptions.map((a, i) => {
                  const chosen = address.line1 === a.line1 && address.pincode === a.pincode;
                  const isDefault = a === DEFAULT_ADDRESS;
                  return (
                    <button
                      key={i}
                      onClick={() => { setAddress(a); setAddressTouched(true); }}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3",
                        chosen ? "border-zen-500 bg-zen-50 dark:bg-zen-950/50" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-white dark:bg-gray-900"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center", chosen ? "border-zen-500 bg-zen-500" : "border-gray-300 dark:border-gray-600")}>
                        {chosen && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="text-sm flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {isDefault && <Home className="w-3.5 h-3.5 text-zen-500" />}
                          {a.fullName}{isDefault && <span className="text-xs font-normal text-gray-400">(default)</span>}
                        </p>
                        <p className="text-gray-500">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* New address form (optional) */}
            {showNewForm && (
              <div className="card p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className="input" placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                  <input className="input" placeholder="Phone" maxLength={10} value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "") })} />
                </div>
                <input className="input" placeholder="Address" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <input className="input" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  <select className="input" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}>
                    <option value="">State</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className="input col-span-2 sm:col-span-1" placeholder="Pincode" maxLength={6} value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveNewAddress} disabled={!isAddressValid(newAddress)} className="btn-primary flex-1">Use this address</button>
                  <button onClick={() => setShowNewForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
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
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-green-600 dark:text-green-400"><span>You pay</span><span className="font-bold">₹0</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>You save</span><span className="zen-gradient-text">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={placing || !isAddressValid(address)} className="btn-primary w-full text-base py-4">
            {placing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Place Order & Open Loot Box</>
            )}
          </button>
          <p className="text-center text-xs text-gray-400">No payment · No real delivery · 100% savings</p>
        </div>
      )}
    </div>
  );
}
