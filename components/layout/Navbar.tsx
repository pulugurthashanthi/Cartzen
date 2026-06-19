"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Moon,
  Sun,
  BarChart2,
  BookOpen,
  Snowflake,
  Package,
  Leaf,
  Menu,
  X,
  Shield,
  LogIn,
  LogOut,
  Sparkles,
  Heart,
  Gift,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Savings", icon: BarChart2 },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/dream-vault", label: "Dream Vault", icon: Sparkles },
  { href: "/cooling-off", label: "Cooling-Off", icon: Snowflake },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAdmin, signIn, signOut, loading } = useAuth();
  const { synced, syncing } = useFirestoreSync();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/92 dark:bg-gray-950/92 backdrop-blur-md shadow-md shadow-orange-100/50 dark:shadow-none border-b border-orange-100 dark:border-gray-800"
          : "bg-white/95 dark:bg-gray-950 border-b border-orange-50 dark:border-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl zen-gradient flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Cart<span className="zen-gradient-text">Zen</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-orange-50/60 dark:hover:bg-gray-800"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/admin"
                    ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-orange-50/60 dark:hover:bg-gray-800"
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2.5"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Link href="/wishlist" className="relative btn-ghost p-2.5" aria-label="Wishlist">
              <Heart className={cn("w-4 h-4", wishlistItems.length > 0 && "fill-rose-500 text-rose-500")} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white animate-fade-in">
                  {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative btn-ghost p-2.5">
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full zen-gradient flex items-center justify-center text-[10px] font-bold text-white animate-fade-in">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  {/* Cloud sync indicator */}
                  <div
                    title={syncing ? "Syncing…" : synced ? "Data synced to cloud" : ""}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      syncing ? "bg-amber-400 animate-pulse" : synced ? "bg-green-400" : "bg-gray-300"
                    )}
                  />
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName ?? "User"}
                      width={28}
                      height={28}
                      className="rounded-full border border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <button
                    onClick={signOut}
                    className="btn-ghost p-2.5"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium zen-gradient text-white hover:opacity-90 transition-opacity"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </button>
              )
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-ghost p-2.5"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1",
                  pathname === link.href
                    ? "bg-zen-50 dark:bg-zen-950 text-zen-700 dark:text-zen-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-1",
                  pathname === "/admin"
                    ? "bg-zen-50 dark:bg-zen-950 text-zen-700 dark:text-zen-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
