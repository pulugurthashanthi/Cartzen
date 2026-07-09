import type { Product } from "@/types";

// Products the user imported by pasting a store link. Local-first like the
// cart: the full Product object is embedded wherever it's used (cart, orders,
// wishlist), so this store only needs to back the product detail page and
// the "recently imported" list.

const KEY = "cartzen_imported_products";
const MAX_ITEMS = 50;

export interface ImportedDraft {
  title: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  siteName: string;
  sourceUrl: string;
}

function safeGet(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export const importedProductsStorage = {
  get: safeGet,
  find: (id: string): Product | undefined => safeGet().find((p) => p.id === id),
  add: (product: Product) => {
    if (typeof window === "undefined") return;
    try {
      const next = [product, ...safeGet().filter((p) => p.id !== product.id)].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage full or unavailable — product still works via embedded copies
    }
  },
  remove: (id: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(safeGet().filter((p) => p.id !== id)));
    } catch {}
  },
};

export function buildImportedProduct(draft: ImportedDraft): Product {
  return {
    id: `imp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name: draft.title.trim(),
    brand: draft.brand.trim() || draft.siteName,
    price: Math.round(draft.price),
    originalPrice: undefined,
    discount: undefined,
    rating: 0,
    reviewCount: 0,
    image: draft.image.trim(),
    images: draft.image.trim() ? [draft.image.trim()] : [],
    category: "imported",
    subcategory: draft.siteName,
    description: draft.description.trim() || `Imported from ${draft.siteName}`,
    features: [],
    inStock: true,
    badge: undefined,
    tags: ["imported", draft.siteName],
  };
}
