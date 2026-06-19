"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, ShoppingBag, Truck } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice, formatDate, cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  packed: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
  out_for_delivery: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400",
  delivered: "bg-zen-100 text-zen-700 dark:bg-zen-900/50 dark:text-zen-400",
};

export default function OrdersPage() {
  const { orders, refreshOrders } = useOrders();

  useEffect(() => {
    refreshOrders();
  }, []);

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl zen-gradient-soft dark:from-zen-950 dark:to-calm-950 flex items-center justify-center mx-auto mb-6 text-3xl">
            📦
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Your simulated orders will appear here. Start shopping!
          </p>
          <Link href="/" className="btn-primary">
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        {orders.length} simulated order{orders.length !== 1 ? "s" : ""} placed
      </p>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/tracking/${order.id}`}
            className="card-hover p-5 flex items-center gap-4 group"
          >
            {/* Images preview */}
            <div className="flex -space-x-2 flex-shrink-0">
              {order.items.slice(0, 3).map((item, i) => (
                <div
                  key={item.productId}
                  className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-gray-900 bg-gray-100"
                  style={{ zIndex: order.items.length - i }}
                >
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-gray-500">
                  +{order.items.length - 3}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">#{order.id}</p>
                <span className={cn("badge text-xs", STATUS_COLORS[order.status])}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{formatDate(order.placedAt)}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Saved: <span className="zen-gradient-text">{formatPrice(order.total)}</span>
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-zen-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
