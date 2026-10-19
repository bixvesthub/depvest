import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  AtSign,
  BookOpen,
  Building2,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  MessagesSquare,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { pct, rewardRange, UNCONFIGURED, type Terms } from "./terms";

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
    {children}
  </span>
);
function Intro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-8 max-w-2xl md:mb-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-[44px]">{title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{copy}</p>
    </div>
  );
}
const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("rounded-[14px] border border-border bg-card p-5 md:p-6", className)}>
    {children}
  </div>
);
export function Unconfigured({ label = UNCONFIGURED }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
      <AlertTriangle className="size-2.5" />
      {label}
    </span>
  );
}
const Val = ({ v }: { v: string | null }) => (v ? <span>{v}</span> : <Unconfigured />);

/* ---------------- How It Works ---------------- */
const steps = [
  {
    icon: WalletCards,
    title: "Connect & fund",
    copy: "Connect MetaMask, Coinbase Wallet, Ledger (Hardware Wallet), WalletConnect, or another listed wallet on Base or Ethereum, then deposit USDC. Every deposit, withdrawal, rebalance, and task requires a connected wallet.",
  },
  {
    icon: Scale,
    title: "Choose a target mix",
    copy: "Pick a preset (Conservative, Balanced, Aggressive, or Liquid Cash Only) when you deposit, or set your own mix. Run an AI Risk Check any time to review concentration and horizon fit.",
  },
  {
    icon: Building2,
    title: "Understand the sources",
    copy: "Potential sources include government-debt interest, compute rental revenue, and digital-asset staking rewards. Each has distinct market, operational, counterparty, and liquidity risks.",
  },
  {
    icon: ArrowDownToLine,
    title: "Track & withdraw",
    copy: "Review balances and every receipt in the session ledger. Withdraw settled liquid cash with Standard settlement (free, T+1) or Instant settlement (1.5% fee). Invested vault funds must be rebalanced to liquid cash first. Network gas is paid from your wallet.",
  },
];
const yieldSources = [
  {
    title: "Treasury cash",
    label: "Interest on short-term government debt",
    copy: "A strategy may seek income from short-dated U.S. Treasury bills. Treasury securities are obligations of the U.S. government, but market value, access timing, and any fund or custody arrangement still carry risks. The dashboard does not establish ownership or custody of Treasury securities.",
  },
  {
    title: "AI cloud compute",
    label: "Fees for renting computing hardware",
    copy: "A compute strategy may seek revenue by financing or operating servers and renting capacity to customers. Income can fall if demand or prices drop, or hardware is idle, damaged, or costly to run. Review counterparties and operating disclosures before participating.",
  },
  {
    title: "Blue-chip digital assets",
    label: "Protocol rewards and transaction fees",
    copy: "A digital-asset strategy may stake assets such as ETH or SOL. Networks may distribute token rewards and transaction fees, but rewards and token prices can change; technical, slashing, and unstaking risks can apply.",
  },
  {
    title: "Active Earn",
    label: "Payment for completed microtasks",
    copy: "Task work is distinct from investing and needs no capital. Accepted tasks require at least 70% accuracy; up to five task attempts per session, one per task type.",
  },
];
export function HowItWorks({ terms, onStart }: { terms: Terms; onStart: () => void }) {
  return (
    <section>
      <Intro
        eyebrow="How It Works"
        title="From allocation to portfolio oversight."
        copy="DepVest brings portfolio tools and information about income strategies into one dashboard. Understand each strategy, review the applicable terms and risks, and choose an allocation that suits your objectives. Investment returns are variable and are never guaranteed."
      />
      <Card className="mb-6 border-warning/30 bg-warning/5">
        <h2 className="text-sm font-semibold">Wallet and transaction status</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Deposits, withdrawals, rebalances, Active Earn payouts, and referral claims receive a
          unique reference ID, timestamp, fee breakdown, and clearing status in the append-only
          session ledger. Clearing transfers do not change settled balances until a settlement
          event is recorded. Always confirm amount, network, and fees in your wallet before
          signing. Session ledger entries are local to this dashboard session.
        </p>
      </Card>
      <h2 className="mb-3 text-base font-semibold">Strategy overview</h2>
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {yieldSources.map((source) => (
          <Card key={source.title} className="h-full">
            <Eyebrow>{source.label}</Eyebrow>
            <h3 className="mt-2 text-sm font-semibold">{source.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{source.copy}</p>
          </Card>
        ))}
      </div>
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, title, copy }, i) => (
          <li key={title}>
            <Card className="h-full">
              <div className="flex items-center justify-between">
                <span className="vault-icon accent-cash">
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h2 className="mt-6 text-base font-semibold">{title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p>
            </Card>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <Eyebrow>Configured product fees</Eyebrow>
          <h2 className="mt-2 text-sm font-semibold">Fee schedule</h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
            <li>
              <b className="text-foreground">Deposit:</b> <Val v={terms.fees.deposit} />
            </li>
            <li>
              <b className="text-foreground">Withdrawal:</b> <Val v={terms.fees.withdrawal} />
            </li>
            <li>
              <b className="text-foreground">Performance:</b> <Val v={terms.fees.performance} />
            </li>
            <li>
              <b className="text-foreground">Rebalance:</b> <Val v={terms.fees.rebalance} />
            </li>
          </ul>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Confirm the applicable fee and any conditions in the official terms before using a
            financial service. Network gas is paid separately from your wallet.
          </p>
        </Card>
        <Card>
          <Eyebrow>Why rebalance?</Eyebrow>
          <h2 className="mt-2 text-sm font-semibold">Balance different kinds of risk</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Treasury exposure, compute rental, and digital-asset staking have different sources of
            income and different risks. A target mix lets an investor choose the balance they want;
            it cannot remove risk or ensure a specific return.
          </p>
          <div className="mt-3 space-y-2 text-xs">
            <p className="rounded-md border border-border bg-background/40 p-3">
              <b>Illustrative conservative mix:</b> 75% Treasury · 15% compute · 10% digital assets.
            </p>
            <p className="rounded-md border border-border bg-background/40 p-3">
              <b>Illustrative balanced mix:</b> 40% Treasury · 35% compute · 25% digital assets.
            </p>
            <p className="rounded-md border border-border bg-background/40 p-3">
              <b>Illustrative aggressive mix:</b> 10% Treasury · 65% compute · 25% digital assets.
            </p>
            <p className="text-[10px] text-muted-foreground">
              Example allocations only. Allocation cannot eliminate risk or guarantee income.
            </p>
          </div>
        </Card>
      </div>
      <Card className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Eyebrow>Configured strategy rates</Eyebrow>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["Treasury cash", pct(terms.apy.Cash)],
                ["AI compute", pct(terms.apy.Cloud)],
                ["Blue-chip", pct(terms.apy.Digital)],
                ["Task reward", rewardRange(terms.taskReward)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-md border border-border bg-background/40 p-3">
                <p className="text-[10px] text-muted-foreground">{k}</p>
                <div className="mt-1 font-mono text-sm">
                  {v === UNCONFIGURED ? <Unconfigured /> : v}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button className="rounded-full" onClick={onStart}>
          <Zap />
          View strategies
        </Button>
      </Card>
    </section>
  );
}

/* ---------------- Q&A ---------------- */
export function FAQ({ terms, onSupport, initialQuery = "" }: { terms: Terms; onSupport: () => void; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const productFaqs = [
    {
      category: "About this dashboard",
      q: "Is this a live investment or wallet service?",
      a: "No. This is an interactive UI prototype. Wallet selection, balances, rates, transactions, tasks, and rewards are examples held in local session state; the dashboard does not connect to a backend or submit blockchain transactions.",
    },
    {
      category: "About this dashboard",
      q: "Are the displayed rates live or guaranteed?",
      a: "No. They are configured display examples, not live rate feeds, verified performance, or promises of future returns. Investments can lose value.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Does a deposit or withdrawal move real funds?",
      a: "No. The transaction flows and their ledger statuses are local demonstrations. Do not send funds to the sample deposit address shown in this prototype.",
    },
    {
      category: "Account & access",
      q: "How do I connect a wallet?",
      a: "The wallet picker lets you explore the connected-wallet interface using demo session state; it does not connect a wallet provider. Never share your seed phrase, private keys, or wallet password.",
    },
    {
      category: "Deposits & withdrawals",
      q: "How are deposits and withdrawals recorded?",
      a: "Deposits, withdrawals, rebalances, Active Earn payouts, and referral claims receive a unique reference ID, timestamp, fee breakdown, balance deltas, and clearing status in the append-only session ledger. Clearing entries affect balances only after a settlement event.",
    },
    {
      category: "Deposits & withdrawals",
      q: "Can I withdraw funds invested in a vault?",
      a: "In the dashboard simulation, vault allocations cannot be withdrawn directly. Rebalance to Liquid Cash Only first; this changes local session state only.",
    },
    {
      category: "Ledger & accounting",
      q: "How does the ledger reconcile my balances?",
      a: "The session ledger displays local examples of liquid cash and vault balances. Clearing transactions remain pending in the simulation, and receipts show references and fee details. It does not read or reconcile an external wallet, and it resets when the session ends.",
    },
    {
      category: "Strategies & yield",
      q: "Are the configured rates guaranteed?",
      a: "No. Rates are variable, may change, and are not a promise of future returns. Investment value can fall, including to zero.",
    },
    {
      category: "Fees & eligibility",
      q: "What fees are listed?",
      a: `Configured fee examples are deposit, withdrawal, performance, and rebalance display values only; these are not live charges or governing service terms.`,
    },
    {
      category: "Active Earn",
      q: "How does Active Earn work in this prototype?",
      a: "The task interface demonstrates sample work with configured rewards and an accuracy threshold. Accepted tasks add a credit to local session state only; no external task-review or payout service is connected.",
    },
    {
      category: "Referrals",
      q: "Are referral rewards paid out?",
      a: "The referral interface demonstrates codes, balances, and claims in local session state. No real referral registration or external payout service is connected, and displayed reward tiers are estimates.",
    },
    {
      category: "Custody & support",
      q: "Does this dashboard confirm asset custody or an audit?",
      a: "No. This prototype does not verify asset ownership, custody arrangements, insurance, audited performance, or security audits. Review independently verified product disclosures before using a live financial service.",
    },
    {
      category: "Custody & support",
      q: "How can I contact support?",
      a: `Reach support at ${terms.support.primaryEmail}, message ${terms.support.telegram.handle} on Telegram, or join ${terms.support.discord.label}. ${terms.support.securityMandate}`,
    },
  ];
  const entries = terms.faqs.length ? terms.faqs : productFaqs;
  const list = entries.filter((f) =>
    (f.category + f.q + f.a).toLowerCase().includes(q.trim().toLowerCase()),
  );
  const groupedEntries = list.reduce<Array<{ category: string; faqs: typeof list }>>(
    (groups, faq) => {
      const group = groups.find((item) => item.category === faq.category);
      if (group) group.faqs.push(faq);
      else groups.push({ category: faq.category, faqs: [faq] });
      return groups;
    },
    [],
  );
  return (
    <section>
      <Intro
        eyebrow="Questions & Answers"
        title="Frequently asked questions."
        copy="Search answers about DepVest’s configured strategies, fees, task rules, and dashboard. This information does not replace verified product or legal terms."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {terms.faqs.length === 0 && (
            <Card className="mb-4 border-warning/30 bg-warning/5">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-warning" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The answers below summarize DepVest features and configured terms. They do not
                  replace the governing legal or product documents.
                </p>
              </div>
            </Card>
          )}
          <div className="mb-4 flex items-center gap-3 rounded-md border border-border bg-card px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              aria-label="Search questions"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Accordion
            type="single"
            collapsible
            className="rounded-[14px] border border-border bg-card px-5"
          >
            {groupedEntries.map(({ category, faqs }) => (
              <div key={category}>
                <div className="pb-2 pt-5 first:pt-0">
                  <Eyebrow>{category}</Eyebrow>
                </div>
                {faqs.map((f) => (
                  <AccordionItem key={f.q} value={f.q} className="border-border">
                    <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            ))}
            {list.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No matching questions.
              </p>
            )}
          </Accordion>
        </div>
        <aside className="h-fit rounded-[14px] border border-border bg-card p-6">
          <span className="vault-icon accent-digital">
            <HelpCircle className="size-5" />
          </span>
          <p className="mt-5 text-sm font-semibold">Still have questions?</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Email {terms.support.primaryEmail}, message {terms.support.telegram.handle} on Telegram,
            or join {terms.support.discord.label}. See the Support page for all official channels.
          </p>
          <Button className="mt-5 w-full rounded-full" onClick={onSupport}>
            Open Support
          </Button>
        </aside>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
export function About() {
  const pillars = [
    {
      icon: Building2,
      t: "Treasury cash concept",
      c: "A portfolio category that illustrates exposure to short-duration government debt. This dashboard does not verify Treasury purchases, asset ownership, custody, or strategy income.",
    },
    {
      icon: Sparkles,
      t: "AI cloud compute concept",
      c: "A portfolio category that illustrates possible revenue from renting computing capacity. No hardware contracts, utilization, counterparties, or rental revenue are connected to this prototype.",
    },
    {
      icon: ShieldCheck,
      t: "Digital-asset concept",
      c: "A portfolio category for exploring digital-asset allocation. Token volatility, protocol failure, slashing, custody, and unstaking delays can create losses.",
    },
    {
      icon: Zap,
      t: "Active Earn demo",
      c: "An interactive task workflow with configured examples and session credits. The prototype has no connected task-review service or external payout system.",
    },
  ];
  return (
    <section>
      <Intro
        eyebrow="About DepVest"
        title="One dashboard for portfolio tools and activity."
        copy="DepVest is a dashboard concept for exploring a multi-asset portfolio alongside task-based activity. It brings allocation tools, strategy comparisons, a session ledger, and educational information into one interface."
      />
      <Card className="mb-6 border-warning/30 bg-warning/5">
        <Eyebrow>Current build status</Eyebrow>
        <h2 className="mt-2 text-sm font-semibold">An interactive UI prototype</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          This build uses local session state and has no connected service for executing blockchain
          transactions, verifying strategy assets or yields, reviewing real task submissions, or
          issuing external payouts. Displayed balances, rates, fees, task credits, and referral
          activity are examples for exploring the interface; they do not confirm real assets,
          performance, or services.
        </p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map(({ icon: Icon, t, c }) => (
          <Card key={t}>
            <span className="vault-icon accent-cash">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-5 text-base font-semibold">{t}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <Eyebrow>What you can explore</Eyebrow>
        <ul className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          {[
            "Allocation presets, a rebalance flow, an AI Risk Check, and an illustrative yield calculator.",
            "A session ledger that demonstrates deposit, withdrawal, rebalance, task, and referral entries.",
            "Example Active Earn tasks and referral flows, with activity held in local session state.",
          ].map((p) => (
            <li key={p} className="flex gap-2">
              <Check className="size-3.5 shrink-0 text-success" />
              {p}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

/* ---------------- Rules ---------------- */
export function Rules({ terms }: { terms: Terms }) {
  const sections = [
    {
      t: "Account and transaction access",
      items: [
        "The wallet picker and connected-wallet state in this build are demo interactions; they do not connect to a wallet provider or authorize a blockchain transaction.",
        "No minimum deposit for a live service has been established.",
        "Deposit, withdrawal, and task screens demonstrate possible flows. No on-chain transaction or external payout is executed by this prototype.",
        "Do not send funds to the sample address displayed in this build; it is not a verified deposit service.",
        "Never share a seed phrase, private key, or wallet password.",
      ],
    },
    {
      t: "Fees and charges",
      items: [
        "Values in the fee schedule are configured dashboard examples, not a live quote or proof that a fee has been charged.",
        "Current examples show free deposits, free standard withdrawals, a 1.5% instant withdrawal fee, and a 10% fee on net positive yield.",
        "Actual fees, calculation methods, and payment conditions would need to be established in published product terms before a live service is used.",
      ],
    },
    {
      t: "Allocations and rebalancing",
      items: [
        "The rebalance flow updates the prototype's local portfolio and ledger state; it does not move assets on-chain.",
        "Presets: Conservative 75/15/10, Balanced 40/35/25, Aggressive 10/65/25, or Liquid Cash Only at 100% cash.",
        "Target allocations do not ensure diversification, liquidity, or a particular result.",
      ],
    },
    {
      t: "Strategy Liquidity Rules",
      items: [
        "In the dashboard simulation, Withdrawable Liquid Cash is separate from amounts allocated to Compute and Digital vaults.",
        "Invested vault funds are locked for direct withdrawal and cannot be used by Max.",
        "To model a withdrawal, rebalance to Liquid Cash Only (100% Cash), then use the withdrawal flow. This changes local session state only.",
        "Daily compounding, 30-day compute epochs, and a 7-day digital-asset unstaking period are unconfirmed estimates, not established liquidity terms.",
      ],
    },
    {
      t: "Withdrawals & Settlement",
      items: [
        "The interface presents standard (T+1) and instant (1.5%) withdrawal options as configured examples; these are not live settlement services or guaranteed timing.",
        "The simulation limits withdrawal amounts to available liquid cash and models a pending Clearing state before settlement.",
        "Pending entries and settlement events are examples in the local ledger, not confirmation from a network, custodian, or payment provider.",
        "Strategy payout timing is not verified or established by this dashboard.",
      ],
    },
    {
      t: "Ledger accounting",
      items: [
        "The interface records example deposits, withdrawals, rebalances, task credits, and referral claims with references, timestamps, fee details, and status.",
        "Clearing and Settled labels describe the prototype's local ledger state; they do not confirm an external transfer or payout.",
        "Balances and ledger entries are held in local session state and do not persist after the dashboard session ends.",
      ],
    },
    {
      t: "Active Earn",
      items: [
        "The interface shows configured task credit examples ranging from 0.10 to 0.30 by task type.",
        "A task is accepted in the demo only at 70% accuracy or higher.",
        "Up to five task attempts per session, one attempt per task type; limits reset each session and duplicate task attempts are blocked.",
        "Accepted tasks add a demo credit to local session state. No external task review, anti-bot enforcement, or payout service is connected.",
      ],
    },
    {
      t: "Referral program",
      items: [
        "The interface can generate a session referral code and demonstrate referral claim flows; it does not register or verify real referrals.",
        "Displayed referral tiers are estimates only, not established reward terms.",
        "Claims update local session state only; no external referral payout service is connected.",
      ],
    },
    {
      t: "Eligibility and service terms",
      items: [
        "This dashboard does not establish eligibility, identity checks, custody arrangements, supported live assets, or service availability.",
        "It does not provide evidence of asset ownership, insurance, audited performance, or a completed security audit.",
        "Review independently verified official product and legal terms before participating in any live financial service.",
      ],
    },
  ];
  const fees: Array<[string, string | null]> = [
    ["Deposit fee", terms.fees.deposit],
    ["Withdrawal fee", terms.fees.withdrawal],
    ["Performance fee", terms.fees.performance],
    ["Rebalance fee", terms.fees.rebalance],
  ];
  return (
    <section>
      <Intro
        eyebrow="Rules & Policies"
        title="Policies, fees and risk disclosure."
        copy="Review how the dashboard models fees, transactions, tasks, and strategy risks. The examples on this page describe the current interface, not live financial service terms."
      />
      <div className="mb-4 rounded-md border border-warning/30 bg-warning/5 p-4 text-xs leading-relaxed text-muted-foreground">
        Prototype notice: this is a UI-only dashboard. Wallet, transaction, task, settlement, and
        reward flows update local session state; no backend or blockchain transaction is connected.
        Do not send funds to the sample deposit address. Any future live service must be governed by
        separately published and verified product terms.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.t}>
            <h2 className="text-sm font-semibold">{s.t}</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {s.items.map((i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 size-3 shrink-0 text-success" />
                  {i}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Fee schedule</h2>
          <div className="mt-3 divide-y divide-border text-xs">
            {fees.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">{k}</span>
                <Val v={v} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-destructive/30">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-destructive" />
            Risk disclosure
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Investing can result in partial or total loss of principal. Risks include market and
            liquidity movements, counterparty or custody failure, smart-contract exploits, and
            staking penalties. Yields can change and are not guaranteed. Dashboard information is
            not evidence of asset ownership, insurance, audited performance, or a guaranteed
            withdrawal. Do not invest money you cannot afford to lose.
          </p>
        </Card>
      </div>
    </section>
  );
}

/* ---------------- Support ---------------- */
const SUPPORT_TOPICS = [
  "Deposits & Settlements",
  "Strategy Vaults",
  "Active Earn",
  "Referral Rewards",
  "General / Other",
] as const;

type SupportTicket = {
  reference: string;
  topic: string;
  message: string;
  walletAddress: string | null;
};

const createSupportReference = () =>
  `TKT-${Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0")}`;

export function Support({ terms, walletAddress, onNotice, onFaq }: { terms: Terms; walletAddress: string | null; onNotice: (m: string) => void; onFaq: (topic?: string) => void }) {
  const [conversationOpen, setConversationOpen] = useState(false);
  const [topic, setTopic] = useState<(typeof SUPPORT_TOPICS)[number]>("General / Other");
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const support = terms.support;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(support.primaryEmail);
      onNotice("Support email copied");
    } catch {
      onNotice("Could not copy the email. Select and copy it manually.");
    }
  };

  const submitInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inquiry = message.trim();
    if (!inquiry) return;
    setTicket({
      reference: createSupportReference(),
      topic,
      message: inquiry,
      walletAddress,
    });
  };

  const telegramEscalation = ticket
    ? `${support.telegram.url}?text=${encodeURIComponent(
        `DEPVEST support request ${ticket.reference}\nTopic: ${ticket.topic}\n${ticket.message}${ticket.walletAddress ? `\nWallet: ${ticket.walletAddress}` : ""}`,
      )}`
    : "";
  const links: Array<[string, string]> = [["How do deposits work?", "deposit"], ["Withdrawal timing", "withdrawal"], ["Fees & rates", "fee"], ["Account security", "private keys"]];
  return (
    <section>
      <Intro
        eyebrow="Support"
        title="Get help with DepVest."
        copy="Reach the DEPVEST team through the official channels below. For your security, verify the account handle and never share wallet secrets."
      />
      <Card className="mb-5 border-warning/40 bg-warning/10">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <h2 className="text-sm font-semibold">Security &amp; Key Protection</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{support.securityMandate}</p>
          </div>
        </div>
      </Card>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Online / {support.operatingHours.replace("Monday – Friday, ", "Mon–Fri ")}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="flex flex-col">
          <span className="vault-icon accent-digital"><Mail className="size-5" /></span>
          <h2 className="mt-5 text-sm font-semibold">Email</h2>
          <p className="mt-2 flex-1 text-xs text-muted-foreground">For account, deposit, settlement, and withdrawal questions.</p>
          <p className="mt-3 break-all font-mono text-xs">{support.primaryEmail}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Alternate: {support.alternateEmail}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-full"><a href={`mailto:${support.primaryEmail}`}><Mail />Send Email</a></Button>
            <Button variant="outline" className="rounded-full" onClick={copyEmail}><Copy />Copy Email</Button>
          </div>
        </Card>
        <Card className="flex flex-col">
          <span className="vault-icon accent-digital"><Send className="size-5" /></span>
          <h2 className="mt-5 text-sm font-semibold">Telegram</h2>
          <p className="mt-2 flex-1 text-xs text-muted-foreground">Contact the DEPVEST team directly.</p>
          <p className="mt-3 font-mono text-xs">{support.telegram.handle}</p>
          <Button asChild variant="outline" className="mt-4 rounded-full"><a href={support.telegram.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Join Telegram</a></Button>
        </Card>
        <Card className="flex flex-col">
          <span className="vault-icon accent-digital"><MessagesSquare className="size-5" /></span>
          <h2 className="mt-5 text-sm font-semibold">Discord</h2>
          <p className="mt-2 flex-1 text-xs text-muted-foreground">Join the DEPVEST community.</p>
          <p className="mt-3 font-mono text-xs">{support.discord.label}</p>
          <Button asChild variant="outline" className="mt-4 rounded-full"><a href={support.discord.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Open Discord</a></Button>
        </Card>
        <Card className="flex flex-col">
          <span className="vault-icon accent-digital"><AtSign className="size-5" /></span>
          <h2 className="mt-5 text-sm font-semibold">X / Twitter</h2>
          <p className="mt-2 flex-1 text-xs text-muted-foreground">Follow official DEPVEST updates.</p>
          <p className="mt-3 font-mono text-xs">{support.x.handle}</p>
          <Button asChild variant="outline" className="mt-4 rounded-full"><a href={support.x.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Follow on X</a></Button>
        </Card>
        <Card className="flex flex-col border-success/30 bg-success/5">
          <span className="vault-icon accent-digital"><MessageCircle className="size-5" /></span>
          <h2 className="mt-5 text-sm font-semibold">Live Chat</h2>
          <p className="mt-2 flex-1 text-xs text-muted-foreground">Direct Specialist Support. Create a session reference and escalate through Telegram.</p>
          <Button className="mt-4 rounded-full" onClick={() => {
            setTicket(null);
            setMessage("");
            setTopic("General / Other");
            setConversationOpen(true);
          }}><MessageCircle />Start Conversation</Button>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4" />
            Quick answers
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {links.map(([l, topic]) => (
              <button
                key={l}
                onClick={() => onFaq(topic)}
                className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3 text-left text-xs hover:border-success/40"
              >
                {l}
                <HelpCircle className="size-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="size-4" />
            Response times
          </h2>
          <p className="mt-3 text-xs text-muted-foreground">{support.operatingHours}</p>
          <div className="mt-4 space-y-2">
            <p className="rounded-md border border-border bg-background/40 p-3 text-xs">{support.responseSla.priority}</p>
            <p className="rounded-md border border-border bg-background/40 p-3 text-xs">{support.responseSla.standard}</p>
          </div>
          <p className="mt-4 flex gap-2 text-[11px] text-muted-foreground">
            <LifeBuoy className="size-3.5 shrink-0 text-success" />
            Official team: {support.telegram.handle}. Never share wallet secrets.
          </p>
        </Card>
      </div>
      <Dialog open={conversationOpen} onOpenChange={setConversationOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-lg">
          <DialogHeader className="text-left">
            <Eyebrow>Direct Specialist Support</Eyebrow>
            <DialogTitle className="text-xl">Start a conversation</DialogTitle>
            <DialogDescription>Prepare your inquiry and get a session support reference to continue with {support.telegram.handle}.</DialogDescription>
          </DialogHeader>
          {ticket ? (
            <div className="space-y-4">
              <div className="rounded-md border border-success/30 bg-success/5 p-4">
                <p className="text-xs text-muted-foreground">Session support reference</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-success">{ticket.reference}</p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">Your inquiry and reference are held in this dashboard session. Continue to Telegram to send them to the support team.</p>
              <Button asChild className="w-full rounded-full"><a href={telegramEscalation} target="_blank" rel="noopener noreferrer"><Send />Continue to Telegram</a></Button>
              <Button variant="outline" className="w-full rounded-full" onClick={() => setTicket(null)}>Edit inquiry</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submitInquiry}>
              <label className="block space-y-2 text-xs font-medium">
                Topic
                <select value={topic} onChange={(event) => setTopic(event.target.value as (typeof SUPPORT_TOPICS)[number])} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal">
                  {SUPPORT_TOPICS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block space-y-2 text-xs font-medium">
                Message / inquiry
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={5} maxLength={2000} placeholder="Tell us what you need help with…" className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </label>
              <div className="rounded-md border border-border bg-background/50 p-3 text-[11px]">
                <p className="font-medium">Wallet address {walletAddress ? "attached" : "not connected"}</p>
                <p className="mt-1 break-all font-mono text-muted-foreground">{walletAddress ?? "Connect a wallet to include its address with your inquiry."}</p>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={!message.trim()}><MessageCircle />Create support reference</Button>
              <p className="text-[10px] leading-relaxed text-muted-foreground">This creates a local session reference only. Your inquiry is sent when you continue to Telegram.</p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
