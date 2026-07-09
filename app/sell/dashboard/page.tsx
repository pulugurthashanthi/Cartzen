"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc,
} from "firebase/firestore";
import { Store, Plus, Trash2, Pencil, Clock, CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/components/ui/Toast";
import { LISTING_FEE_INR, FEE_STATUS_LABELS } from "@/lib/monetization";
import { formatPrice, cn } from "@/lib/utils";
import type { SellerProduct, ListingStatus } from "@/types";

const CATEGORIES = ["electronics", "fashion", "sarees", "kurtis", "mens", "home", "beauty", "sports", "books"];

interface ListingForm {
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

const EMPTY_FORM: ListingForm = { name: "", brand: "", price: 0, category: "electronics", image: "", description: "" };

const STATUS_META: Record<ListingStatus, { label: string; icon: typeof Clock; cls: string }> = {
  pending_review: { label: "In review", icon: Clock, cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" },
  approved: { label: "Live", icon: CheckCircle2, cls: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" },
  rejected: { label: "Rejected", icon: XCircle, cls: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400" },
};

export default function SellerDashboardPage() {
  const { user, loading, isSeller, storeName } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<SellerProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ListingForm>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isSeller)) router.replace("/sell");
  }, [user, isSeller, loading, router]);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setFetchError(null);
    try {
      // Sort client-side rather than orderBy() in the query: combining an
      // equality where() with orderBy() on a different field needs a
      // composite Firestore index, and without one the query throws and
      // silently leaves the dashboard empty — which is exactly what makes
      // an admin approval look like it "didn't show up" for the seller.
      const snap = await getDocs(query(collection(db, "sellerProducts"), where("sellerId", "==", user.uid)));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SellerProduct));
      docs.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
      setListings(docs);
    } catch (err) {
      // Surface the real Firestore error (permission-denied, failed-precondition,
      // etc.) instead of a generic toast — a silent empty state here is exactly
      // what made the last bug invisible.
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to load seller listings:", err);
      setFetchError(message);
      showToast("Couldn't load your listings", "info");
    }
    setFetching(false);
  }, [user]);

  useEffect(() => {
    if (user && isSeller) fetchListings();
  }, [user, isSeller, fetchListings]);

  const canSave = form.name.trim() && form.brand.trim() && form.price > 0;

  const save = async () => {
    if (!user || !canSave) return;
    setSaving(true);
    try {
      if (editId) {
        // Edits put the listing back through review
        await updateDoc(doc(db, "sellerProducts", editId), {
          ...form,
          status: "pending_review",
          rejectionReason: "",
          submittedAt: new Date().toISOString(),
        });
        showToast("Updated — back in the review queue", "info");
      } else {
        await addDoc(collection(db, "sellerProducts"), {
          ...form,
          sellerId: user.uid,
          sellerEmail: user.email ?? "",
          storeName: storeName ?? "",
          status: "pending_review",
          listingFee: LISTING_FEE_INR,
          feeStatus: "unpaid",
          submittedAt: new Date().toISOString(),
        });
        showToast("Submitted for review", "success");
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      await fetchListings();
    } catch {
      showToast("Couldn't save — try again", "info");
    }
    setSaving(false);
  };

  const remove = async (l: SellerProduct) => {
    if (!confirm(`Remove "${l.name}"?`)) return;
    await deleteDoc(doc(db, "sellerProducts", l.id));
    setListings((prev) => prev.filter((x) => x.id !== l.id));
  };

  const startEdit = (l: SellerProduct) => {
    setForm({ name: l.name, brand: l.brand, price: l.price, category: l.category, image: l.image, description: l.description });
    setEditId(l.id);
    setShowForm(true);
  };

  if (loading || (!user && !fetching)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zen-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const liveCount = listings.filter((l) => l.status === "approved").length;
  const pendingCount = listings.filter((l) => l.status === "pending_review").length;
  const feesDue = listings.filter((l) => l.status === "approved" && l.feeStatus === "unpaid")
    .reduce((s, l) => s + (l.listingFee ?? LISTING_FEE_INR), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{storeName || "Your store"}</h1>
            <p className="text-xs text-gray-400">Seller dashboard</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
          className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New listing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="card p-3 text-center">
          <p className="font-bold text-lg">{liveCount}</p>
          <p className="text-[11px] text-gray-400">Live</p>
        </div>
        <div className="card p-3 text-center">
          <p className="font-bold text-lg">{pendingCount}</p>
          <p className="text-[11px] text-gray-400">In review</p>
        </div>
        <div className="card p-3 text-center">
          <p className={cn("font-bold text-lg", feesDue > 0 && "text-amber-600 dark:text-amber-400")}>{formatPrice(feesDue)}</p>
          <p className="text-[11px] text-gray-400">Fees due</p>
        </div>
      </div>

      {feesDue > 0 && (
        <p className="mb-6 text-xs px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          Listing fees are collected after approval — we&apos;ll reach out with payment details. Online payment is coming soon.
        </p>
      )}

      {/* Listing form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editId ? "Edit listing" : "New listing"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} aria-label="Close form" className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name *"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500" />
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand *"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500" />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
              <input type="number" min={1} value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price *"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500" />
            </div>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL"
              className="sm:col-span-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500" />
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description"
              className="sm:col-span-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zen-500" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[11px] text-gray-400">₹{LISTING_FEE_INR} listing fee applies if approved.</p>
            <button onClick={save} disabled={!canSave || saving}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editId ? "Resubmit for review" : "Submit for review"}
            </button>
          </div>
        </div>
      )}

      {/* Listings */}
      {fetching ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-zen-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">⚠️</p>
          <h3 className="font-semibold mb-1">Couldn&apos;t load your listings</h3>
          <p className="text-sm text-gray-400 mb-3">This is a loading error, not an empty store.</p>
          <p className="text-xs font-mono text-rose-500 bg-rose-50 dark:bg-rose-950/30 inline-block px-3 py-1.5 rounded-lg mb-4">
            {fetchError}
          </p>
          <br />
          <button onClick={fetchListings} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold">
            Try again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🏪</p>
          <h3 className="font-semibold mb-1">No listings yet</h3>
          <p className="text-sm text-gray-400">Add your first product — it goes live once approved.</p>
          <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-3">Signed in as {user?.email}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const meta = STATUS_META[l.status];
            return (
              <div key={l.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate">{l.name}</p>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", meta.cls)}>
                      <meta.icon className="w-3 h-3" /> {meta.label}
                    </span>
                    {l.status === "approved" && (
                      <span className="text-[11px] text-gray-400">{FEE_STATUS_LABELS[l.feeStatus]}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{l.brand} · {formatPrice(l.price)} · {l.category}</p>
                  {l.status === "rejected" && l.rejectionReason && (
                    <p className="text-xs text-rose-500 mt-1">Reason: {l.rejectionReason}</p>
                  )}
                </div>
                {l.status !== "approved" && (
                  <button onClick={() => startEdit(l)} aria-label="Edit listing" className="p-2 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => remove(l)} aria-label="Delete listing" className="p-2 rounded-lg text-gray-400 hover:text-rose-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
