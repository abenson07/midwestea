export type RemovalOutcome = {
  level: "success" | "warning";
  message: string;
};

export function formatUsd(cents: number): string {
  return (Math.round(cents) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/**
 * Builds the toast wording for a completed removal. `refundedCents` from the route counts every
 * recorded refund, including payments that were not paid through Stripe (those are also listed in
 * `manualRefundNeeded`), so the amount actually sent through Stripe is the difference.
 */
export function describeRemovalOutcome(params: {
  name: string;
  refundPercent: number;
  refundedCents: number;
  manualRefundNeeded: { transactionId: string; amountCents: number }[];
}): RemovalOutcome {
  const { name, refundPercent, refundedCents, manualRefundNeeded } = params;
  if (!(refundPercent > 0)) {
    return { level: "success", message: `Removed ${name}. No refund was issued.` };
  }

  const manualCents = manualRefundNeeded.reduce((sum, m) => sum + m.amountCents, 0);
  const stripeCents = Math.max(0, refundedCents - manualCents);
  const count = manualRefundNeeded.length;
  const payments = `${count} payment${count === 1 ? "" : "s"}`;

  if (count === 0) {
    if (stripeCents <= 0) {
      return { level: "success", message: `Removed ${name}. No refund was issued.` };
    }
    return {
      level: "success",
      message: `Removed ${name}. ${formatUsd(stripeCents)} (${refundPercent}%) was refunded to their card through Stripe.`,
    };
  }

  if (stripeCents > 0) {
    return {
      level: "warning",
      message: `Removed ${name}. ${formatUsd(stripeCents)} was refunded through Stripe. ${formatUsd(manualCents)} across ${payments} was NOT refunded through Stripe and must be refunded by hand.`,
    };
  }

  return {
    level: "warning",
    message: `Removed ${name}. No refund was sent. ${formatUsd(manualCents)} across ${payments} was not paid through Stripe and must be refunded by hand.`,
  };
}
