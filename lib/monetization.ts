// Seller monetization config.
//
// v1 collects no real money: every listing is created feeStatus "unpaid" and
// an admin marks it paid/waived after collecting out-of-band (UPI, bank).
// When a payment gateway (Razorpay) is wired in, the checkout happens between
// listing submission and review, and sets feeStatus "paid" server-side.
export const LISTING_FEE_INR = 49;

export const FEE_STATUS_LABELS: Record<string, string> = {
  unpaid: "Fee due",
  paid: "Fee paid",
  waived: "Fee waived",
};

// Shared sanity bound for any product entering the catalog (admin-added or
// seller-submitted) — high enough for real premium goods, low enough to
// catch fat-fingered entries like ₹1,55,55,555.
export const MAX_PRODUCT_PRICE = 10_00_000;
