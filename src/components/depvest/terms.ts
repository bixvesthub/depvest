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
  r ? `+${r.min} DVT – +${r.max} DVT` : UNCONFIGURED;

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
  taskReward: { min: 15, max: 45 },
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
      a: "DepVest offers three strategies: US Treasury Cash targets short-duration government-debt interest, AI Cloud Compute targets hardware-leasing revenue, and Blue-Chip Digital targets staking and protocol rewards. Each strategy carries market, operational, custody, and liquidity risks.",
    },
    {
      category: "Strategies & yield",
      q: "Are the displayed yields guaranteed or fixed?",
      a: "No. The configured display rates are 4.65% for Cash, 11.40% for Cloud, and 6.20% for Digital. They are target rates, not live rate feeds or promises of returns. Actual strategy returns can change, and investments can lose value.",
    },
    {
      category: "About DepVest",
      q: "Is DepVest live?",
      a: "DepVest is in its pre-launch phase. You can connect a wallet, plan allocations, run rebalances, complete Active Earn tasks, and review your ledger today. On-chain deposits and payouts open at launch, and balances shown before then are not held in custody.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Does a deposit or withdrawal move real funds?",
      a: "Not yet. On-chain deposits and withdrawals open at launch. Until then, only send funds to an address announced through official @depvestteam channels.",
    },
    {
      category: "Strategies & yield",
      q: "When is yield compounded or credited?",
      a: "Unconfirmed estimate: Treasury cash is expected to compound daily, AI compute to pay at the end of each 30-day epoch, and digital assets to accrue flexibly with a 7-day unstaking period. These payout timings are not yet established terms and may change once official strategy terms are published. Portfolio projections are estimates, not guarantees.",
    },
    {
      category: "Fees & eligibility",
      q: "What fees are shown in the configured fee schedule?",
      a: "Configured display examples are deposits: Free; rebalancing: Free; performance fee: 10% of net positive yield; standard withdrawal: Free; instant withdrawal: 1.5%. Final fees are confirmed in the published terms at launch.",
    },
    {
      category: "Fees & eligibility",
      q: "Is there a minimum deposit or lock-up period?",
      a: "Unconfirmed estimate: no minimum deposit is currently set, Treasury cash is expected to have no lock, AI compute to run in 30-day epochs, and digital assets to have a 7-day unstaking period. These are not yet established terms and may change. Deposits cannot exceed your wallet balance.",
    },
    {
      category: "Deposits & withdrawals",
      q: "What is the difference between standard and instant withdrawals?",
      a: "The interface models standard withdrawals as free with T+1 settlement and instant withdrawals with a configured 1.5% fee. Both show as Clearing in your ledger until they settle. Timing is a target, not a guarantee.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Can I withdraw invested vault funds directly?",
      a: "Withdrawals use available liquid cash only. Vault allocations cannot be withdrawn directly; rebalance to the Liquid Cash Only (100% Cash) preset first.",
    },
    {
      category: "Deposits & withdrawals",
      q: "What happens if I do not have enough liquid cash to withdraw?",
      a: "Max is limited to available liquid cash. Use Rebalance to Liquid Cash to move to the 100% Cash preset, then withdraw. Invested funds cannot be withdrawn directly.",
    },
    {
      category: "Ledger & accounting",
      q: "How does the DepVest ledger account for transactions?",
      a: "Every deposit, withdrawal, rebalance, Active Earn credit, and referral claim is recorded with a reference ID, timestamp, fee breakdown, balance changes, and status (Clearing or Settled). Duplicate claims are blocked.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Which wallets and networks are supported?",
      a: "The wallet picker lists MetaMask, Coinbase Wallet, Ledger (Hardware Wallet), Phantom, and WalletConnect, while transaction screens show USDC examples on Base and Ethereum. DepVest never asks for or stores your seed phrase or private keys.",
    },
    {
      category: "Active Earn",
      q: "How does Active Earn work?",
      a: "Active Earn offers eight task types such as product labelling, summary review, and content screening. Each accepted task adds a 15–45 DVT credit to your pending balance.",
    },
    {
      category: "Active Earn",
      q: "What are the accuracy and session limits for tasks?",
      a: "A task is accepted at 70% accuracy or higher, with up to five attempts per session and one attempt per task type.",
    },
    {
      category: "Active Earn",
      q: "When are Active Earn rewards paid?",
      a: "Accepted tasks add pending DVT credits. Claiming moves them to your available DVT balance and records a ledger entry. On-chain DVT transfers open at launch.",
    },
    {
      category: "Custody & support",
      q: "Does DepVest take custody of my assets?",
      a: "DepVest does not hold your wallet keys. The DEPVEST team (@depvestteam) will never ask for your seed phrase, private keys, or wallet passwords. For help, contact support@depvest.com, message @depvestteam on Telegram, or join discord.gg/depvestteam.",
    },
    {
      category: "Custody & support",
      q: "How can I reach the DepVest support team?",
      a: "Contact support@depvest.com, message @depvestteam on Telegram at https://t.me/depvestteam, or join discord.gg/depvestteam at https://discord.gg/depvestteam. The DEPVEST team will never ask for your seed phrase, private keys, or wallet passwords.",
    },
    {
      category: "Custody & support",
      q: "Is DepVest audited or insured?",
      a: "Not yet. Security audit, custody, and insurance details will be published before launch. Do not treat displayed figures as audited performance.",
    },
    {
      category: "Referrals",
      q: "Are referral rewards paid out?",
      a: "Referral rewards are tracked in USDC and DVT and claimed to your DepVest balance. External payouts open at launch, and the DVT tier rates are estimates until final terms are published.",
    },
    {
      category: "Referrals",
      q: "How does the referral program work?",
      a: "Connect a wallet to get your DV-XXXXXX code and share it. A referral counts once your friend registers and activates their account. Estimated tiers are 5%, 10%, and 15% DVT (not yet final terms).",
    },
    {
      category: "Referrals",
      q: "How do I claim referral rewards?",
      a: "Open Invite Friends and tap Claim USDC or Claim DVT. Each claim is recorded in your ledger and credited to your DepVest balance.",
    },
    {
      category: "Strategies & yield",
      q: "What does the AI Risk Check do?",
      a: "It scores your current mix against your risk tolerance and time horizon, flags concentration (for example compute plus digital above 50%, or one vault at 60%+), and suggests an allocation you can apply to Rebalance.",
    },
  ],
  verifiedAt: null,
};
