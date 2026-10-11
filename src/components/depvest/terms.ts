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
      a: "The dashboard describes three strategy types: Treasury exposure intended to earn government-debt interest, compute infrastructure intended to earn hardware-rental revenue, and digital-asset strategies intended to earn staking or protocol rewards. Their live deployment, counterparties, custody, and realized performance are not connected to or verified by this interface.",
    },
    {
      category: "Strategies & yield",
      q: "Are the displayed yields guaranteed or fixed?",
      a: "No. The configured display rates are 4.65% for Cash, 11.40% for Cloud, and 6.20% for Digital. They are not live rate feeds or promises of returns. Actual strategy returns can change, and investments can lose value.",
    },
    {
      category: "Strategies & yield",
      q: "When is yield compounded or credited?",
      a: "This interface does not connect to yield-generating services or calculate and credit realized strategy returns. Compounding, accrual, and distribution timing are not established here; consult the governing terms for any live product.",
    },
    {
      category: "Fees & eligibility",
      q: "What fees are shown in the configured fee schedule?",
      a: "The configured values are: deposits — Free; rebalancing — Free; performance — 10% of net positive yield; standard withdrawals — Free; instant withdrawals — 1.5%. These values are displayed for information only; this interface does not execute transactions or collect fees.",
    },
    {
      category: "Fees & eligibility",
      q: "Is there a minimum deposit or lock-up period?",
      a: "Minimums and applicable liquidity or lock-up conditions are not established by this interface. Review the governing terms for a live product before sending funds; dashboard deposit controls do not submit transactions.",
    },
    {
      category: "Deposits & withdrawals",
      q: "What is the difference between standard and instant withdrawals?",
      a: "The interface describes standard withdrawals as T+1 and instant withdrawals as express with a configured 1.5% fee. These are displayed settings only: no withdrawal is submitted, settled, or sent to a wallet by this dashboard.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Which networks and currencies does the interface display?",
      a: "The interface displays USDC and Base and Ethereum network options. It is not connected to a wallet provider or blockchain and does not verify deposits. Do not send assets using an address or QR code displayed here.",
    },
    {
      category: "Active Earn",
      q: "How does Active Earn work?",
      a: "Active Earn contains sample annotation, summary-review, and classification tasks. Completing a task can add $0.10–$0.30 of session credit in the current interface. No partner task queue or real USDC payment service is connected.",
    },
    {
      category: "Active Earn",
      q: "What are the accuracy and session limits for tasks?",
      a: "The interface requires at least 70% accuracy to accept a task and allows up to five task attempts per app session, with one attempt per task type. This is client-side session behavior, not a persistent account limit; progress resets when the app reloads.",
    },
    {
      category: "Active Earn",
      q: "When are Active Earn rewards paid?",
      a: "Accepted work adds session credit to the dashboard. It is not transferred as USDC. The interface creates a client-side SHA-256 reference for a task record; this is not an on-chain transaction or an independently verified payout receipt.",
    },
    {
      category: "Custody & support",
      q: "Does DepVest take custody of my assets?",
      a: "This interface does not connect to a wallet provider, deploy or interact with vault contracts, or take custody of assets. It cannot establish whether a separate live product is custodial or non-custodial; consult its verified custody disclosures.",
    },
    {
      category: "Custody & support",
      q: "How can I reach the DepVest support team?",
      a: "Verified support contact details have not been configured in this interface. The address and community links supplied in unverified drafts should not be treated as official. Never share private keys or a seed phrase with anyone claiming to be support.",
    },
  ],
  verifiedAt: null,
};
