import type { Order, OrderStatus } from "@/types";

// Real-time delivery progression. Status is DERIVED from how long ago the order
// was placed, so a package advances even while the app is closed — when the user
// returns, they discover progress happened while they were away.
//
// (In a future real backend, a cron/worker would write these transitions and
// push notifications server-side. The thresholds below are the contract.)
const STAGE_OFFSETS: { status: OrderStatus; ms: number }[] = [
  { status: "placed", ms: 0 },
  { status: "packed", ms: 60_000 },           // +1 min
  { status: "shipped", ms: 3 * 60_000 },      // +3 min
  { status: "out_for_delivery", ms: 6 * 60_000 }, // +6 min
  { status: "delivered", ms: 10 * 60_000 },   // +10 min
];

export function computeStatus(placedAt: string, now: number = Date.now()): OrderStatus {
  const elapsed = now - new Date(placedAt).getTime();
  let status: OrderStatus = "placed";
  for (const stage of STAGE_OFFSETS) {
    if (elapsed >= stage.ms) status = stage.status;
  }
  return status;
}

// Timestamp a stage transition would have happened (placedAt + offset).
export function stageTimestamp(placedAt: string, status: OrderStatus): string {
  const offset = STAGE_OFFSETS.find((s) => s.status === status)?.ms ?? 0;
  return new Date(new Date(placedAt).getTime() + offset).toISOString();
}

// Milliseconds until the next stage (or 0 if delivered).
export function msToNextStage(placedAt: string, now: number = Date.now()): number {
  const elapsed = now - new Date(placedAt).getTime();
  for (const stage of STAGE_OFFSETS) {
    if (elapsed < stage.ms) return stage.ms - elapsed;
  }
  return 0;
}

const ORDER = STAGE_OFFSETS.map((s) => s.status);

// Recompute status + backfill statusHistory for a single order.
export function progressOrder(order: Order, now: number = Date.now()): { order: Order; changed: boolean } {
  const derived = computeStatus(order.placedAt, now);
  if (derived === order.status) return { order, changed: false };

  // Backfill any history entries between the old and new status with synthetic timestamps.
  const reachedIdx = ORDER.indexOf(derived);
  const history = [...order.statusHistory];
  for (let i = 0; i <= reachedIdx; i++) {
    const st = ORDER[i];
    if (!history.find((h) => h.status === st)) {
      history.push({ status: st, timestamp: stageTimestamp(order.placedAt, st) });
    }
  }
  history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return { order: { ...order, status: derived, statusHistory: history }, changed: true };
}

// Progress a list; returns the new list and whether anything changed.
export function progressOrders(orders: Order[], now: number = Date.now()): { orders: Order[]; changed: boolean } {
  let changed = false;
  const next = orders.map((o) => {
    const res = progressOrder(o, now);
    if (res.changed) changed = true;
    return res.order;
  });
  return { orders: next, changed };
}
