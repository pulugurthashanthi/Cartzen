import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  cartStorage,
  coolingOffStorage,
  ordersStorage,
  journalStorage,
  savingsStorage,
  wishlistStorage,
  recentlyViewedStorage,
  dreamVaultStorage,
} from "@/lib/storage";
import type { CartItem, CoolingOffItem, Order, JournalEntry, WishlistItem, DreamVaultItem } from "@/types";

interface FirestoreSnapshot {
  cart: CartItem[];
  coolingOff: CoolingOffItem[];
  orders: Order[];
  journal: JournalEntry[];
  savings: number;
  wishlist: WishlistItem[];
  recentlyViewed: string[];
  dreamVault: DreamVaultItem[];
  syncedAt: string;
}

function docRef(uid: string) {
  return doc(db, "users", uid, "data", "cartzen");
}

/** Read all localStorage keys into a snapshot object */
export function readLocalSnapshot(): Omit<FirestoreSnapshot, "syncedAt"> {
  return {
    cart: cartStorage.get(),
    coolingOff: coolingOffStorage.get(),
    orders: ordersStorage.get(),
    journal: journalStorage.get(),
    savings: savingsStorage.get(),
    wishlist: wishlistStorage.get(),
    recentlyViewed: recentlyViewedStorage.get(),
    dreamVault: dreamVaultStorage.get(),
  };
}

/** Push current localStorage state to Firestore */
export async function pushToFirestore(uid: string): Promise<void> {
  try {
    const snapshot: FirestoreSnapshot = {
      ...readLocalSnapshot(),
      syncedAt: new Date().toISOString(),
    };
    await setDoc(docRef(uid), snapshot, { merge: false });
  } catch {
    // fail silently — localStorage is still intact
  }
}

/** Pull from Firestore and merge into localStorage */
export async function pullAndMerge(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(docRef(uid));
    if (!snap.exists()) {
      // No cloud data — push local data up so it's backed up
      await pushToFirestore(uid);
      return false;
    }

    const remote = snap.data() as FirestoreSnapshot;
    const local = readLocalSnapshot();

    // Orders: union by ID, remote wins on conflict
    const orderMap = new Map<string, Order>();
    local.orders.forEach((o) => orderMap.set(o.id, o));
    remote.orders.forEach((o) => orderMap.set(o.id, o));
    const mergedOrders = [...orderMap.values()].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
    );

    // Journal: union by ID
    const journalMap = new Map<string, JournalEntry>();
    local.journal.forEach((j) => journalMap.set(j.id, j));
    remote.journal.forEach((j) => journalMap.set(j.id, j));
    const mergedJournal = [...journalMap.values()].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Cart: remote wins (most recent session)
    const mergedCart = remote.cart.length > 0 ? remote.cart : local.cart;

    // Wishlist: union by productId
    const wishMap = new Map<string, WishlistItem>();
    local.wishlist.forEach((w) => wishMap.set(w.productId, w));
    remote.wishlist.forEach((w) => wishMap.set(w.productId, w));

    // CoolingOff: union by productId, remote wins
    const coolMap = new Map<string, CoolingOffItem>();
    local.coolingOff.forEach((c) => coolMap.set(c.productId, c));
    remote.coolingOff.forEach((c) => coolMap.set(c.productId, c));

    // DreamVault: union by productId
    const vaultMap = new Map<string, DreamVaultItem>();
    local.dreamVault.forEach((d) => vaultMap.set(d.productId, d));
    remote.dreamVault.forEach((d) => vaultMap.set(d.productId, d));

    // Savings: take the higher value (local actions may have happened offline)
    const mergedSavings = Math.max(local.savings, remote.savings);

    // RecentlyViewed: merge and deduplicate, remote first
    const rvSeen = new Set<string>();
    const mergedRV: string[] = [];
    [...remote.recentlyViewed, ...local.recentlyViewed].forEach((id) => {
      if (!rvSeen.has(id)) { rvSeen.add(id); mergedRV.push(id); }
    });

    // Write merged data back to localStorage
    ordersStorage.set(mergedOrders);
    journalStorage.set(mergedJournal);
    cartStorage.set(mergedCart);
    wishlistStorage.set([...wishMap.values()]);
    coolingOffStorage.set([...coolMap.values()]);
    dreamVaultStorage.set([...vaultMap.values()]);
    savingsStorage.reset();
    // Re-add savings as a raw set (reset doesn't write the merged value)
    if (typeof window !== "undefined") {
      try { localStorage.setItem("cartzen_savings", JSON.stringify(mergedSavings)); } catch {}
    }
    if (typeof window !== "undefined") {
      try { localStorage.setItem("cartzen_recently_viewed", JSON.stringify(mergedRV.slice(0, 12))); } catch {}
    }

    return true;
  } catch {
    return false;
  }
}
