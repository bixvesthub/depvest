// Platform economics. Every value starts unconfigured (null / empty) until an admin
// reviews and applies verified official terms.
export type Terms = {
  apy: { Cash: number | null; Cloud: number | null; Digital: number | null };
  taskReward: { min: number; max: number } | null;
  fees: {
    deposit: string | null;
    withdrawal: string | null;
    performance: string | null;
    rebalance: string | null;
  };
  faqs: Array<{ q: string; a: string }>;
  verifiedAt: string | null;
};

export const EMPTY_TERMS: Terms = {
  apy: { Cash: null, Cloud: null, Digital: null },
  taskReward: null,
  fees: { deposit: null, withdrawal: null, performance: null, rebalance: null },
  faqs: [],
  verifiedAt: null,
};

export const UNCONFIGURED = "Unconfigured";
export const pct = (n: number | null) => (n == null ? UNCONFIGURED : `${n.toFixed(2)}%`);
export const rewardRange = (r: Terms["taskReward"]) =>
  r ? `$${r.min.toFixed(2)} – $${r.max.toFixed(2)}` : UNCONFIGURED;

// Official terms from the product spec (Two-Path Onboarding document).
export const DEFAULT_TERMS: Terms = {
  apy: { Cash: 4.65, Cloud: 11.4, Digital: 6.2 },
  taskReward: { min: 0.1, max: 0.3 },
  fees: {
    deposit: "Free",
    withdrawal: "Free standard · 1.5% instant",
    performance: "10% of net positive yield",
    rebalance: "Free",
  },
  faqs: [],
  verifiedAt: "2026-10-06",
};
