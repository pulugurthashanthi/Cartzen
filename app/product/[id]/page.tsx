"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star, ShoppingCart, Snowflake, ChevronLeft, Check,
  Truck, Shield, RotateCcw, MapPin, BadgeCheck, ThumbsUp,
  ChevronRight,
} from "lucide-react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products, reviews } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useCoolingOff } from "@/hooks/useCoolingOff";
import { useDreamVault } from "@/hooks/useDreamVault";
import { recentlyViewedStorage } from "@/lib/storage";
import { trackChallenge } from "@/lib/track";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, DreamVaultCategory } from "@/types";

// ─── Variant logic ────────────────────────────────────────────────────────────
type VariantGroup = { label: string; options: string[] };

function getVariants(product: Product): VariantGroup[] {
  const { category, subcategory } = product;
  if (category === "sarees") {
    return [{ label: "Blouse Size", options: ["32", "34", "36", "38", "40", "42"] }];
  }
  if (category === "kurtis") {
    return [{ label: "Size", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] }];
  }
  if (category === "fashion" || category === "mens") {
    if (subcategory === "Footwear") {
      return [
        { label: "Size (UK)", options: ["6", "7", "8", "9", "10", "11", "12"] },
        { label: "Color", options: ["Black", "White", "Grey", "Navy"] },
      ];
    }
    if (subcategory === "Formal" || subcategory === "Shirts") {
      return [
        { label: "Size", options: ["S", "M", "L", "XL", "XXL"] },
        { label: "Fit", options: ["Regular", "Slim", "Relaxed"] },
      ];
    }
    return [{ label: "Size", options: ["XS", "S", "M", "L", "XL", "XXL"] }];
  }
  if (category === "electronics") {
    if (subcategory === "Smartphones") {
      return [
        { label: "Storage", options: ["128GB", "256GB", "512GB"] },
        { label: "Color", options: ["Phantom Black", "Cream", "Green", "Lavender"] },
      ];
    }
    if (subcategory === "Laptops") {
      return [
        { label: "Storage", options: ["256GB SSD", "512GB SSD", "1TB SSD"] },
        { label: "RAM", options: ["8GB", "16GB", "24GB"] },
      ];
    }
    if (subcategory === "Audio") {
      return [{ label: "Color", options: ["Midnight Black", "Platinum Silver", "Navy Blue", "Stone"] }];
    }
    if (subcategory === "Wearables") {
      return [
        { label: "Color", options: ["Jet Black", "Rose Gold", "Silver", "Olive"] },
        { label: "Strap", options: ["Silicone", "Metal", "Leather"] },
      ];
    }
  }
  return [];
}

// ─── Rating breakdown ─────────────────────────────────────────────────────────
function getRatingBreakdown(rating: number, total: number) {
  // Distribute reviews across stars realistically based on rating
  const r = Math.min(Math.max(rating, 1), 5);
  const raw = [
    Math.round(total * (0.1 + (r - 1) * 0.18)),   // 1★
    Math.round(total * (0.05 + (r - 1) * 0.04)),   // 2★
    Math.round(total * (0.08 + (r - 1) * 0.02)),   // 3★
    Math.round(total * (0.15 + (r - 1) * 0.05)),   // 4★
    0,
  ];
  raw[4] = Math.max(0, total - raw[0] - raw[1] - raw[2] - raw[3]);
  return [5, 4, 3, 2, 1].map((star, i) => ({
    star,
    count: raw[4 - i],
    pct: total > 0 ? Math.round((raw[4 - i] / total) * 100) : 0,
  }));
}

// ─── Pincode delivery ─────────────────────────────────────────────────────────
function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2 + Math.floor(Math.random() * 2));
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

// ─── Firestore normaliser ─────────────────────────────────────────────────────
function normalizeFirestoreProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: (data.name as string) ?? "",
    brand: (data.brand as string) ?? "",
    price: Number(data.price) || 0,
    originalPrice: undefined,
    discount: undefined,
    rating: 4.0,
    reviewCount: 0,
    image: (data.image as string) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    images: [(data.image as string) || ""],
    category: (data.category as string) ?? "electronics",
    subcategory: "",
    description: (data.description as string) ?? "",
    features: [],
    inStock: (data.inStock as boolean) ?? true,
    badge: undefined,
    tags: [(data.category as string) ?? ""],
  };
}

const VAULT_OPTIONS: { id: DreamVaultCategory; label: string; emoji: string }[] = [
  { id: "dream_office", label: "Dream Office", emoji: "🖥️" },
  { id: "dream_home", label: "Dream Home", emoji: "🏠" },
  { id: "dream_travel", label: "Dream Travel", emoji: "✈️" },
  { id: "dream_garage", label: "Dream Garage", emoji: "🚗" },
  { id: "dream_style", label: "Dream Style", emoji: "👗" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const staticProduct = products.find((p) => p.id === params.id);
  const [product, setProduct] = useState<Product | null>(staticProduct ?? null);
  const [loadingProduct, setLoadingProduct] = useState(!staticProduct);
  const { addItem, items } = useCart();
  const { addItem: addToCooling, isInCoolingOff } = useCoolingOff();
  const { addItem: addToVault, removeItem: removeFromVault, isInVault, getVaultCategory } = useDreamVault();
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [pincode, setPincode] = useState("");
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (staticProduct) return;
    async function fetchFromFirestore() {
      try {
        const snap = await getDoc(doc(db, "products", params.id as string));
        if (snap.exists()) {
          setProduct(normalizeFirestoreProduct(snap.id, snap.data() as Record<string, unknown>));
        }
      } catch { /* ignore */ } finally {
        setLoadingProduct(false);
      }
    }
    fetchFromFirestore();
  }, [params.id, staticProduct]);

  useEffect(() => {
    if (!params.id) return;
    setRecentIds(recentlyViewedStorage.get().filter((id) => id !== params.id));
    recentlyViewedStorage.add(params.id as string);
    trackChallenge("browse");
  }, [params.id]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zen-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <Link href="/" className="btn-primary mt-4">Browse Products</Link>
        </div>
      </div>
    );
  }

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const inCart = items.some((i) => i.productId === product.id);
  const inCooling = isInCoolingOff(product.id);
  const stockCount = 99;
  const ratingBreakdown = getRatingBreakdown(product.rating, product.reviewCount);
  const similarProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  const recentProducts = recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 6) as Product[];

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  function checkPincode() {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) return;
    setDeliveryResult(getDeliveryDate());
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-zen-600 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Images ── */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Image
              src={product.images[activeImage] || product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.discount && (
              <div className="absolute top-4 left-4 zen-gradient text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg">
                {product.discount}% OFF
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                    activeImage === i ? "border-zen-500" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-zen-600 dark:text-zen-400 uppercase tracking-wider mb-1">
              {product.brand}
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                {product.rating}
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-sm text-gray-500">
                {product.reviewCount.toLocaleString()} ratings & reviews
              </span>
              {product.badge === "bestseller" && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  🏆 #1 Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-green-600 font-semibold text-sm">{product.discount}% off</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400">Inclusive of all taxes</p>
          </div>


          {/* CartZen tip */}
          <div className="p-3 rounded-xl bg-zen-50 dark:bg-zen-950/50 border border-zen-100 dark:border-zen-900 text-sm text-zen-700 dark:text-zen-400">
            💡 <span className="font-medium">CartZen tip:</span> Place this order to save{" "}
            <span className="font-bold">{formatPrice(product.price)}</span> — ₹0 will actually leave your account. 😇
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{product.description}</p>

          {/* Features */}
          {product.features.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-zen-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variant selectors */}
          {(() => {
            const variantGroups = getVariants(product);
            if (variantGroups.length === 0) return null;
            return (
              <div className="space-y-4">
                {variantGroups.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{group.label}</p>
                      {selectedVariants[group.label] && (
                        <p className="text-xs font-medium text-zen-600 dark:text-zen-400">
                          {selectedVariants[group.label]} selected
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt) => {
                        const active = selectedVariants[group.label] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [group.label]: opt }))}
                            className={cn(
                              "px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 active:scale-95",
                              active
                                ? "zen-gradient text-white border-transparent shadow-md shadow-zen-500/20"
                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-zen-400 dark:hover:border-zen-600 hover:text-zen-600 dark:hover:text-zen-400"
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg font-medium"
              >−</button>
              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg font-medium"
              >+</button>
            </div>
          </div>

          {/* Add to cart + Cooling-off */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95",
                addedToCart
                  ? "bg-zen-500 text-white"
                  : inCart
                  ? "bg-zen-100 dark:bg-zen-900/50 text-zen-700 dark:text-zen-400 border-2 border-zen-200 dark:border-zen-800"
                  : "btn-primary"
              )}
            >
              {addedToCart ? (
                <><Check className="w-4 h-4" />Added!</>
              ) : (
                <><ShoppingCart className="w-4 h-4" />{inCart ? "Add More" : "Add to Cart"}</>
              )}
            </button>
            <button
              onClick={() => addToCooling(product)}
              disabled={inCooling}
              title={inCooling ? "Already in cooling-off list" : "Add to cooling-off list"}
              className={cn(
                "p-3.5 rounded-xl transition-all duration-200 active:scale-95 border-2",
                inCooling
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-500 border-blue-200 dark:border-blue-800"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              )}
            >
              <Snowflake className="w-5 h-5" />
            </button>
          </div>

          {inCooling && (
            <p className="text-xs text-blue-500 text-center">
              ❄️ In cooling-off list — we&apos;ll check if you still want this after 24h
            </p>
          )}

          {/* Dream Vault */}
          <div className="relative">
            {isInVault(product.id) ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900">
                <span className="text-lg">{VAULT_OPTIONS.find(v => v.id === getVaultCategory(product.id))?.emoji ?? "✨"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400">
                    Saved to {VAULT_OPTIONS.find(v => v.id === getVaultCategory(product.id))?.label}
                  </p>
                  <button onClick={() => removeFromVault(product.id)} className="text-xs text-fuchsia-500 hover:text-fuchsia-700 transition-colors">
                    Remove from vault
                  </button>
                </div>
                <Link href="/dream-vault" className="text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:underline flex-shrink-0">
                  View vault →
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setShowVaultPicker((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-fuchsia-200 dark:border-fuchsia-900 text-fuchsia-600 dark:text-fuchsia-400 text-sm font-medium hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 transition-colors"
              >
                ✨ Save to Dream Vault
              </button>
            )}
            {showVaultPicker && !isInVault(product.id) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl p-2 z-10">
                {VAULT_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { addToVault(product, v.id); setShowVaultPicker(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-left"
                  >
                    <span className="text-xl">{v.emoji}</span>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pincode delivery checker */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-zen-500" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Check Delivery</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/, "")); setDeliveryResult(null); }}
                  className="input pl-9 text-sm py-2"
                />
              </div>
              <button
                onClick={checkPincode}
                disabled={pincode.length !== 6}
                className="px-4 py-2 rounded-xl text-sm font-semibold zen-gradient text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Check
              </button>
            </div>
            {deliveryResult && (
              <div className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Delivery by {deliveryResult}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Free simulated delivery • No charge ever</p>
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On all orders" },
              { icon: Shield, label: "100% Safe", sub: "No real payments" },
              { icon: RotateCcw, label: "Easy Returns", sub: "Simulated only" },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <b.icon className="w-5 h-5 text-zen-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{b.label}</p>
                <p className="text-[10px] text-gray-400">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ratings & Reviews ── */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold mb-8">Ratings & Reviews</h2>
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: summary */}
          <div className="md:col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
            <p className="text-7xl font-black text-gray-900 dark:text-gray-100 leading-none mb-2">
              {product.rating}
            </p>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn("w-5 h-5", i <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700")} />
              ))}
            </div>
            <p className="text-sm text-gray-500">{product.reviewCount.toLocaleString()} ratings</p>

            <div className="w-full mt-6 space-y-2">
              {ratingBreakdown.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-gray-500">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-400">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: review cards */}
          <div className="md:col-span-3 space-y-4">
            {productReviews.length > 0 ? (
              productReviews.map((review) => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full zen-gradient flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{review.user}</p>
                          <BadgeCheck className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xs text-green-600 font-medium">Verified Purchase</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0">
                      {review.rating}<Star className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{review.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.body}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-zen-500 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful ({review.helpful})
                    </button>
                    <span className="text-xs text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                </div>
              ))
            ) : (
              /* Generic review placeholders when no real reviews exist */
              [
                { name: "Satisfied Customer", initial: "S", rating: 5, title: "Exactly as described!", body: "Quality is great, delivery was fast. Very happy with this purchase. Would definitely recommend to friends and family.", helpful: 42 },
                { name: "Regular Buyer", initial: "R", rating: 4, title: "Good value for money", body: "Solid product at this price point. Packaging was neat. Only minor quibble is the colour was slightly different from the photos.", helpful: 28 },
              ].map((r, i) => (
                <div key={i} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full zen-gradient flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {r.initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{r.name}</p>
                          <BadgeCheck className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xs text-green-600 font-medium">Verified Purchase</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0">
                      {r.rating}<Star className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{r.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{r.body}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-zen-500 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful ({r.helpful})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Similar Products ── */}
      {similarProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Similar Products</h2>
            <Link href={`/?category=${product.category}`} className="flex items-center gap-1 text-sm font-medium text-zen-600 dark:text-zen-400 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="card-hover group overflow-hidden">
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="200px" />
                  {p.discount && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-md">
                      {p.discount}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{p.brand}</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1">{p.name}</p>
                  <p className="text-sm font-bold">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Recently Viewed ── */}
      {recentProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentProducts.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="card-hover group overflow-hidden">
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="200px" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{p.brand}</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1">{p.name}</p>
                  <p className="text-sm font-bold">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
