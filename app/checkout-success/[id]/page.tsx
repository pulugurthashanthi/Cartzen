"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, TrendingUp, BarChart2, ArrowRight,
  Sparkles, MapPin, Calendar, ShoppingBag, Brain,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice, cn } from "@/lib/utils";
import { generateTherapistInsight } from "@/lib/therapist";
import { lootClaimStorage } from "@/lib/storage";
import { trackChallenge } from "@/lib/track";
import { LootBoxModal } from "@/components/rewards/LootBoxModal";

const FUNNY_LINES = [
  "Your imaginary package is in imaginary transit. The tracking is very real though.",
  "Please don't try to return this. There is nothing to return. You're welcome.",
  "Your credit card has been charged: ₹0. Your ego? Priceless.",
  "Fun fact: No trees were harmed, no delivery driver was stressed, no money left. This is peak commerce.",
  "Your order has been 'dispatched'. Our delivery owl is on the way. 🦉",
];

const MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000];

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 4) + 3); // 3–6 days
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder, savings, orders, refreshOrders } = useOrders();
  const [show, setShow] = useState(false);
  const [showLoot, setShowLoot] = useState(false);
  const [deliveryDate] = useState(getDeliveryDate);
  const orderId = params.id as string;

  useEffect(() => {
    refreshOrders();
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Grant a loot box once per order — auto-opens after the success page renders.
  useEffect(() => {
    if (!orderId || lootClaimStorage.has(orderId)) return;
    lootClaimStorage.add(orderId);
    trackChallenge("checkout");
    const t = setTimeout(() => setShowLoot(true), 1000);
    return () => clearTimeout(t);
  }, [orderId]);

  const order = getOrder(orderId);
  const [funnyLine] = useState(() => FUNNY_LINES[Math.floor(Math.random() * FUNNY_LINES.length)]);

  const therapistInsight = order?.journalEntry?.reason
    ? generateTherapistInsight(order.journalEntry.reason, orders.filter((o) => o.id !== order.id), savings)
    : null;

  const nextMilestone = MILESTONES.find((m) => m > savings);
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= savings) ?? 0;
  const progress = nextMilestone
    ? ((savings - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;

  // Parse address parts
  const addressParts = order?.deliveryAddress?.split(" | ") ?? [];
  const addressLine = addressParts[0] ?? order?.deliveryAddress ?? "";
  const phone = addressParts[1] ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-gray-950 px-4 py-10">
      {showLoot && <LootBoxModal onClose={() => setShowLoot(false)} />}
      <div className={`max-w-lg mx-auto transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Success banner */}
        <div className="zen-gradient rounded-2xl p-6 mb-5 text-center shadow-xl shadow-orange-300/30">
          <div className="text-5xl mb-3 animate-bounce-gentle">💰</div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            {order ? formatPrice(order.total) : "Money"} Saved!
          </h1>
          <p className="text-white/90 text-sm font-medium mb-1">
            🎯 Purchase Craving Successfully Completed
          </p>
          <p className="text-white/60 text-xs italic px-2">{funnyLine}</p>
          {order && (
            <p className="text-xs font-mono text-white/60 bg-white/10 rounded-lg px-3 py-1.5 inline-block mt-1">
              Order #{order.id}
            </p>
          )}
        </div>

        {/* Delivery estimate — like Flipkart/Amazon */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Estimated Delivery</p>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{deliveryDate}</p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">FREE Delivery · Fastest Delivery</p>
          </div>
        </div>

        {/* Delivery address */}
        {order && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-xs text-gray-400 mb-1">Delivering to</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{addressLine}</p>
                {phone && <p className="text-gray-500 mt-0.5">📞 {phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Order summary */}
        {order && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-sm">Order Details</span>
              <span className="ml-auto text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Order Total</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Amount Saved</span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Savings progress */}
        <div className="bg-gradient-to-br from-zen-50 to-calm-50 dark:from-zen-950/50 dark:to-calm-950/50 border border-zen-100 dark:border-zen-900 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-zen-600 dark:text-zen-400" />
            <span className="text-sm font-semibold text-zen-700 dark:text-zen-400">Lifetime Savings</span>
            <Sparkles className="w-3.5 h-3.5 text-zen-400 ml-auto" />
          </div>
          <p className="text-3xl font-bold zen-gradient-text mb-3">{formatPrice(savings)}</p>
          {nextMilestone ? (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress to {formatPrice(nextMilestone)}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full zen-gradient rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm text-zen-700 dark:text-zen-400 font-semibold">All milestones achieved! Legendary! 👑</p>
          )}
        </div>

        {/* AI Therapist insight */}
        {therapistInsight && (
          <div className={cn(
            "bg-gradient-to-br rounded-2xl p-5 mb-5 border shadow-sm",
            therapistInsight.color
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shopping Therapist</span>
              <span className="ml-auto text-base">{therapistInsight.emoji}</span>
            </div>
            <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">{therapistInsight.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{therapistInsight.body}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          {order && (
            <Link href={`/tracking/${order.id}`} className="btn-primary w-full">
              <Package className="w-4 h-4" />
              Track Your Order
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          )}
          <Link href="/orders" className="btn-secondary w-full">
            <ShoppingBag className="w-4 h-4" />
            View All Orders
          </Link>
          {order && (
            <Link href={`/invoice/${order.id}`} className="btn-secondary w-full">
              🧾 Download ₹0.00 Invoice
            </Link>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Link href="/rewards" className="btn-ghost w-full text-sm">
              🎁 Rewards
            </Link>
            <Link href="/dashboard" className="btn-ghost w-full text-sm">
              <BarChart2 className="w-4 h-4" /> Savings
            </Link>
            <Link href="/" className="btn-ghost w-full text-sm">
              🛍️ Shop
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Share CartZen with someone who could use mindful shopping 🌱
        </p>
      </div>
    </div>
  );
}
