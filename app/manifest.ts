import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FakeBasket — Shop Without Spending",
    short_name: "FakeBasket",
    description:
      "Satisfy your shopping urge mindfully. Fill a cart, feel the dopamine, spend ₹0.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#3b82f6",
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
