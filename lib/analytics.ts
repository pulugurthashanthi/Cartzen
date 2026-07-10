import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// Behavior-change event pipeline.
//
// Why this exists: nearly every metric that proves Fake Basket actually
// changes spending behavior (urges intervened, cool-offs completed, money not
// spent, wishes that faded) is already computed — but it lived only in each
// user's localStorage and never came back. This logs the moments-that-matter
// to a Firestore `events` collection so they can be aggregated across users
// in the admin Metrics tab. It is deliberately fire-and-forget: analytics must
// never block, slow, or break a user interaction.
//
// Seed-stage tradeoff: events are written client-side to a public-create
// collection (rules allow create for anyone, read for admin only). That's
// enough to prove the funnel; a later step would move writes behind a server
// endpoint with an admin SDK to prevent write abuse.

export type AnalyticsEvent =
  | { name: "session" }
  // Urge check-in flow (/urge)
  | { name: "urge_started" }
  | { name: "urge_resolved"; outcome: "surfed" | "redirected"; reason?: string }
  // A simulated purchase went through checkout
  | { name: "fake_order"; amount: number; items: number }
  // Cooling-off list
  | { name: "cooloff_added"; days: number }
  | { name: "cooloff_resolved"; stillWanted: boolean; heldHours: number }
  // Wishlist maturation ("still want it?" check)
  | { name: "wish_faded"; amount: number; waitedDays: number }
  | { name: "wish_kept" };

export type EventName = AnalyticsEvent["name"];

const ANON_KEY = "fb_anon_id";

// Stable per-browser id so signed-out activity still attributes to one "user"
// across sessions (needed for WAU / per-user metrics before sign-in).
function anonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = `anon_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "anon_unknown";
  }
}

function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    const signedInUid = auth.currentUser?.uid ?? null;
    void addDoc(collection(db, "events"), {
      ...event,
      uid: signedInUid ?? anonId(),
      anon: !signedInUid,
      day: todayStr(),
      ts: serverTimestamp(),
    }).catch(() => {
      // Swallow — a dropped analytics write must never surface to the user.
    });
  } catch {
    // never throw from instrumentation
  }
}

// Fire at most once per browser tab session, so "session" approximates a visit
// even when the user takes no other tracked action.
export function trackSessionOnce(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem("fb_session_logged")) return;
    sessionStorage.setItem("fb_session_logged", "1");
  } catch {
    // if sessionStorage is unavailable, fall through and log anyway
  }
  trackEvent({ name: "session" });
}
