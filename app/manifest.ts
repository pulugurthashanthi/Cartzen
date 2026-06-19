import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CartZen — Shop Without Spending",
    short_name: "CartZen",
    description:
      "Satisfy your shopping urge mindfully. Fill a cart, feel the dopamine, spend ₹0.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbf8",
    theme_color: "#f97316",
    orientation: "portrait",
    categories: ["shopping", "lifestyle", "finance"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
