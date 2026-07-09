import { Hero } from "@/components/product/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewedRow } from "@/components/product/RecentlyViewedRow";
import { DreamStrip } from "@/components/product/DreamStrip";
import { RecommendedRow } from "@/components/product/RecommendedRow";
import { HomeDashboardRow } from "@/components/product/HomeDashboardRow";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Products first — personalization rows follow the grid */}
      <ProductGrid />
      <HomeDashboardRow />
      <DreamStrip />
      <RecommendedRow />
      <RecentlyViewedRow />
    </>
  );
}
