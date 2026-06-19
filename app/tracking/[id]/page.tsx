"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Package,
  CheckCircle, Circle,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { getStatusSteps, formatPrice, cn } from "@/lib/utils";
import { msToNextStage } from "@/lib/delivery";
import { notifyDelivery } from "@/lib/notify";
import { orderSeenStorage } from "@/lib/storage";
import { Confetti } from "@/components/ui/Confetti";
import { CartBuddy } from "@/components/ui/CartBuddy";
import { DeliveryNotifyButton } from "@/components/DeliveryNotifyButton";

const STATUS_LABEL: Record<string, string> = {
  placed: "Order Placed", packed: "Packed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered",
};

const REALITY_OPTIONS = [
  { value: "yes" as const, emoji: "😍", label: "Yes, still want it!" },
  { value: "maybe" as const, emoji: "🤔", label: "Maybe..." },
  { value: "no" as const, emoji: "😌", label: "Nah, urge is gone" },
];

const REALITY_OUTCOMES: Record<string, { title: string; sub: string; color: string }> = {
  yes: {
    title: "Genuine need confirmed! 💪",
    sub: "If the urge is still this strong, consider if it fits your budget. No judgment.",
    color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400",
  },
  maybe: {
    title: "On the fence — that's wisdom 🧘",
    sub: "Wait another week. If it still calls you, it might be worth it.",
    color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-400",
  },
  no: {
    title: "Urge vanished — you just saved real money! 🎉",
    sub: "This is exactly why CartZen exists. The craving was temporary.",
    color: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-400",
  },
};

export default function TrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { getOrder, refreshOrders, markUnboxed, saveRealityCheck } = useOrders();
  const [tick, setTick] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [unboxing, setUnboxing] = useState(false);
  const [unboxDone, setUnboxDone] = useState(false);
  const [awayBanner, setAwayBanner] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [tick]);

  const order = getOrder(orderId);

  // Detect status advances: "while you were away" banner on first view, push
  // notifications for live transitions, and confetti on delivery.
  useEffect(() => {
    if (!order) return;
    const seen = orderSeenStorage.get(orderId);
    if (seen && seen !== order.status) {
      // It moved since the user last looked.
      if (order.status === "out_for_delivery" || order.status === "delivered") {
        notifyDelivery(order.status, order.items[0]?.product.name);
      }
      setAwayBanner(STATUS_LABEL[order.status] ?? order.status);
    }
    orderSeenStorage.set(orderId, order.status);
  }, [order?.status, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleUnbox() {
    setUnboxing(true);
    setTimeout(() => {
      setUnboxDone(true);
      setShowConfetti(true);
      markUnboxed(params.id as string);
    }, 800);
  }

  function handleRealityCheck(response: "yes" | "maybe" | "no") {
    saveRealityCheck(params.id as string, response);
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-semibold mb-4">Order not found</h2>
          <Link href="/orders" className="btn-primary">View All Orders</Link>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps(order);
  const isDelivered = order.status === "delivered";
  const mainItem = order.items[0];
  const alreadyUnboxed = order.unboxed || unboxDone;
  const msNext = msToNextStage(order.placedAt);
  const nextCountdown = msNext > 0 ? `${Math.floor(msNext / 60000)}m ${Math.floor((msNext % 60000) / 1000)}s` : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Confetti active={showConfetti} />

      <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        All Orders
      </Link>

      {/* While-you-were-away banner */}
      {awayBanner && (
        <div className="mb-5 rounded-2xl p-4 bg-gradient-to-r from-zen-500 to-calm-500 text-white flex items-center gap-3 animate-slide-up">
          <span className="text-2xl">👀</span>
          <div className="flex-1">
            <p className="font-bold text-sm">Progress while you were away!</p>
            <p className="text-xs text-white/80">Your order moved to <span className="font-semibold">{awayBanner}</span> since your last visit.</p>
          </div>
          <button onClick={() => setAwayBanner(null)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
        </div>
      )}

      {/* Header card */}
      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Tracking</p>
            <p className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">#{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Saved</p>
            <p className="font-bold text-lg zen-gradient-text">{formatPrice(order.total)}</p>
          </div>
        </div>
        {mainItem && (
          <div className="flex items-center gap-3 pt-3 border-t border-orange-50 dark:border-gray-800">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <Image src={mainItem.product.image} alt={mainItem.product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{mainItem.product.name}</p>
              {order.items.length > 1 && (
                <p className="text-xs text-gray-400">+{order.items.length - 1} more item{order.items.length > 2 ? "s" : ""}</p>
              )}
            </div>
          </div>
        )}
        {!isDelivered && (
          <div className="pt-3 mt-3 border-t border-orange-50 dark:border-gray-800">
            <DeliveryNotifyButton productName={mainItem?.product.name} />
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card p-6 mb-5">
        <h2 className="font-semibold mb-6 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" />
          Delivery Journey
          {!isDelivered && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-orange-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              {nextCountdown ? <>Next update in <span className="font-mono font-bold tabular-nums">{nextCountdown}</span></> : "Live"}
            </span>
          )}
        </h2>

        <div className="space-y-0">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={step.status} className="flex gap-4">
                {/* Icon & connector */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg transition-all duration-700",
                    step.completed
                      ? "zen-gradient shadow-md shadow-orange-300/30"
                      : step.current
                      ? "zen-gradient shadow-lg shadow-orange-400/40 scale-110"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : step.current ? (
                      <span>{step.emoji}</span>
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      "w-0.5 flex-1 my-1 min-h-[2.5rem] transition-all duration-700",
                      step.completed ? "bg-gradient-to-b from-orange-400 to-orange-200" : "bg-gray-200 dark:bg-gray-800"
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn(
                        "font-semibold text-sm transition-colors",
                        step.current
                          ? "text-orange-600 dark:text-orange-400"
                          : step.completed
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      )}>
                        {step.current && <span className="mr-1">{step.emoji}</span>}
                        {step.label}
                      </p>
                      <p className={cn(
                        "text-xs mt-0.5",
                        step.completed || step.current ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-700"
                      )}>
                        {step.description}
                      </p>
                    </div>
                    {(step.completed || step.current) && step.dayLabel && (
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0 mt-0.5">
                        {step.dayLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery address */}
      <div className="card p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Simulated Delivery Address</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* ─── DELIVERED ZONE ─── */}
      {isDelivered && (
        <>
          {/* Unboxing */}
          {!alreadyUnboxed ? (
            <div className="card p-6 mb-5 text-center border-2 border-dashed border-orange-200 dark:border-orange-900">
              <div className={cn(
                "text-7xl mb-3 transition-all duration-700",
                unboxing ? "animate-bounce" : ""
              )}>
                {unboxing ? "📦" : "🎁"}
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
                Your package has arrived!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                The moment you've been waiting for…
              </p>
              <button
                onClick={handleUnbox}
                disabled={unboxing}
                className="btn-primary mx-auto text-base px-8 py-3.5"
              >
                {unboxing ? "Opening…" : "🎁 Open Package"}
              </button>
            </div>
          ) : (
            <div className="card p-6 mb-5 overflow-hidden relative">
              {/* Unboxed product reveal */}
              <div className="text-center mb-5">
                <CartBuddy mood="celebrating" size="sm" className="justify-center mb-4" />
                <h3 className="font-bold text-xl zen-gradient-text mb-1">Unboxed! 🎉</h3>
                <p className="text-sm text-gray-500">Look at it. Sit with it. Then ask yourself: still need it?</p>
              </div>
              {mainItem && (
                <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30 mb-5">
                  <Image
                    src={mainItem.product.image}
                    alt={mainItem.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                  {mainItem?.product.name}
                </p>
                <p className="text-sm text-gray-500">{formatPrice(order.total)} saved by not buying this</p>
              </div>
            </div>
          )}

          {/* Reality Check */}
          {alreadyUnboxed && (
            <div className="card p-5 mb-5">
              {order.realityCheck ? (
                <div className={cn(
                  "rounded-xl p-4 border text-sm",
                  REALITY_OUTCOMES[order.realityCheck.response].color
                )}>
                  <p className="font-bold mb-1">
                    {REALITY_OUTCOMES[order.realityCheck.response].title}
                  </p>
                  <p className="opacity-80">
                    {REALITY_OUTCOMES[order.realityCheck.response].sub}
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Reality Check 🔍
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Now that you've "had" it for a bit… do you still want this?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {REALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleRealityCheck(opt.value)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all active:scale-95"
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Order items */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4 text-sm">Items in this order</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <Link
          href={`/invoice/${order.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-zen-400 hover:text-zen-600 dark:hover:text-zen-400 transition-colors"
        >
          🧾 View ₹0.00 Invoice
        </Link>
      </div>
    </div>
  );
}
