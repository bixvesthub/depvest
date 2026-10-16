// Configured display values. They are not evidence of live rates, fees, or services.
export type Terms = {
  apy: { Cash: number | null; Cloud: number | null; Digital: number | null };
  taskReward: { min: number; max: number } | null;
  fees: {
    deposit: string | null;
    withdrawal: string | null;
    performance: string | null;
    rebalance: string | null;
  };
  faqs: Array<{ category: string; q: string; a: string }>;
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

// Initial dashboard configuration. Verify values against governing product terms before launch.
export const DEFAULT_TERMS: Terms = {
  apy: { Cash: 4.65, Cloud: 11.4, Digital: 6.2 },
  taskReward: { min: 0.1, max: 0.3 },
  fees: {
    deposit: "Free",
    withdrawal: "Free standard · 1.5% instant",
    performance: "10% of net positive yield",
    rebalance: "Free",
  },
  faqs: [
    {
      category: "Strategies & yield",
      q: "How do the DepVest strategies seek to generate yield?",
      a: "DepVest offers three strategy types: Treasury cash seeking government-debt interest, AI cloud compute seeking hardware-rental revenue, and blue-chip digital assets seeking staking and protocol rewards. Each carries its own market, operational, and liquidity risks.",
    },
    {
      category: "Strategies & yield",
      q: "Are the displayed yields guaranteed or fixed?",
      a: "No. The configured display rates are 4.65% for Cash, 11.40% for Cloud, and 6.20% for Digital. They are not live rate feeds or promises of returns. Actual strategy returns can change, and investments can lose value.",
    },
    {
      category: "Strategies & yield",
      q: "When is yield compounded or credited?",
      a: "Treasury cash shows daily compounding, AI compute pays at the end of each 30-day epoch, and digital assets accrue flexibly with a 7-day unstaking period. Projections on the Portfolio page are estimates, not guarantees.",
    },
    {
      category: "Fees & eligibility",
      q: "What fees are shown in the configured fee schedule?",
      a: "The configured values are: deposits — Free; rebalancing — Free; performance — 10% of net positive yield; standard withdrawals — Free; instant withdrawals — 1.5%. Network gas is paid separately from your wallet.",
    },
    {
      category: "Fees & eligibility",
      q: "Is there a minimum deposit or lock-up period?",
      a: "No minimum deposit is configured. Treasury cash has no lock, AI compute runs in 30-day epochs, and digital assets have a 7-day unstaking period. Deposits cannot exceed your wallet balance.",
    },
    {
      category: "Deposits & withdrawals",
      q: "What is the difference between standard and instant withdrawals?",
      a: "Standard withdrawals are free and settle T+1. Instant withdrawals settle express with a 1.5% fee deducted from the amount you receive. Both show as Clearing in your ledger until settled.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Which networks and currencies are supported?",
      a: "DepVest supports USDC on Base and Ethereum. Gas is paid in your wallet. Always confirm the network in your wallet before signing.",
    },
    {
      category: "Active Earn",
      q: "How does Active Earn work?",
      a: "Active Earn offers eight task types such as product labelling, summary review, and content screening. Each accepted task pays $0.10–$0.30 depending on its type, with no capital required.",
    },
    {
      category: "Active Earn",
      q: "What are the accuracy and session limits for tasks?",
      a: "A task is accepted at 70% accuracy or higher. You can make up to five task attempts per session, one per task type. Limits reset each session.",
    },
    {
      category: "Active Earn",
      q: "When are Active Earn rewards paid?",
      a: "Accepted work is credited to your Available Cash and recorded in your ledger with a reference ID once it clears verification.",
    },
    {
      category: "Custody & support",
      q: "Does DepVest take custody of my assets?",
      a: "Your wallet stays self-custodied; DepVest never asks for your seed phrase or private keys. Custody of strategy assets is governed by each strategy's published terms.",
    },
    {
      category: "Custody & support",
      q: "How can I reach the DepVest support team?",
      a: "Official support channels will be listed on the Support page once published. Never share private keys or a seed phrase with anyone claiming to be support.",
    },
    {
      category: "Referrals",
      q: "How does the referral program work?",
      a: "Connect a wallet to get your personal code (DV-XXXXXX) and invite link. A referral counts once your friend registers and activates their account. Tiers: 5% (1+ friend), 10% (3+), 15% (10+). Self-referrals are not accepted.",
    },
    {
      category: "Referrals",
      q: "How do I claim referral rewards?",
      a: "Use Claim to Cash on the Invite Friends page. Claimed rewards move into your Available Cash and appear in your ledger.",
    },
    {
      category: "Strategies & yield",
      q: "What does the AI Risk Check do?",
      a: "It scores your current mix against your risk tolerance and time horizon, flags concentration (for example compute plus digital above 50%, or one vault at 60%+), and suggests an allocation you can apply to Rebalance.",
    },
  ],
  verifiedAt: null,
};
