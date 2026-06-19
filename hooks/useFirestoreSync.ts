"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { pushToFirestore, pullAndMerge } from "@/lib/firestoreSync";

const PUSH_INTERVAL_MS = 15_000; // push every 15s while logged in

export function useFirestoreSync() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      // Clear interval when signed out
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSynced(false);
      return;
    }

    const uid = user.uid;

    // Pull on login and merge into localStorage
    setSyncing(true);
    pullAndMerge(uid).then(() => {
      setSyncing(false);
      setSynced(true);
      // Notify all hooks to refresh from localStorage
      window.dispatchEvent(new Event("cartzen:synced"));
    });

    // Push every 15 seconds
    intervalRef.current = setInterval(() => {
      pushToFirestore(uid);
    }, PUSH_INTERVAL_MS);

    // Push on tab blur (user switching away)
    const onBlur = () => pushToFirestore(uid);
    window.addEventListener("blur", onBlur);

    // Push on page unload
    const onUnload = () => pushToFirestore(uid);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [user]);

  return { synced, syncing };
}
