"use client";
import { useEffect } from "react";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";
import { useAuth } from "@/contexts/AuthContext";

export function SyncProvider() {
  const { syncing, synced } = useFirestoreSync();
  const { user } = useAuth();

  // After a successful pull-and-merge, notify all hooks to re-read localStorage
  useEffect(() => {
    if (synced) {
      window.dispatchEvent(new Event("cartzen:synced"));
    }
  }, [synced]);

  // Show a subtle banner while syncing on login
  if (!user || !syncing) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg animate-fade-in">
      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      Syncing your data…
    </div>
  );
}
