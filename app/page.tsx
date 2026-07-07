import { Suspense } from "react";
import { Hero } from "@/components/product/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FlashSaleBanner } from "@/components/product/FlashSaleBanner";
import { RecentlyViewedRow } from "@/components/product/RecentlyViewedRow";
import { DreamStrip } from "@/components/product/DreamStrip";
import { TodaysDeals } from "@/components/product/TodaysDeals";
import { RecommendedRow } from "@/components/product/RecommendedRow";
import { DailyHub } from "@/components/engagement/DailyHub";
import { RetentionBanners } from "@/components/engagement/RetentionBanners";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RetentionBanners />
      <DailyHub />
      <FlashSaleBanner />
      <TodaysDeals />
      {/* Products first — personalization rows follow the grid */}
      <Suspense fallback={null}>
        <ProductGrid />
      </Suspense>
      <DreamStrip />
      <RecommendedRow />
      <RecentlyViewedRow />
    </>
  );
}
