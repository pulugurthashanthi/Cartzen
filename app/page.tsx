import { Hero } from "@/components/product/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FlashSaleBanner } from "@/components/product/FlashSaleBanner";
import { RecentlyViewedRow } from "@/components/product/RecentlyViewedRow";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FlashSaleBanner />
      <RecentlyViewedRow />
      <ProductGrid />
    </>
  );
}
