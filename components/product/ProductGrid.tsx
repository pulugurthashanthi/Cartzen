"use client";
import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as staticProducts, categories } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

function normalizeFirestoreProduct(doc: Record<string, unknown>, index: number): Product {
  return {
    id: doc.id as string,
    name: (doc.name as string) ?? "",
    brand: (doc.brand as string) ?? "",
    price: Number(doc.price) ?? 0,
    originalPrice: undefined,
    discount: undefined,
    rating: 4.0,
    reviewCount: 0,
    image: (doc.image as string) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    images: [(doc.image as string) || ""],
    category: (doc.category as string) ?? "electronics",
    subcategory: "",
    description: (doc.description as string) ?? "",
    features: [],
    inStock: (doc.inStock as boolean) ?? true,
    badge: index < 3 ? "new" : undefined,
    tags: [(doc.category as string) ?? ""],
  };
}

export function ProductGrid() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating">("relevance");
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFirestore() {
      try {
        const snap = await getDocs(
          query(collection(db, "products"), orderBy("createdAt", "desc"))
        );
        const docs = snap.docs.map((d, i) =>
          normalizeFirestoreProduct({ id: d.id, ...d.data() }, i)
        );
        setFirestoreProducts(docs);
      } catch {
        // Firestore unavailable — proceed with static data only
      }
    }
    fetchFirestore();
  }, []);

  const allProducts = useMemo(() => {
    // Firestore products shown first (admin-added), then static catalogue
    const fsIds = new Set(firestoreProducts.map((p) => p.id));
    return [...firestoreProducts, ...staticProducts.filter((p) => !fsIds.has(p.id))];
  }, [firestoreProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [allProducts, search, activeCategory, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search for products, brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-11 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
              activeCategory === cat.id
                ? "zen-gradient text-white shadow-md shadow-zen-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          {search && ` for "${search}"`}
          {firestoreProducts.length > 0 && (
            <span className="ml-2 text-xs text-zen-500">
              ({firestoreProducts.length} from catalogue)
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border-0 bg-transparent text-gray-600 dark:text-gray-400 outline-none cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Try a different search or category
          </p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("all"); }}
            className="btn-secondary mt-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
