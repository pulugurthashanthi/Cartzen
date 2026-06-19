"use client";
import Link from "next/link";
import { COLLECTIONS } from "@/data/collections";
import { products } from "@/data/products";

export function CollectionsShowcase() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
            Dream Collections
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Curated for every aspiration</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {COLLECTIONS.map((col) => {
          const count = products.filter(col.filterFn).length;
          return (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] flex flex-col justify-end p-4 transition-transform active:scale-95 hover:scale-[1.02]"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${col.gradient} opacity-90`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-3xl mb-1.5">{col.emoji}</div>
                <p className="font-bold text-white text-sm leading-tight">{col.name}</p>
                <p className="text-white/70 text-xs mt-0.5">{count} items</p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
