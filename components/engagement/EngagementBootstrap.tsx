"use client";
import { useEffect } from "react";
import { useRewards } from "@/hooks/useRewards";
import { trackSessionOnce } from "@/lib/analytics";

// Registers the daily visit (drives the Mindful Streak) once per app load.
export function EngagementBootstrap() {
  const { registerVisit } = useRewards();
  useEffect(() => {
    // small delay so it runs after Firestore pull/merge has a chance to land
    const t = setTimeout(() => registerVisit(), 1500);
    // Log a session once per tab — powers WAU / visit counts even if the
    // user takes no other tracked action this visit.
    trackSessionOnce();
    return () => clearTimeout(t);
  }, [registerVisit]);
  return null;
}
