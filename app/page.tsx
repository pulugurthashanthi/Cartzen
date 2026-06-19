import { Hero } from "@/components/product/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FlashSaleBanner } from "@/components/product/FlashSaleBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FlashSaleBanner />
      <ProductGrid />
    </>
  );
}
