import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fake Basket — Beat impulse shopping",
    short_name: "Fake Basket",
    description:
      "Simulate the purchase, cool off, and keep the money you didn't spend.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#3b82f6",
    orientation: "portrait",
    categories: ["shopping", "lifestyle", "finance"],
    shortcuts: [
      {
        name: "I have an urge",
        short_name: "Urge",
        description: "Catch a buying impulse before it becomes a purchase",
        url: "/urge",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Import a product link",
        short_name: "Import",
        description: "Paste a store link and fake-buy it",
        url: "/import",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
