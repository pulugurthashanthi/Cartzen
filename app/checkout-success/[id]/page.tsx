"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Package, TrendingUp, BarChart2, ArrowRight,
  Sparkles, MapPin, Calendar, ShoppingBag,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/utils";

const MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000];

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 4) + 3); // 3–6 days
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder, savings, refreshOrders } = useOrders();
  const [show, setShow] = useState(false);
  const [deliveryDate] = useState(getDeliveryDate);

  useEffect(() => {
    refreshOrders();
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const order = getOrder(params.id as string);

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
      <div className={`max-w-lg mx-auto transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {/* Success banner — like Amazon */}
        <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-5 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You'll receive a simulated confirmation shortly.
          </p>
          {order && (
            <p className="mt-3 text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 inline-block">
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
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard" className="btn-ghost w-full text-sm">
              <BarChart2 className="w-4 h-4" /> Savings
            </Link>
            <Link href="/" className="btn-ghost w-full text-sm">
              🛍️ Shop More
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
