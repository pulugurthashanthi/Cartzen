"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Link2, Loader2, ShoppingCart, Heart, Check, Sparkles, PencilLine } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { showToast } from "@/components/ui/Toast";
import { haptics } from "@/lib/haptics";
import { importedProductsStorage, buildImportedProduct, type ImportedDraft } from "@/lib/importedProducts";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";

const EMPTY_DRAFT: ImportedDraft = {
  title: "",
  brand: "",
  price: 0,
  image: "",
  description: "",
  siteName: "",
  sourceUrl: "",
};

type Phase = "url" | "fetching" | "edit" | "done";

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("url");
  const [draft, setDraft] = useState<ImportedDraft>(EMPTY_DRAFT);
  const [fetchNote, setFetchNote] = useState<string | null>(null);
  const [added, setAdded] = useState<Product | null>(null);
  const { addItem } = useCart();
  const { addItem: addToWishlist } = useWishlist();

  // Prefill from ?url= (search-box paste, future share-target) and auto-fetch.
  // Read from window instead of useSearchParams to avoid a Suspense boundary.
  const autoFetched = useRef(false);
  useEffect(() => {
    if (autoFetched.current) return;
    const param = new URLSearchParams(window.location.search).get("url");
    if (param && /^https?:\/\//i.test(param)) {
      autoFetched.current = true;
      setUrl(param);
      fetchPreview(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreview = async (override?: string) => {
    const trimmed = (override ?? url).trim();
    if (!trimmed) return;
    setPhase("fetching");
    setFetchNote(null);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchNote(data.error ?? "Couldn't read that page — fill in the details yourself.");
        setDraft({ ...EMPTY_DRAFT, sourceUrl: trimmed, siteName: hostnameOf(trimmed) });
      } else {
        setDraft(data);
        if (!data.title && !data.price) {
          setFetchNote("The page didn't share product details — fill them in yourself.");
        } else if (!data.price) {
          setFetchNote("Got the product, but not the price — add it below.");
        }
      }
    } catch {
      setFetchNote("Couldn't read that page — fill in the details yourself.");
      setDraft({ ...EMPTY_DRAFT, sourceUrl: trimmed, siteName: hostnameOf(trimmed) });
    }
    setPhase("edit");
  };

  const canSave = draft.title.trim().length > 0 && draft.price > 0;

  const save = (destination: "cart" | "wishlist") => {
    if (!canSave) return;
    const product = buildImportedProduct(draft);
    importedProductsStorage.add(product);
    if (destination === "cart") {
      addItem(product);
      showToast("Added to your fake basket 🛒", "success");
    } else {
      addToWishlist(product);
      showToast("Saved to wishlist", "info");
    }
    haptics.success();
    setAdded(product);
    setPhase("done");
  };

  const reset = () => {
    setUrl("");
    setDraft(EMPTY_DRAFT);
    setAdded(null);
    setFetchNote(null);
    setPhase("url");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl zen-gradient flex items-center justify-center">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Import from a link</h1>
          <p className="text-xs text-gray-400">Tempted by something online? Fake-buy it instead.</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Paste a product link from Amazon, Flipkart, Myntra — anywhere. We&apos;ll pull in the
        details so you can add it to your basket and bank the savings.
      </p>

      {/* URL input */}
      {(phase === "url" || phase === "fetching") && (
        <div className="card p-4">
          <label htmlFor="import-url" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Product link
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="import-url"
              type="url"
              inputMode="url"
              placeholder="https://www.amazon.in/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPreview()}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500"
              autoFocus
            />
            <button
              onClick={() => fetchPreview()}
              disabled={!url.trim() || phase === "fetching"}
              className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {phase === "fetching" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Reading…
                </>
              ) : (
                "Fetch"
              )}
            </button>
          </div>
          <button
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setPhase("edit");
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-zen-600 transition-colors"
          >
            <PencilLine className="w-3.5 h-3.5" /> Or enter details manually
          </button>
        </div>
      )}

      {/* Edit / confirm */}
      {phase === "edit" && (
        <div className="card p-4 animate-fade-in">
          {fetchNote && (
            <p className="mb-4 text-xs px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              {fetchNote}
            </p>
          )}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              {draft.image ? (
                <ProductImage src={draft.image} alt={draft.title || "Product"} className="object-cover" sizes="96px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🛍️</div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Product name"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zen-500"
              />
              <div className="flex gap-2">
                <input
                  value={draft.brand}
                  onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                  placeholder="Brand"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500"
                />
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={draft.price || ""}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                    placeholder="Price"
                    className="w-full pl-7 pr-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-zen-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <input
            value={draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            placeholder="Image URL (optional)"
            className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-zen-500"
          />

          {draft.siteName && (
            <p className="mt-3 text-[11px] text-gray-400">
              From <span className="font-medium">{draft.siteName}</span>
            </p>
          )}

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => save("cart")}
              disabled={!canSave}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors",
                canSave ? "btn-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to fake basket {canSave && `· ${formatPrice(draft.price)}`}
            </button>
            <button
              onClick={() => save("wishlist")}
              disabled={!canSave}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-pink-600 transition-colors disabled:opacity-50"
            >
              <Heart className="w-4 h-4" /> Wishlist
            </button>
          </div>
          <button onClick={reset} className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ← Start over
          </button>
        </div>
      )}

      {/* Done */}
      {phase === "done" && added && (
        <div className="card p-6 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-3">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <p className="font-display text-xl font-bold mb-1">That urge? Captured.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            <span className="font-semibold">{added.name}</span> is in your basket —{" "}
            {formatPrice(added.price)} you didn&apos;t spend.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/cart" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
              Go to basket
            </Link>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:border-zen-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Import another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function hostnameOf(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
