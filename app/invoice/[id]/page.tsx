"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Leaf } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice, formatDate } from "@/lib/utils";

export default function InvoicePage() {
  const params = useParams();
  const { getOrder, refreshOrders } = useOrders();

  useEffect(() => {
    refreshOrders();
  }, []);

  const order = getOrder(params.id as string);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🧾</p>
          <h2 className="text-xl font-semibold mb-4">Invoice not found</h2>
          <Link href="/orders" className="btn-primary">View All Orders</Link>
        </div>
      </div>
    );
  }

  const addressParts = order.deliveryAddress?.split(" | ") ?? [];
  const addressLine = addressParts[0] ?? order.deliveryAddress ?? "";
  const phone = addressParts[1] ?? "";
  const grossValue = order.items.reduce(
    (sum, i) => sum + (i.product.originalPrice ?? i.product.price) * i.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Controls — hidden when printing */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href={`/tracking/${order.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to order
        </Link>
        <button onClick={() => window.print()} className="btn-primary text-sm">
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Invoice sheet */}
      <div className="bg-white dark:bg-gray-900 print:bg-white border border-gray-200 dark:border-gray-800 print:border-0 rounded-2xl print:rounded-none p-8 shadow-sm print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl zen-gradient flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl">
                Cart<span className="zen-gradient-text">Zen</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Mindful Shopping Simulator Pvt. Ltd.</p>
            <p className="text-xs text-gray-400">GSTIN: 00ZENZEN0000Z0Z · Imaginary Lane, Cloud City</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">TAX INVOICE</p>
            <p className="text-xs text-gray-400 mt-1">#{order.id}</p>
            <p className="text-xs text-gray-400">{formatDate(order.placedAt)}</p>
          </div>
        </div>

        {/* Bill to */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{addressLine || "A Mindful Shopper"}</p>
            {phone && <p className="text-sm text-gray-500">📞 {phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Method</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pure Willpower</p>
            <p className="text-sm text-gray-500">Status: Paid (₹0.00)</p>
          </div>
        </div>

        {/* Line items */}
        <table className="w-full text-sm my-6">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 font-semibold text-center">Qty</th>
              <th className="py-2 font-semibold text-right">MRP</th>
              <th className="py-2 font-semibold text-right">You Paid</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b border-gray-100 dark:border-gray-800/50">
                <td className="py-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                  <p className="text-xs text-gray-400">{item.product.brand}</p>
                </td>
                <td className="py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                <td className="py-3 text-right text-gray-500 line-through">
                  {formatPrice((item.product.originalPrice ?? item.product.price) * item.quantity)}
                </td>
                <td className="py-3 text-right font-semibold text-green-600">₹0</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Gross Value</span>
              <span>{formatPrice(grossValue)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Mindfulness Discount (100%)</span>
              <span className="text-green-600">−{formatPrice(grossValue)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST (18% of ₹0)</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
              <span>Total Paid</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between font-semibold text-zen-600 dark:text-zen-400">
              <span>Total Saved</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Thank you for not shopping with us! 🌱
          </p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            This is a simulated invoice for a simulated purchase. No goods were dispatched,
            no money changed hands, and no buyer&apos;s remorse was generated. Not valid for
            tax filing, returns, warranty claims, or impressing your accountant.
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-3">
            This is a computer-generated invoice and a genuinely better financial decision than the alternative.
          </p>
        </div>
      </div>
    </div>
  );
}
