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
  support: {
    primaryEmail: string;
    alternateEmail: string;
    telegram: { handle: string; url: string };
    discord: { label: string; url: string };
    x: { handle: string; url: string };
    operatingHours: string;
    responseSla: { priority: string; standard: string };
    securityMandate: string;
  };
  faqs: Array<{ category: string; q: string; a: string }>;
  verifiedAt: string | null;
};

export const UNCONFIGURED = "Unconfigured";
export const pct = (n: number | null) => (n == null ? UNCONFIGURED : `${n.toFixed(2)}%`);
export const rewardRange = (r: Terms["taskReward"]) =>
  r ? `$${r.min.toFixed(2)} – $${r.max.toFixed(2)}` : UNCONFIGURED;

export const DEFAULT_SUPPORT: Terms["support"] = {
  primaryEmail: "support@depvest.com",
  alternateEmail: "depvestteam@gmail.com",
  telegram: { handle: "@depvestteam", url: "https://t.me/depvestteam" },
  discord: { label: "discord.gg/depvestteam", url: "https://discord.gg/depvestteam" },
  x: { handle: "@depvestteam", url: "https://x.com/depvestteam" },
  operatingHours: "Monday – Friday, 08:00 – 20:00 UTC",
  responseSla: {
    priority: "Priority inquiries < 4 hours",
    standard: "Standard inquiries < 24 hours",
  },
  securityMandate:
    "The DEPVEST team (@depvestteam) will never ask for your seed phrase, private keys, or wallet passwords.",
};

export const EMPTY_TERMS: Terms = {
  apy: { Cash: null, Cloud: null, Digital: null },
  taskReward: null,
  fees: { deposit: null, withdrawal: null, performance: null, rebalance: null },
  support: DEFAULT_SUPPORT,
  faqs: [],
  verifiedAt: null,
};

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
  support: DEFAULT_SUPPORT,
  faqs: [
    {
      category: "Strategies & yield",
      q: "How do the DepVest strategies seek to generate yield?",
      a: "The dashboard presents three strategy concepts: Treasury cash seeking government-debt interest, AI cloud compute seeking hardware-rental revenue, and blue-chip digital assets seeking staking and protocol rewards. This prototype does not verify underlying assets, counterparties, or revenue. Each concept carries market, operational, custody, and liquidity risks.",
    },
    {
      category: "Strategies & yield",
      q: "Are the displayed yields guaranteed or fixed?",
      a: "No. The configured display rates are 4.65% for Cash, 11.40% for Cloud, and 6.20% for Digital. They are examples, not live rate feeds, verified performance, or promises of returns. Actual strategy returns can change, and investments can lose value.",
    },
    {
      category: "About this dashboard",
      q: "Is this a live investment or wallet service?",
      a: "No. This is an interactive UI prototype. Wallet selection, balances, rates, transactions, tasks, and rewards are examples held in local session state; the dashboard does not connect to a backend or submit blockchain transactions.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Does a deposit or withdrawal move real funds?",
      a: "No. Deposit, withdrawal, and settlement flows demonstrate the interface using local session state only. Do not send funds to the sample deposit address shown in this prototype.",
    },
    {
      category: "Strategies & yield",
      q: "When is yield compounded or credited?",
      a: "Unconfirmed estimate: Treasury cash is expected to compound daily, AI compute to pay at the end of each 30-day epoch, and digital assets to accrue flexibly with a 7-day unstaking period. These payout timings are not yet established terms and may change once official strategy terms are published. Portfolio projections are estimates, not guarantees.",
    },
    {
      category: "Fees & eligibility",
      q: "What fees are shown in the configured fee schedule?",
      a: "Configured display examples are deposits: Free; rebalancing: Free; performance fee: 10% of net positive yield; standard withdrawal: Free; instant withdrawal: 1.5%. These are not live charges or governing service terms.",
    },
    {
      category: "Fees & eligibility",
      q: "Is there a minimum deposit or lock-up period?",
      a: "Unconfirmed estimate: no minimum deposit is currently set, Treasury cash is expected to have no lock, AI compute to run in 30-day epochs, and digital assets to have a 7-day unstaking period. These are not yet established terms and may change. Deposits cannot exceed your wallet balance.",
    },
    {
      category: "Deposits & withdrawals",
      q: "What is the difference between standard and instant withdrawals?",
      a: "The interface models standard withdrawals as free with T+1 settlement and instant withdrawals with a configured 1.5% fee. These are demo settings, not a live settlement service or guaranteed timing. Both can show as Clearing in the local session ledger.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Can I withdraw invested vault funds directly?",
      a: "In the dashboard simulation, withdrawals can use available liquid cash only. Vault allocations cannot be withdrawn directly; rebalance to the Liquid Cash Only (100% Cash) preset before modeling a withdrawal. No actual transfer occurs.",
    },
    {
      category: "Deposits & withdrawals",
      q: "What happens if I do not have enough liquid cash to withdraw?",
      a: "The demo withdrawal flow limits Max to available liquid cash. Use Rebalance to Liquid Cash to model a move to the 100% Cash preset before withdrawing. Invested funds cannot be withdrawn directly in the simulation; no actual transfer occurs.",
    },
    {
      category: "Ledger & accounting",
      q: "How does the DepVest ledger account for transactions?",
      a: "The dashboard records local examples of deposits, withdrawals, rebalances, Active Earn credits, and referral claims with a reference ID, timestamp, fee breakdown, balance deltas, and status. Clearing and Settled are session ledger states; they do not confirm an external transaction or reconcile an external wallet.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Which wallets and networks are supported?",
      a: "The wallet picker lists MetaMask, Coinbase Wallet, Ledger (Hardware Wallet), Phantom, and WalletConnect, while transaction screens show USDC examples on Base and Ethereum. In this prototype wallet selection is simulated; it does not connect a provider or submit a transaction. Never share your seed phrase or private keys.",
    },
    {
      category: "Active Earn",
      q: "How does Active Earn work?",
      a: "The prototype demonstrates eight task types such as product labelling, summary review, and content screening. Accepted tasks add a configured $0.10-$0.30 credit to local session state; no external task-review or payout service is connected.",
    },
    {
      category: "Active Earn",
      q: "What are the accuracy and session limits for tasks?",
      a: "The demo accepts a task at 70% accuracy or higher, with up to five attempts per session and one attempt per task type. These limits are part of the local interface simulation.",
    },
    {
      category: "Active Earn",
      q: "When are Active Earn rewards paid?",
      a: "An accepted task updates the demo Available Cash balance and session ledger. No external verification or payout occurs, and the session credit does not persist after the dashboard session ends.",
    },
    {
      category: "Custody & support",
      q: "Does DepVest take custody of my assets?",
      a: "This UI prototype does not establish wallet or strategy-asset custody. The DEPVEST team (@depvestteam) will never ask for your seed phrase, private keys, or wallet passwords. For help, contact support@depvest.com, message @depvestteam on Telegram, or join discord.gg/depvestteam. Review verified product terms for any future live service.",
    },
    {
      category: "Custody & support",
      q: "How can I reach the DepVest support team?",
      a: "Contact support@depvest.com, message @depvestteam on Telegram at https://t.me/depvestteam, or join discord.gg/depvestteam at https://discord.gg/depvestteam. The DEPVEST team will never ask for your seed phrase, private keys, or wallet passwords.",
    },
    {
      category: "Custody & support",
      q: "Does this dashboard confirm asset custody or an audit?",
      a: "No. This prototype does not verify asset ownership, custody arrangements, insurance, audited performance, or security audits. Review independently verified product disclosures before using a live financial service.",
    },
    {
      category: "Referrals",
      q: "Are referral rewards paid out?",
      a: "The referral interface demonstrates codes, balances, and claims in local session state. No real referral registration or external payout service is connected, and displayed reward tiers are estimates.",
    },
    {
      category: "Referrals",
      q: "How does the referral program work?",
      a: "The prototype can generate a session referral code and demonstrate invite and claim flows, but it does not register or verify real referrals. Displayed tiers are estimates, not established reward terms, and no external payout is connected.",
    },
    {
      category: "Referrals",
      q: "How do I claim referral rewards?",
      a: "Claim to Cash demonstrates how a claim could appear in the interface. It changes local session state and receives a demo ledger reference; it does not initiate an external referral payout.",
    },
    {
      category: "Strategies & yield",
      q: "What does the AI Risk Check do?",
      a: "It scores your current mix against your risk tolerance and time horizon, flags concentration (for example compute plus digital above 50%, or one vault at 60%+), and suggests an allocation you can apply to Rebalance.",
    },
  ],
  verifiedAt: null,
};
