"use client";
import { useEffect } from "react";
import { useRewards } from "@/hooks/useRewards";

// Registers the daily visit (drives the Mindful Streak) once per app load.
export function EngagementBootstrap() {
  const { registerVisit } = useRewards();
  useEffect(() => {
    // small delay so it runs after Firestore pull/merge has a chance to land
    const t = setTimeout(() => registerVisit(), 1500);
    return () => clearTimeout(t);
  }, [registerVisit]);
  return null;
}
