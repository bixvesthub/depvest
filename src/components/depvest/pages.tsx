import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BookOpen,
  Building2,
  Check,
  Clock,
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
    copy: "Connect a supported self-custody wallet (MetaMask, Coinbase Wallet, WalletConnect) on Base or Ethereum, then deposit USDC. Every deposit, withdrawal, rebalance, and task requires a connected wallet.",
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
    copy: "Review balances and every receipt in the Wallet & Ledger. Withdraw with Standard settlement (free, T+1) or Instant settlement (1.5% fee). Network gas is paid from your wallet.",
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
          Deposits, withdrawals, rebalances, and task payouts appear in your ledger as Clearing
          until they settle. Always confirm the amount, network, and fees in your wallet before
          signing, and treat a transaction as final only once it shows as Settled.
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
      category: "Account & access",
      q: "How do I connect a wallet?",
      a: "Tap Connect Wallet and choose MetaMask, Coinbase Wallet, or WalletConnect. Deposits, withdrawals, rebalances, and tasks require a connected wallet. Never share your seed phrase.",
    },
    {
      category: "Deposits & withdrawals",
      q: "How are deposits and withdrawals recorded?",
      a: "Each deposit and withdrawal is recorded in your ledger as Clearing, then Settled. Confirm amounts and fees in your wallet before signing.",
    },
    {
      category: "Strategies & yield",
      q: "Are the configured rates guaranteed?",
      a: "No. Rates are variable, may change, and are not a promise of future returns. Investment value can fall, including to zero.",
    },
    {
      category: "Fees & eligibility",
      q: "What fees are listed?",
      a: `Configured fee schedule — deposit: ${terms.fees.deposit ?? "not configured"}; withdrawal: ${terms.fees.withdrawal ?? "not configured"}; performance: ${terms.fees.performance ?? "not configured"}; rebalance: ${terms.fees.rebalance ?? "not configured"}. Review the official terms for applicability and conditions.`,
    },
    {
      category: "Custody & support",
      q: "How can I contact support?",
      a: "Official support channels will be listed on the Support page once published. Never share passwords, private keys, or seed phrases with anyone claiming to be support.",
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
            Support contact details have not been configured. See the Support page for current
            information.
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
      t: "Treasury strategy",
      c: "A strategy seeking income from short-duration government debt. Exposure, custody arrangements, liquidity, and risks depend on the applicable product terms.",
    },
    {
      icon: Sparkles,
      t: "Compute strategy",
      c: "A strategy seeking revenue from renting GPU or CPU capacity. Demand, operating costs, counterparties, and equipment utilization can affect performance.",
    },
    {
      icon: ShieldCheck,
      t: "Digital-asset strategy",
      c: "A strategy seeking staking rewards and protocol fees. Token volatility, smart-contract failure, slashing, and unstaking delays can affect outcomes.",
    },
    {
      icon: Zap,
      t: "Active Earn",
      c: "Task-based earning through eligible work. Task availability, acceptance, and compensation are subject to the applicable task terms.",
    },
  ];
  return (
    <section>
      <Intro
        eyebrow="About DepVest"
        title="A single view of diversified strategies."
        copy="DepVest is a multi-asset yield platform that brings portfolio tools, strategy information, and activity views together in one place. Explore Treasury, compute, digital-asset, and task-based strategies, and review their terms and risks before making financial decisions."
      />
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
        <Eyebrow>Platform capabilities</Eyebrow>
        <ul className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          {[
            "Multi-asset strategies across Treasury cash, AI compute, and digital-asset staking.",
            "Portfolio management with allocation presets, rebalancing, AI Risk Check, and a yield calculator.",
            "Wallet-gated deposits and withdrawals, Active Earn tasks, and tiered referral rewards.",
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
        "Deposits, withdrawals, rebalances, and tasks require a connected wallet on a supported network (Base or Ethereum).",
        "Minimum deposit: none currently set — this is an unconfirmed estimate, not an established term.",
        "Ledger entries show Clearing until settled; a Clearing entry is not final.",
        "Do not send funds to an address unless it is confirmed through a verified official product flow.",
      ],
    },
    {
      t: "Fees and charges",
      items: [
        "The fee schedule below reflects the terms currently configured for DepVest.",
        "Fees may depend on strategy, transaction type, timing, network, or other terms.",
        "Review the governing product terms for the exact fee, calculation method, and payment conditions.",
      ],
    },
    {
      t: "Allocations and rebalancing",
      items: [
        "Allocation selections express a target mix and do not by themselves execute a trade or transfer.",
        "Presets: Conservative 75/15/10, Balanced 40/35/25, Aggressive 10/65/25, or Liquid Cash Only.",
        "Target allocations do not ensure diversification, liquidity, or a particular result.",
      ],
    },
    {
      t: "Withdrawals and settlement",
      items: [
        "Standard settlement is free and settles T+1.",
        "Instant settlement carries a 1.5% fee, deducted from the amount received.",
        "Withdrawals cannot exceed Available Cash; pending withdrawals are held until settled.",
        "Payout timing (daily Treasury compounding, 30-day compute epochs, 7-day digital unstaking) is an unconfirmed estimate, not an established term.",
      ],
    },
    {
      t: "Active Earn",
      items: [
        "Tasks pay $0.10–$0.30 each when accepted, depending on task type.",
        "A task is accepted only at 70% accuracy or higher.",
        "Up to five task attempts per session, one attempt per task type; limits reset each session.",
      ],
    },
    {
      t: "Referral program",
      items: [
        "Each connected wallet gets a personal code (DV-XXXXXX); self-referrals are not accepted.",
        "A referral counts only after the friend registers successfully and activates their account.",
        "Estimated tiers: 5% (1+ friend), 10% (3+), 15% (10+). These rates are unconfirmed estimates, not established terms. Claimed rewards move to Available Cash.",
      ],
    },
    {
      t: "Eligibility and service terms",
      items: [
        "Eligibility, identity checks, supported assets and networks, and service availability are subject to the applicable official terms.",
        "Review custody, withdrawal, fee, and strategy disclosures before participating in a financial product.",
        "Where published product terms apply, they govern over this informational summary.",
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
        copy="Review service policies, configured fees, and the risks associated with each strategy. This informational summary does not replace the governing product terms."
      />
      <div className="mb-4 rounded-md border border-warning/30 bg-warning/5 p-4 text-xs leading-relaxed text-muted-foreground">
        This summary explains how DepVest features work. Where governing product terms are
        published, they take precedence over this page.
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
export function Support({ onNotice, onFaq }: { onNotice: (m: string) => void; onFaq: (topic?: string) => void }) {
  const channels = [
    {
      icon: MessageCircle,
      t: "Live Chat",
      c: "In-app conversation with a support team.",
      sla: "Not available",
      cta: "Live chat unavailable",
    },
    {
      icon: Mail,
      t: "Email",
      c: "For account, deposit, and withdrawal questions.",
      sla: "Contact details not published",
      cta: "Email details unavailable",
    },
    {
      icon: Send,
      t: "Telegram",
      c: "Official announcements and community help.",
      sla: "Contact details not published",
      cta: "Telegram link unavailable",
    },
    {
      icon: MessagesSquare,
      t: "Discord",
      c: "Community discussion and product updates.",
      sla: "Contact details not published",
      cta: "Discord link unavailable",
    },
  ];
  const links: Array<[string, string]> = [["How do deposits work?", "deposit"], ["Withdrawal timing", "withdrawal"], ["Fees & rates", "fee"], ["Account security", "private keys"]];
  return (
    <section>
      <Intro
        eyebrow="Support"
        title="Get help with DepVest."
        copy="Choose a published support channel when one is available. Contact details for chat, email, Telegram, and Discord have not been provided here. Never share your seed phrase or private keys with anyone claiming to be support."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {channels.map(({ icon: Icon, t, c, sla, cta }) => (
          <Card key={t} className="flex flex-col">
            <span className="vault-icon accent-digital">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-5 text-sm font-semibold">{t}</h2>
            <p className="mt-2 flex-1 text-xs text-muted-foreground">{c}</p>
            <div className="mt-3">
              <Unconfigured label={sla} />
            </div>
            <Button variant="outline" className="mt-4 rounded-full" disabled>
              {cta}
            </Button>
          </Card>
        ))}
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
          <p className="mt-3 text-xs text-muted-foreground">
            Support hours and response targets have not been published.
          </p>
          <div className="mt-3">
            <Unconfigured label="Hours unconfigured" />
          </div>
          <p className="mt-4 flex gap-2 text-[11px] text-muted-foreground">
            <LifeBuoy className="size-3.5 shrink-0 text-success" />
            Never share your seed phrase with anyone.
          </p>
        </Card>
      </div>
    </section>
  );
}
