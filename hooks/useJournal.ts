"use client";
import { useState, useEffect, useCallback } from "react";
import { journalStorage } from "@/lib/storage";
import type { JournalEntry, ShoppingReason } from "@/types";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setEntries(journalStorage.get());
  }, []);

  const addEntry = useCallback((reason: ShoppingReason, note?: string): JournalEntry => {
    const entry: JournalEntry = {
      id: `j_${Date.now()}`,
      reason,
      timestamp: new Date().toISOString(),
      note,
    };
    journalStorage.add(entry);
    setEntries((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const reasonCounts = entries.reduce((acc, e) => {
    acc[e.reason] = (acc[e.reason] || 0) + 1;
    return acc;
  }, {} as Record<ShoppingReason, number>);

  return { entries, addEntry, reasonCounts };
}
