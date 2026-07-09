"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronRight, Check, Link2 } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as staticProducts, categories as staticCategories } from "@/data/products";
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

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹2,000", min: 500, max: 2000 },
  { label: "₹2,000 – ₹10,000", min: 2000, max: 10000 },
  { label: "₹10,000 – ₹50,000", min: 10000, max: 50000 },
  { label: "Above ₹50,000", min: 50000, max: Infinity },
];

const DISCOUNT_OPTIONS = [
  { label: "10%+ off", min: 10 },
  { label: "25%+ off", min: 25 },
  { label: "50%+ off", min: 50 },
  { label: "70%+ off", min: 70 },
];

export function ProductGrid() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating" | "discount">("relevance");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  // Responsive placeholder — the long copy truncated mid-word on phones
  // ("Search products, bra…"). SSR renders the shortest variant (safe at any
  // width), then we upgrade after mount and track resizes.
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search products");
  useEffect(() => {
    const pick = () =>
      setSearchPlaceholder(
        window.innerWidth >= 1024
          ? "Search products, brands or categories"
          : window.innerWidth >= 640
          ? "Search products or brands"
          : "Search products"
      );
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, []);

  // Read ?sort=discount from the URL directly instead of useSearchParams():
  // that hook forces a Suspense boundary around the grid, and React 19 reveals
  // streamed boundaries inside requestAnimationFrame — which never fires in a
  // hidden/background tab, leaving the whole grid invisible until refocus.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("sort") === "discount") {
      setSortBy("discount");
    }
  }, []);

  useEffect(() => {
    async function fetchFirestore() {
      try {
        const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
        const docs = snap.docs.map((d, i) =>
          normalizeFirestoreProduct({ id: d.id, ...d.data() }, i)
        );
        setFirestoreProducts(docs);
      } catch {
        // static only
      }
    }
    fetchFirestore();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilters]);

  const allProducts = useMemo(() => {
    const fsIds = new Set(firestoreProducts.map((p) => p.id));
    return [...firestoreProducts, ...staticProducts.filter((p) => !fsIds.has(p.id))];
  }, [firestoreProducts]);

  const categories = useMemo(() => {
    const countMap: Record<string, number> = {};
    allProducts.forEach((p) => { countMap[p.category] = (countMap[p.category] || 0) + 1; });
    const knownCatIds = new Set(staticCategories.map((c) => c.id));
    const extraCats = Object.keys(countMap)
      .filter((k) => k !== "all" && !knownCatIds.has(k))
      .map((k) => ({ id: k, name: k.charAt(0).toUpperCase() + k.slice(1), icon: "🛍️" }));
    return [
      { id: "all", name: "All", icon: "✨" },
      ...staticCategories.filter((c) => c.id !== "all"),
      ...extraCats,
    ].map((c) => ({
      ...c,
      count: c.id === "all" ? allProducts.length : (countMap[c.id] || 0),
    }));
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (activeCategory !== "all") list = list.filter((p) => p.category === activeCategory);

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

    if (priceRange) {
      list = list.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    }

    if (minDiscount !== null) {
      list = list.filter((p) => (p.discount ?? 0) >= minDiscount);
    }

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "discount") list.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));

    return list;
  }, [allProducts, search, activeCategory, sortBy, priceRange, minDiscount]);

  const activeFilterCount = (priceRange ? 1 : 0) + (minDiscount !== null ? 1 : 0);

  const clearAll = useCallback(() => {
    setSearch("");
    setActiveCategory("all");
    setPriceRange(null);
    setMinDiscount(null);
    setSortBy("relevance");
    setVisibleCount(12);
  }, []);

  // Reset visible count whenever filters/search/category change
  useEffect(() => { setVisibleCount(12); }, [search, activeCategory, priceRange, minDiscount, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">

      {/* Search + filter row */}
      <div className="flex gap-3 max-w-3xl mx-auto mb-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 pr-10 w-full"
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

        {/* Filter button + panel */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all whitespace-nowrap",
              showFilters || activeFilterCount > 0
                ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-blue-300"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full zen-gradient text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilters && "rotate-180")} />
          </button>

          {showFilters && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-5 z-30">
              {/* Price range */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Price Range
                </p>
                <div className="space-y-1">
                  {PRICE_RANGES.map((r) => {
                    const active = priceRange?.min === r.min && priceRange?.max === r.max;
                    return (
                      <button
                        key={r.label}
                        onClick={() => setPriceRange(active ? null : { min: r.min, max: r.max })}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-sm transition-all",
                          active
                            ? "zen-gradient text-white font-medium"
                            : "hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Discount
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DISCOUNT_OPTIONS.map((d) => {
                    const active = minDiscount === d.min;
                    return (
                      <button
                        key={d.label}
                        onClick={() => setMinDiscount(active ? null : d.min)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                          active
                            ? "zen-gradient text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setPriceRange(null); setMinDiscount(null); }}
                  className="w-full text-sm text-center text-rose-500 hover:text-rose-600 font-medium py-1.5 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Paste-a-link row: nudge, plus a smart banner when a URL lands in search */}
      <div className="max-w-3xl mx-auto mb-4">
        {/^https?:\/\/\S+$/i.test(search.trim()) ? (
          <Link
            href={`/import?url=${encodeURIComponent(search.trim())}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm font-medium text-blue-700 dark:text-blue-300 hover:border-blue-400 transition-colors"
          >
            <Link2 className="w-4 h-4 flex-shrink-0" />
            That looks like a product link — import it into your fake basket
            <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
          </Link>
        ) : (
          <Link
            href="/import"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1 py-1"
          >
            <Link2 className="w-3.5 h-3.5" />
            Tempted by something elsewhere? Paste the link
          </Link>
        )}
      </div>

      {/* Category chips — straight into shopping, no marketing header.
          The expand toggle lives at the end of the row as a chip. */}
      <div
        className={cn(
          "gap-2.5 mb-4",
          showAllCategories ? "flex flex-wrap" : "flex overflow-x-auto pb-3 scrollbar-hide"
        )}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
              activeCategory === cat.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-blue-300"
            )}
          >
            {cat.id === "all" && activeCategory === "all" ? (
              <Check className="w-4 h-4" />
            ) : (
              <span>{cat.icon}</span>
            )}
            {cat.name}
            {cat.count > 0 && (
              <span className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                activeCategory === cat.id
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}>
                {cat.count}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setShowAllCategories((v) => !v)}
          className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        >
          {showAllCategories ? "Less" : "All"}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAllCategories && "rotate-180")} />
        </button>
      </div>

      {/* Active filter chips */}
      {(priceRange || minDiscount !== null || search) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {search && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
              🔍 &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {priceRange && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
              💰 {PRICE_RANGES.find(r => r.min === priceRange.min)?.label}
              <button onClick={() => setPriceRange(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {minDiscount !== null && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
              🏷️ {minDiscount}%+ off
              <button onClick={() => setMinDiscount(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-rose-500 transition-colors px-1">
            Clear all
          </button>
        </div>
      )}

      {/* Results + sort */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-gray-100">
            {search ? `Results for "${search}"` : activeCategory === "all" ? "Featured for you" : categories.find((c) => c.id === activeCategory)?.name}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
        >
          <option value="relevance">Relevance</option>
          <option value="discount">Best Discount</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.slice(0, visibleCount).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount((n) => n + 12)}
                className="btn-secondary px-8"
              >
                Show more ({filtered.length - visibleCount} left)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Nothing matches that</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Try different filters — it&apos;s all free anyway 😄
          </p>
          <button onClick={clearAll} className="btn-secondary mt-4">
            Clear everything
          </button>
        </div>
      )}
    </section>
  );
}
