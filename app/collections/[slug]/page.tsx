"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCollection } from "@/data/collections";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const collection = getCollection(slug);

  if (!collection) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🗂️</p>
          <h2 className="text-xl font-semibold mb-4">Collection not found</h2>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const collectionProducts = products.filter(collection.filterFn);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Hero */}
      <div className={`bg-gradient-to-r ${collection.gradient} rounded-3xl p-8 mb-8 text-white`}>
        <div className="text-6xl mb-3">{collection.emoji}</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{collection.name}</h1>
        <p className="text-white/80 text-lg">{collection.tagline}</p>
        <p className="text-white/60 text-sm mt-3">
          {collectionProducts.length} curated picks · ₹0 to own them all (obviously)
        </p>
      </div>

      {/* Products */}
      {collectionProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🌫️</p>
          <p>No products found for this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {collectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
