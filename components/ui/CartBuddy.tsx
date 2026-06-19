"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const MESSAGES = {
  home: [
    "Psst. None of this costs money. Don't tell your wallet. 🤫",
    "I contain ₹0 worth of charges. I am the hero you deserve.",
    "Add everything. Pay nothing. Touch grass afterwards.",
  ],
  cart: [
    "Look at all this stuff you're NOT buying. I'm so proud.",
    "Your bank account is literally crying happy tears right now.",
    "This is the most responsible irresponsible shopping session ever.",
  ],
  celebrating: [
    "YOU DID IT! ₹0 spent! This is a financial revolution!",
    "Your future self is writing you a thank-you note right now.",
    "Nothing was purchased. Everything was gained. Namaste. 🙏",
  ],
  suspicious: [
    "Do you NEED it, or do you want it? (We'll save it either way.)",
    "The urge is temporary. The savings are forever. Probably.",
    "Sleep on it. It'll still be 'in stock' tomorrow. We never run out. 😏",
  ],
  empty: [
    "So empty. So pure. So rich (in spirit, and also savings).",
    "Nothing here yet. Your wallet is thriving. This is fine.",
    "Start shopping! It's free! We can't stress this enough — FREE.",
  ],
};

interface CartBuddyProps {
  mood?: keyof typeof MESSAGES;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CartBuddy({ mood = "home", className, size = "md" }: CartBuddyProps) {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const opts = MESSAGES[mood];
    setMsg(opts[Math.floor(Math.random() * opts.length)]);
  }, [mood]);

  if (!msg) return null;

  const sizeMap = {
    sm: { cart: "w-10 h-10 text-xl", bubble: "text-xs px-3 py-2" },
    md: { cart: "w-14 h-14 text-2xl", bubble: "text-sm px-4 py-2.5" },
    lg: { cart: "w-16 h-16 text-3xl", bubble: "text-sm px-4 py-3" },
  };
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-end gap-3", className)}>
      <div className={cn(
        "rounded-2xl zen-gradient flex items-center justify-center shadow-lg shadow-orange-300/30 flex-shrink-0 animate-bounce-gentle",
        s.cart
      )}>
        🛒
      </div>
      <div className="relative bg-white dark:bg-gray-900 border border-orange-100 dark:border-gray-800 rounded-2xl rounded-bl-sm shadow-md max-w-xs">
        <p className={cn("font-medium text-gray-700 dark:text-gray-300 leading-snug", s.bubble)}>{msg}</p>
        <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white dark:bg-gray-900 border-b border-l border-orange-100 dark:border-gray-800 rotate-[-45deg]" />
      </div>
    </div>
  );
}
