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
