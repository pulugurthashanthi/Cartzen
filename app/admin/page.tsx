"use client";
import { useEffect, useState } from "react";
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
} from "lucide-react";

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

  const [tab, setTab] = useState<"products" | "users">("products");
  const [products, setProducts] = useState<FSProduct[]>([]);
  const [users, setUsers] = useState<FSUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  async function fetchAll() {
    setFetching(true);
    const [pSnap, uSnap] = await Promise.all([
      getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users")),
    ]);
    setProducts(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FSProduct)));
    setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FSUser)));
    setFetching(false);
  }

  function startEdit(p: FSProduct) {
    setForm({ name: p.name, brand: p.brand, price: p.price, category: p.category, image: p.image, inStock: p.inStock, description: p.description });
    setEditId(p.id);
    setShowForm(true);
  }

  async function saveProduct() {
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "products", editId), { ...form, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, "products"), { ...form, createdAt: new Date().toISOString() });
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
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleRole(u: FSUser) {
    const newRole = u.role === "admin" ? "user" : "admin";
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
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "users"
              ? "zen-gradient text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          <Users className="w-4 h-4" /> Users ({users.length})
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
              <div className="flex gap-3 mt-5">
                <button
                  onClick={saveProduct}
                  disabled={saving || !form.name || !form.brand}
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
                            <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500">
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
                        <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500">
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                            <button
                              onClick={() => toggleRole(u)}
                              className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Make {u.role === "admin" ? "User" : "Admin"}
                            </button>
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${u.role === "admin" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </p>
                      {u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                        <button
                          onClick={() => toggleRole(u)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Make {u.role === "admin" ? "User" : "Admin"}
                        </button>
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
