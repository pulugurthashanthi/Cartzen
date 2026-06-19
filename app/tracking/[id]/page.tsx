"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  CheckCircle,
  Circle,
  Truck,
  MapPin,
  Clock,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { getStatusSteps, formatDate, formatPrice, cn } from "@/lib/utils";

const STATUS_ICONS: Record<string, React.ElementType> = {
  placed: Package,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: Home,
};

const STATUS_COLORS = {
  placed: "text-blue-500",
  packed: "text-amber-500",
  shipped: "text-purple-500",
  out_for_delivery: "text-orange-500",
  delivered: "text-zen-500",
};

export default function TrackingPage() {
  const params = useParams();
  const { getOrder, refreshOrders } = useOrders();
  const [tick, setTick] = useState(0);

  // Refresh periodically to pick up status changes
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [tick]);

  const order = getOrder(params.id as string);

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
  const currentStep = steps.find((s) => s.current);
  const Icon = STATUS_ICONS[order.status] ?? Package;
  const statusColor = STATUS_COLORS[order.status] ?? "text-gray-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        All Orders
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Order ID</p>
            <p className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">#{order.id}</p>
          </div>
          <div className={cn("flex items-center gap-1.5 text-sm font-semibold", statusColor)}>
            <Icon className="w-4 h-4" />
            {currentStep?.label}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Placed</p>
            <p className="text-sm font-semibold">{formatDate(order.placedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Items</p>
            <p className="text-sm font-semibold">{order.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Value Saved</p>
            <p className="text-sm font-semibold text-zen-600 dark:text-zen-400">{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-6">Delivery Timeline</h2>
        <div className="space-y-0">
          {steps.map((step, i) => {
            const StepIcon = STATUS_ICONS[step.status] ?? Package;
            const isLast = i === steps.length - 1;

            return (
              <div key={step.status} className="flex gap-4">
                {/* Icon & line */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500",
                    step.completed
                      ? "zen-gradient shadow-md shadow-zen-500/20"
                      : step.current
                      ? "zen-gradient shadow-lg shadow-zen-500/30 animate-pulse-slow"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : step.current ? (
                      <StepIcon className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      "w-0.5 flex-1 my-1 transition-all duration-500",
                      step.completed ? "zen-gradient" : "bg-gray-200 dark:bg-gray-800"
                    )} style={{ minHeight: "2.5rem" }} />
                  )}
                </div>

                {/* Content */}
                <div className={cn("pb-6", isLast && "pb-0")}>
                  <p className={cn(
                    "font-semibold text-sm transition-colors",
                    step.current
                      ? "text-zen-600 dark:text-zen-400"
                      : step.completed
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-400 dark:text-gray-600"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{step.description}</p>
                  {step.timestamp && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-400">
                        {new Date(step.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery address */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-zen-100 dark:bg-zen-900/50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-zen-600 dark:text-zen-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Simulated Delivery Address</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card p-5">
        <h3 className="font-semibold mb-4">Items ({order.items.length})</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {order.status === "delivered" && (
        <div className="mt-6 p-5 rounded-2xl zen-gradient text-white text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-lg mb-1">Delivered!</p>
          <p className="text-sm opacity-90">
            You saved {formatPrice(order.total)} by not actually buying this.
          </p>
        </div>
      )}
    </div>
  );
}
