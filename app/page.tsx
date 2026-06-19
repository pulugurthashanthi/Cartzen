import { Hero } from "@/components/product/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FlashSaleBanner } from "@/components/product/FlashSaleBanner";
import { RecentlyViewedRow } from "@/components/product/RecentlyViewedRow";
import { CollectionsShowcase } from "@/components/product/CollectionsShowcase";
import { TodaysDeals } from "@/components/product/TodaysDeals";
import { RecommendedRow } from "@/components/product/RecommendedRow";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FlashSaleBanner />
      <TodaysDeals />
      <CollectionsShowcase />
      <RecommendedRow />
      <RecentlyViewedRow />
      <ProductGrid />
    </>
  );
}
