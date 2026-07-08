"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

// fill-mode product image that degrades to a placeholder when the URL is dead,
// instead of showing a broken frame. Use inside a `relative` container.
export function ProductImage({ src, alt, className, sizes, priority }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-blue-50 dark:bg-gray-800">
        <span className="text-3xl">🛍️</span>
        <span className="text-[10px] text-gray-400">Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
