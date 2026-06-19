import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "CartZen — Shop Without Spending",
  description:
    "Satisfy your shopping urge mindfully. CartZen helps you overcome impulse spending through simulated shopping experiences.",
  keywords: ["mindful shopping", "impulse spending", "financial wellness"],
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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
