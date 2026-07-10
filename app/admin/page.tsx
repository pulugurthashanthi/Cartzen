"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Users,
  Package,
  Shield,
  ClipboardCheck,
  Store,
  IndianRupee,
  Eye,
  EyeOff,
  BarChart3,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { MAX_PRODUCT_PRICE } from "@/lib/monetization";
import type { SellerProduct, UserRole, FeeStatus } from "@/types";

interface FSProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  description: string;
}

interface FSUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface FSEvent {
  id: string;
  name: string;
  uid?: string;
  anon?: boolean;
  amount?: number;
  items?: number;
  outcome?: string;
  reason?: string;
  stillWanted?: boolean;
  heldHours?: number;
  waitedDays?: number;
  ts?: { seconds: number } | null;
}

const EMPTY_PRODUCT: Omit<FSProduct, "id"> = {
  name: "",
  brand: "",
  price: 0,
  category: "electronics",
  image: "",
  inStock: true,
  description: "",
};

const CATEGORIES = ["electronics", "fashion", "home", "books", "beauty", "sports", "food"];

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"products" | "users" | "review" | "metrics">("products");
  const [products, setProducts] = useState<FSProduct[]>([]);
  const [users, setUsers] = useState<FSUser[]>([]);
  const [listings, setListings] = useState<SellerProduct[]>([]);
  const [events, setEvents] = useState<FSEvent[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Who's selling what, and who owes what — joins sellerProducts back to the
  // users list so admin sees a name, not just a uid buried in each listing.
  interface SellerStat {
    sellerId: string; email: string; storeName: string; name?: string;
    total: number; live: number; pending: number;
    feesDue: number; feesPaid: number; feesWaived: number;
  }
  const sellerStats = useMemo<SellerStat[]>(() => {
    const map = new Map<string, SellerStat>();
    for (const l of listings) {
      if (!map.has(l.sellerId)) {
        const u = users.find((x) => x.id === l.sellerId);
        map.set(l.sellerId, {
          sellerId: l.sellerId, email: l.sellerEmail, storeName: l.storeName, name: u?.name,
          total: 0, live: 0, pending: 0, feesDue: 0, feesPaid: 0, feesWaived: 0,
        });
      }
      const s = map.get(l.sellerId)!;
      s.total++;
      if (l.status === "pending_review") s.pending++;
      if (l.status === "approved") {
        // Delisted listings stay "approved" so fee history survives — but
        // they're no longer live, so they shouldn't count toward it.
        if (!l.delisted) s.live++;
        const fee = l.listingFee ?? 0;
        if (l.feeStatus === "unpaid") s.feesDue += fee;
        else if (l.feeStatus === "paid") s.feesPaid += fee;
        else if (l.feeStatus === "waived") s.feesWaived += fee;
      }
    }
    return [...map.values()].sort((a, b) => b.feesDue - a.feesDue);
  }, [listings, users]);

  // The behavior-change funnel — the numbers that answer "do users actually
  // spend less and come back". Computed from the raw event log.
  const metrics = useMemo(() => {
    const of = (name: string) => events.filter((e) => e.name === name);
    const uniqueUsers = (list: FSEvent[]) => new Set(list.map((e) => e.uid).filter(Boolean)).size;
    const tsMs = (e: FSEvent) => (e.ts?.seconds ?? 0) * 1000;

    const urgeStarted = of("urge_started");
    const urgeResolved = of("urge_resolved");
    const fakeOrders = of("fake_order");
    const cooloffAdded = of("cooloff_added");
    const cooloffResolved = of("cooloff_resolved");
    const wishFaded = of("wish_faded");

    // WAU — unique users with any event in the trailing 7 days
    const weekAgo = Date.now() - 7 * 86_400_000;
    const wau = new Set(events.filter((e) => tsMs(e) >= weekAgo).map((e) => e.uid).filter(Boolean)).size;

    // Repeat urge check-ins — users who came back for a second urge
    const urgeCounts = new Map<string, number>();
    urgeStarted.forEach((e) => e.uid && urgeCounts.set(e.uid, (urgeCounts.get(e.uid) ?? 0) + 1));
    const repeatUrgeUsers = [...urgeCounts.values()].filter((c) => c > 1).length;

    const fakeOrderUsers = uniqueUsers(fakeOrders);
    const surfed = urgeResolved.filter((e) => e.outcome === "surfed").length;
    const vanished = cooloffResolved.filter((e) => e.stillWanted === false).length;

    const simulatedSpend = fakeOrders.reduce((s, e) => s + (e.amount ?? 0), 0);
    const fadeSavings = wishFaded.reduce((s, e) => s + (e.amount ?? 0), 0);

    return {
      totalUsers: uniqueUsers(events),
      wau,
      totalEvents: events.length,
      // Money not spent
      simulatedSpend,
      fadeSavings,
      totalSaved: simulatedSpend + fadeSavings,
      // Fake orders
      fakeOrders: fakeOrders.length,
      fakeOrdersPerUser: fakeOrderUsers ? fakeOrders.length / fakeOrderUsers : 0,
      // Urge funnel
      urgeStarted: urgeStarted.length,
      urgeResolved: urgeResolved.length,
      urgeCompletionRate: urgeStarted.length ? Math.round((urgeResolved.length / urgeStarted.length) * 100) : 0,
      surfed,
      surfRate: urgeResolved.length ? Math.round((surfed / urgeResolved.length) * 100) : 0,
      repeatUrgeUsers,
      // Cooling-off
      cooloffAdded: cooloffAdded.length,
      cooloffResolved: cooloffResolved.length,
      cooloffCompletionRate: cooloffAdded.length ? Math.round((cooloffResolved.length / cooloffAdded.length) * 100) : 0,
      vanished,
      vanishRate: cooloffResolved.length ? Math.round((vanished / cooloffResolved.length) * 100) : 0,
      // Wishlist maturation
      wishFaded: wishFaded.length,
    };
  }, [events]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  async function fetchAll() {
    setFetching(true);
    const [pSnap, uSnap, lSnap, eSnap] = await Promise.all([
      getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users")),
      getDocs(query(collection(db, "sellerProducts"), orderBy("submittedAt", "desc"))),
      // Behavior events — most recent 5k is plenty to compute the funnel at
      // seed scale; caps the read so this can't balloon as the log grows.
      getDocs(query(collection(db, "events"), orderBy("ts", "desc"), limit(5000))).catch(() => null),
    ]);
    setProducts(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FSProduct)));
    setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FSUser)));
    setListings(lSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SellerProduct)));
    setEvents(eSnap ? eSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FSEvent)) : []);
    setFetching(false);
  }

  // ─── Seller listing review ──────────────────────────────────────────────────

  async function approveListing(l: SellerProduct) {
    // Publish a copy into the live catalogue, then mark the listing approved
    const pub = await addDoc(collection(db, "products"), {
      name: l.name,
      brand: l.brand,
      price: l.price,
      category: l.category,
      image: l.image,
      description: l.description,
      inStock: true,
      sellerId: l.sellerId,
      storeName: l.storeName,
      createdAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, "sellerProducts", l.id), {
      status: "approved",
      reviewedAt: new Date().toISOString(),
      publishedProductId: pub.id,
    });
    await fetchAll();
  }

  async function rejectListing(l: SellerProduct) {
    const reason = prompt(`Why is "${l.name}" being rejected? (shown to the seller)`);
    if (reason === null) return;
    await updateDoc(doc(db, "sellerProducts", l.id), {
      status: "rejected",
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason || "Doesn't meet listing guidelines",
    });
    setListings((prev) =>
      prev.map((x) => (x.id === l.id ? { ...x, status: "rejected", rejectionReason: reason || "" } : x))
    );
  }

  async function setListingFee(l: SellerProduct, feeStatus: FeeStatus) {
    await updateDoc(doc(db, "sellerProducts", l.id), { feeStatus });
    setListings((prev) => prev.map((x) => (x.id === l.id ? { ...x, feeStatus } : x)));
  }

  async function markSellerFeesPaid(sellerId: string) {
    const due = listings.filter((l) => l.sellerId === sellerId && l.status === "approved" && l.feeStatus === "unpaid");
    if (due.length === 0) return;
    await Promise.all(due.map((l) => updateDoc(doc(db, "sellerProducts", l.id), { feeStatus: "paid" })));
    const ids = new Set(due.map((l) => l.id));
    setListings((prev) => prev.map((l) => (ids.has(l.id) ? { ...l, feeStatus: "paid" } : l)));
  }

  function startEdit(p: FSProduct) {
    setForm({ name: p.name, brand: p.brand, price: p.price, category: p.category, image: p.image, inStock: p.inStock, description: p.description });
    setEditId(p.id);
    setShowForm(true);
  }

  const productValidationError = (() => {
    const name = form.name.trim();
    const brand = form.brand.trim();
    if (name.length < 3) return "Name needs at least 3 characters";
    if (brand.length < 2) return "Brand needs at least 2 characters";
    if (!(form.price > 0)) return "Price must be greater than ₹0";
    if (form.price > MAX_PRODUCT_PRICE) return `Price looks like a typo — over ${formatPrice(MAX_PRODUCT_PRICE)}`;
    return null;
  })();

  async function saveProduct() {
    if (productValidationError) return;
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), brand: form.brand.trim() };
      if (editId) {
        await updateDoc(doc(db, "products", editId), { ...payload, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: new Date().toISOString() });
      }
      setShowForm(false);
      setForm(EMPTY_PRODUCT);
      setEditId(null);
      await fetchAll();
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product? This can't be undone.")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  // Soft delete: take a product off the storefront without losing the
  // record (reviews, order history, seller attribution). Same pattern as
  // a seller delisting their own listing — just flips inStock.
  async function toggleStock(p: FSProduct) {
    const inStock = !p.inStock;
    await updateDoc(doc(db, "products", p.id), { inStock });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, inStock } : x)));
  }

  async function setRole(u: FSUser, newRole: UserRole) {
    await updateDoc(doc(db, "users", u.id), { role: newRole });
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zen-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage products and users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "products"
              ? "zen-gradient text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Package className="w-4 h-4" /> Products ({products.length})
        </button>
        <button
          onClick={() => setTab("review")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "review"
              ? "zen-gradient text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" /> Review
          {listings.filter((l) => l.status === "pending_review").length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
              {listings.filter((l) => l.status === "pending_review").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "users"
              ? "zen-gradient text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Users className="w-4 h-4" /> Users ({users.length})
        </button>
        <button
          onClick={() => setTab("metrics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "metrics"
              ? "zen-gradient text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Metrics
        </button>
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Catalogue</h2>
            <button
              onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_PRODUCT); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg zen-gradient text-white text-sm font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Product Form */}
          {showForm && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">{editId ? "Edit Product" : "New Product"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Brand *</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="inStock" className="text-sm">In Stock</label>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={saveProduct}
                  disabled={saving || !!productValidationError}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg zen-gradient text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                {productValidationError && (form.name || form.brand || form.price > 0) && (
                  <p className="text-xs text-rose-500">{productValidationError}</p>
                )}
              </div>
            </div>
          )}

          {/* Product list */}
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No products yet. Add your first one!</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Brand</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-zen-50 dark:bg-zen-950 text-zen-700 dark:text-zen-400 text-xs capitalize">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">₹{p.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${p.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {p.inStock ? "In Stock" : "Out"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => toggleStock(p)}
                              aria-label={p.inStock ? `Take ${p.name} off sale` : `Restore ${p.name} to sale`}
                              title={p.inStock ? "Take off sale" : "Restore to sale"}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-gray-500 hover:text-amber-600"
                            >
                              {p.inStock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} aria-label={`Delete ${p.name}`} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.brand}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleStock(p)}
                          aria-label={p.inStock ? `Take ${p.name} off sale` : `Restore ${p.name} to sale`}
                          className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950 text-gray-500 hover:text-amber-600"
                        >
                          {p.inStock ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => startEdit(p)} aria-label={`Edit ${p.name}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} aria-label={`Delete ${p.name}`} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-zen-50 dark:bg-zen-950 text-zen-700 dark:text-zen-400 text-xs capitalize">
                        {p.category}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">₹{p.price.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {p.inStock ? "In Stock" : "Out"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Metrics Tab — the behavior-change funnel */}
      {tab === "metrics" && (
        <div>
          <h2 className="font-semibold text-lg mb-1">Behavior-change metrics</h2>
          <p className="text-xs text-gray-400 mb-6">
            Proof the product changes spending behavior — not vanity counts. From {metrics.totalEvents.toLocaleString()} logged events.
          </p>

          {metrics.totalEvents === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No events yet. They start logging as people use the app.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Headline tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricTile label="Money not spent" value={formatPrice(metrics.totalSaved)} accent="green"
                  sub={`${formatPrice(metrics.simulatedSpend)} carts + ${formatPrice(metrics.fadeSavings)} faded wishes`} />
                <MetricTile label="Weekly active users" value={metrics.wau.toLocaleString()}
                  sub={`${metrics.totalUsers} total ever`} />
                <MetricTile label="Fake orders" value={metrics.fakeOrders.toLocaleString()}
                  sub={`${metrics.fakeOrdersPerUser.toFixed(1)} per buyer`} />
                <MetricTile label="Repeat urge users" value={metrics.repeatUrgeUsers.toLocaleString()} accent="blue"
                  sub="came back for a 2nd check-in" />
              </div>

              {/* Urge funnel */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-4">Urge check-in funnel</h3>
                <div className="space-y-3">
                  <FunnelRow label="Urge check-ins started" value={metrics.urgeStarted} pct={100} />
                  <FunnelRow label="Completed (didn't abandon)" value={metrics.urgeResolved} pct={metrics.urgeCompletionRate} />
                  <FunnelRow label="Rode it out — no fake-buy needed" value={metrics.surfed} pct={metrics.surfRate}
                    hint="pure avoidance: the urge passed without even a simulated purchase" />
                </div>
              </div>

              {/* Cooling-off */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-4">Cooling-off outcomes</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-bold text-xl">{metrics.cooloffAdded}</p>
                    <p className="text-[11px] text-gray-400">items parked</p>
                  </div>
                  <div>
                    <p className="font-bold text-xl">{metrics.cooloffCompletionRate}%</p>
                    <p className="text-[11px] text-gray-400">came back to decide</p>
                  </div>
                  <div>
                    <p className="font-bold text-xl text-green-600 dark:text-green-400">{metrics.vanishRate}%</p>
                    <p className="text-[11px] text-gray-400">urge vanished on its own</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">
                Reads the most recent 5,000 events. Signed-out visitors are counted by an anonymous per-browser id.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Review Tab */}
      {tab === "review" && (
        <div>
          <h2 className="font-semibold text-lg mb-1">Seller listings</h2>
          <p className="text-xs text-gray-400 mb-4">
            Approve to publish into the live catalogue. Fees are tracked per approved listing.
          </p>

          {/* Sellers & payments */}
          {sellerStats.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm">Sellers & payments</h3>
                <span className="text-xs text-gray-400">
                  {formatPrice(sellerStats.reduce((s, x) => s + x.feesDue, 0))} total due across {sellerStats.length} seller{sellerStats.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {sellerStats.map((s) => (
                  <div key={s.sellerId} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.name || s.storeName || "—"}</p>
                      <p className="text-xs text-gray-400 truncate">{s.storeName && s.name ? `${s.storeName} · ` : ""}{s.email}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                      <span>{s.live} live{s.pending > 0 ? `, ${s.pending} pending` : ""}</span>
                      <span className={s.feesDue > 0 ? "font-semibold text-amber-600 dark:text-amber-400" : "text-gray-400"}>
                        {formatPrice(s.feesDue)} due
                      </span>
                      {s.feesPaid > 0 && <span className="text-green-600 dark:text-green-400">{formatPrice(s.feesPaid)} paid</span>}
                    </div>
                    {s.feesDue > 0 && (
                      <button
                        onClick={() => markSellerFeesPaid(s.sellerId)}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                      >
                        Mark all paid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No seller listings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...listings]
                .sort((a, b) => (a.status === "pending_review" ? -1 : 1) - (b.status === "pending_review" ? -1 : 1))
                .map((l) => (
                  <div key={l.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {l.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-800" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{l.name}</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              l.delisted
                                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                : l.status === "pending_review"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : l.status === "approved"
                                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            }`}
                          >
                            {l.delisted ? "Off sale" : l.status === "pending_review" ? "Pending" : l.status === "approved" ? "Approved" : "Rejected"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {l.brand} · ₹{l.price?.toLocaleString()} · {l.category}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {users.find((u) => u.id === l.sellerId)?.name || l.storeName || "Unknown seller"}
                          {l.storeName ? ` · ${l.storeName}` : ""} · {l.sellerEmail} · submitted{" "}
                          {l.submittedAt ? new Date(l.submittedAt).toLocaleDateString() : "—"}
                        </p>
                        {l.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{l.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {l.status === "pending_review" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveListing(l)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectListing(l)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {l.status === "approved" && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                l.feeStatus === "paid"
                                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : l.feeStatus === "waived"
                                  ? "bg-gray-100 text-gray-500 dark:bg-gray-800"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              }`}
                            >
                              ₹{l.listingFee} {l.feeStatus}
                            </span>
                            {l.feeStatus === "unpaid" && (
                              <>
                                <button
                                  onClick={() => setListingFee(l, "paid")}
                                  className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  Mark paid
                                </button>
                                <button
                                  onClick={() => setListingFee(l, "waived")}
                                  className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  Waive
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        {l.status === "rejected" && l.rejectionReason && (
                          <p className="text-[11px] text-rose-500 max-w-[200px]">"{l.rejectionReason}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <h2 className="font-semibold text-lg mb-4">Registered Users</h2>
          {users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No users yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : u.role === "seller" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                            {u.role}
                          </span>
                          {(() => {
                            const s = sellerStats.find((x) => x.sellerId === u.id);
                            if (!s) return null;
                            return (
                              <span className="ml-1.5 text-[11px] text-gray-400">
                                {s.live} live{s.feesDue > 0 ? `, ${formatPrice(s.feesDue)} due` : ""}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                            <select
                              value={u.role}
                              onChange={(e) => setRole(u, e.target.value as UserRole)}
                              className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            >
                              <option value="user">user</option>
                              <option value="seller">seller</option>
                              <option value="admin">admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${u.role === "admin" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : u.role === "seller" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {u.role}
                      </span>
                    </div>
                    {(() => {
                      const s = sellerStats.find((x) => x.sellerId === u.id);
                      if (!s) return null;
                      return (
                        <p className="text-[11px] text-gray-400 mb-2">
                          {s.live} live listing{s.live !== 1 ? "s" : ""}{s.feesDue > 0 ? ` · ${formatPrice(s.feesDue)} due` : ""}
                        </p>
                      );
                    })()}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </p>
                      {u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                        <select
                          value={u.role}
                          onChange={(e) => setRole(u, e.target.value as UserRole)}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        >
                          <option value="user">user</option>
                          <option value="seller">seller</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MetricTile({
  label, value, sub, accent,
}: {
  label: string; value: string; sub?: string; accent?: "green" | "blue";
}) {
  return (
    <div className="card p-4">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`font-bold text-2xl mt-1 ${
        accent === "green" ? "text-green-600 dark:text-green-400"
        : accent === "blue" ? "text-blue-600 dark:text-blue-400"
        : "text-gray-900 dark:text-gray-100"
      }`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-400 mt-1 leading-tight">{sub}</p>}
    </div>
  );
}

function FunnelRow({
  label, value, pct, hint,
}: {
  label: string; value: number; pct: number; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-semibold tabular-nums">{value.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
