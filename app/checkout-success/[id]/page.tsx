"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  TrendingUp,
  BarChart2,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/lib/utils";

const MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000];

export default function CheckoutSuccessPage() {
  const params = useParams();
  const { getOrder, savings, refreshOrders } = useOrders();
  const [show, setShow] = useState(false);

  useEffect(() => {
    refreshOrders();
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const order = getOrder(params.id as string);

  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => m > savings);
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= savings) ?? 0;
  const progress = nextMilestone
    ? ((savings - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zen-50 to-white dark:from-zen-950/20 dark:to-gray-950 flex items-center justify-center px-4 py-12">
      <div
        className={`max-w-md w-full transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full zen-gradient flex items-center justify-center shadow-2xl shadow-zen-500/25 mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <span className="absolute -top-2 -right-2 text-3xl animate-bounce-gentle">🎉</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-3 mt-2">
            Congratulations!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            You enjoyed the complete shopping experience —{" "}
            <span className="font-semibold text-zen-600 dark:text-zen-400">
              without spending a single rupee.
            </span>
          </p>
        </div>

        {/* Order details */}
        {order && (
          <div className="card p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zen-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Order Placed
                </span>
              </div>
              <span className="badge bg-zen-100 text-zen-700 dark:bg-zen-900/50 dark:text-zen-400">
                Simulated
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                  #{order.id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Value</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Savings card */}
        <div className="card p-5 mb-4 bg-gradient-to-br from-zen-50 to-calm-50 dark:from-zen-950/50 dark:to-calm-950/50 border-zen-100 dark:border-zen-900">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-zen-600 dark:text-zen-400" />
            <span className="text-sm font-semibold text-zen-700 dark:text-zen-400">
              Your Lifetime Savings
            </span>
          </div>
          <p className="text-3xl font-bold zen-gradient-text mb-3">
            {formatPrice(savings)}
          </p>

          {nextMilestone && (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress to {formatPrice(nextMilestone)}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full zen-gradient rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </>
          )}

          {!nextMilestone && (
            <div className="flex items-center gap-2 text-sm text-zen-700 dark:text-zen-400">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">All milestones achieved! Legendary! 👑</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {order && (
            <Link
              href={`/tracking/${order.id}`}
              className="btn-primary w-full"
            >
              <Package className="w-4 h-4" />
              Track My Order
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          )}

          <Link href="/dashboard" className="btn-secondary w-full">
            <BarChart2 className="w-4 h-4" />
            View Savings Dashboard
          </Link>

          <Link href="/" className="btn-ghost w-full">
            <Heart className="w-4 h-4" />
            Continue Shopping Mindfully
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Share CartZen with someone who could use mindful shopping 🌱
        </p>
      </div>
    </div>
  );
}
