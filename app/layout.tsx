import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastContainer } from "@/components/ui/Toast";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { UrgeButton } from "@/components/UrgeButton";
import { SyncProvider } from "@/components/SyncProvider";
import { EngagementBootstrap } from "@/components/engagement/EngagementBootstrap";
import { CelebrationManager } from "@/components/celebrations/CelebrationManager";
import { ChallengeWatcher } from "@/components/engagement/ChallengeWatcher";

export const metadata: Metadata = {
  title: "Fake Basket — Shop Without Spending",
  description:
    "Satisfy your shopping urge mindfully. Fake Basket helps you overcome impulse spending through simulated shopping experiences.",
  keywords: ["mindful shopping", "impulse spending", "financial wellness"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fake Basket",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <ToastContainer />
            <PWARegister />
            <InstallPrompt />
            <UrgeButton />
            <SyncProvider />
            <EngagementBootstrap />
            <CelebrationManager />
            <ChallengeWatcher />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
