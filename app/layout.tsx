import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastContainer } from "@/components/ui/Toast";
import { PWARegister } from "@/components/PWARegister";
import { SyncProvider } from "@/components/SyncProvider";
import { EngagementBootstrap } from "@/components/engagement/EngagementBootstrap";
import { CelebrationManager } from "@/components/celebrations/CelebrationManager";
import { ChallengeWatcher } from "@/components/engagement/ChallengeWatcher";

export const metadata: Metadata = {
  title: "CartZen — Shop Without Spending",
  description:
    "Satisfy your shopping urge mindfully. CartZen helps you overcome impulse spending through simulated shopping experiences.",
  keywords: ["mindful shopping", "impulse spending", "financial wellness"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CartZen",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
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
