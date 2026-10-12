import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  User,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Cloud,
  Coins,
  Cpu,
  Database,
  HelpCircle,
  Landmark,
  Layers3,
  LockKeyhole,
  Menu,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  ConnectWalletDialog,
  InviteFriends,
  NotificationsPopover,
  ProfileSheet,
  ReceiptDialog,
  WalletChip,
  WALLET_ADDRESS,
  type Receipt,
} from "@/components/depvest/extras";
import {
  CalculatorDialog,
  exportLedgerCsv,
  RebalanceDialog,
  TaskDialog,
  TransferDialog,
  VaultDetailDialog,
  type Alloc,
  type DepositStrategyName,
  type Flow,
} from "@/components/depvest/flows";
import { About, FAQ, HowItWorks, Rules, Support } from "@/components/depvest/pages";
import { DEFAULT_TERMS, pct, rewardRange, type Terms } from "@/components/depvest/terms";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DepVest — Multi-Asset Hub" },
      {
        name: "description",
        content: "Track diversified yield vaults, portfolio performance, and activity in DepVest.",
      },
      { property: "og:title", content: "DepVest — Multi-Asset Hub" },
      {
        property: "og:description",
        content:
          "A unified portfolio workspace for cash, compute, digital assets, and active earnings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepVestApp,
});

type View =
  | "Portfolio"
  | "Invest"
  | "Active Earn"
  | "Wallet & Ledger"
  | "Invite Friends"
  | "How It Works"
  | "Q&A"
  | "About"
  | "Rules"
  | "Support";
type Accent = "cash" | "cloud" | "digital" | "task";
type ActivityStatus = "pending" | "completed" | "failed";
type ActivityRow = {
  id: string;
  title: string;
  value: string;
  meta: string;
  accent: Accent;
  icon: typeof Zap;
  status: ActivityStatus;
  timestamp: number;
  reference: string;
  vaultId: string;
  settlementTier: string;
};

const navItems: Array<{ label: View; icon: typeof BarChart3; short: string }> = [
  { label: "Portfolio", short: "Portfolio", icon: BarChart3 },
  { label: "Invest", short: "Invest", icon: Coins },
  { label: "Active Earn", short: "Earn", icon: Zap },
  { label: "Wallet & Ledger", short: "Wallet", icon: WalletCards },
];

const moreItems: Array<{ label: View; icon: typeof BarChart3; copy: string }> = [
  { label: "Invite Friends", icon: UserPlus, copy: "Share DepVest with friends" },
  { label: "How It Works", icon: Sparkles, copy: "From deposit to diversified yield" },
  { label: "Q&A", icon: HelpCircle, copy: "Answers from the official terms" },
  { label: "About", icon: Layers3, copy: "What DepVest is and how it works" },
  { label: "Rules", icon: ShieldCheck, copy: "Policies, fees and risk disclosure" },
  { label: "Support", icon: LockKeyhole, copy: "Live chat, email, Telegram, Discord" },
];

const vaults: Array<{
  name: string;
  rate: string;
  rateLabel: string;
  risk: string;
  detail: string;
  balance: string;
  allocation: string;
  terms: string;
  action: string;
  accent: Accent;
  icon: typeof Landmark;
  auto: boolean;
  badge: string;
  note: string;
  sourceExplanation: string;
}> = [
  {
    name: "US Treasury Cash",
    rate: "5.20%",
    rateLabel: "Net APY",
    risk: "Ultra-Low",
    detail: "Short-term US T-bills & cash reserves in USDC",
    balance: "$0.00",
    allocation: "35%",
    terms: "No lock • Instant liquidity",
    action: "Add Funds",
    accent: "cash",
    icon: Landmark,
    auto: true,
    badge: "Treasury-bill strategy",
    note: "Net yield after 10% DepVest performance fee. Instant liquidity.",
    sourceExplanation:
      "The intended return source is interest on short-term U.S. Treasury bills. Treasury securities carry risks, and this preview does not hold Treasury bills.",
  },
  {
    name: "AI Cloud Compute",
    rate: "9.40%",
    rateLabel: "Net APY",
    risk: "Moderate",
    detail: "Contracted enterprise GPU/CPU rental revenues",
    balance: "$0.00",
    allocation: "40%",
    terms: "30D epoch • Auto-renew",
    action: "Top Up Compute",
    accent: "cloud",
    icon: Cpu,
    auto: true,
    badge: "Compute-rental strategy",
    note: "Yield paid at the end of each 30-day epoch cycle.",
    sourceExplanation:
      "The proposed source is rent paid by customers for AI server capacity. Demand, prices, equipment uptime, and operating costs can change; no live rental contracts are connected here.",
  },
  {
    name: "Blue-Chip Index",
    rate: "6.80%",
    rateLabel: "Net APY",
    risk: "Balanced",
    detail: "Staking yields on top blue-chip assets (ETH / SOL)",
    balance: "$0.00",
    allocation: "20%",
    terms: "Flexible • 7D unstake",
    action: "Stake More",
    accent: "digital",
    icon: Database,
    auto: true,
    badge: "ETH/SOL Staking",
    note: "Flexible staking with a 7-day unstaking period.",
    sourceExplanation:
      "The proposed source is network staking rewards and transaction fees. Token prices and rewards can change, and technical or unstaking risks apply; this preview does not stake assets.",
  },
  {
    name: "AI Task Work",
    rate: "$0.10 – $0.30",
    rateLabel: "/ task",
    risk: "No capital required",
    detail: "Direct micro-payouts for dataset validation",
    balance: "$0.00",
    allocation: "5%",
    terms: "No capital • Active work",
    action: "Start Earning",
    accent: "task",
    icon: Zap,
    auto: false,
    badge: "Task-work strategy",
    note: "Zero capital required. Payouts settled instantly upon crowd-verification.",
    sourceExplanation:
      "This is work, not an investment. A client would pay for accepted tasks such as data review, and the platform could pay workers a share. No task marketplace is connected here.",
  },
];

const activity: ActivityRow[] = [];
const TASK_SESSION_LIMIT = 5;
const DEMO_STATE_KEY = "depvest-demo-state";

const readStoredDemoState = () => {
  if (typeof window === "undefined") {
    return {
      cash: 0,
      earned: 0,
      tasksDone: 0,
      tasksStarted: 0,
      startedTaskTitles: [] as string[],
      alloc: { Cash: 0, Cloud: 0, Digital: 0, Task: 0 } as Alloc,
      ledger: [] as typeof activity,
      wallet: null as string | null,
    };
  }

  try {
    const raw = window.localStorage.getItem(DEMO_STATE_KEY);
    if (!raw) {
      return {
        cash: 0,
        earned: 0,
        tasksDone: 0,
        tasksStarted: 0,
        startedTaskTitles: [] as string[],
        alloc: { Cash: 0, Cloud: 0, Digital: 0, Task: 0 } as Alloc,
        ledger: [] as typeof activity,
        wallet: null as string | null,
      };
    }

    const parsed = JSON.parse(raw) as Partial<{
      cash: number;
      earned: number;
      tasksDone: number;
      tasksStarted: number;
      startedTaskTitles: string[];
      alloc: Partial<Alloc>;
      ledger: typeof activity;
      wallet: string | null;
    }>;

    return {
      cash: Number.isFinite(parsed.cash) ? Number(parsed.cash) : 0,
      earned: Number.isFinite(parsed.earned) ? Number(parsed.earned) : 0,
      tasksDone: Number.isFinite(parsed.tasksDone) ? Number(parsed.tasksDone) : 0,
      tasksStarted: Number.isFinite(parsed.tasksStarted) ? Number(parsed.tasksStarted) : 0,
      startedTaskTitles: Array.isArray(parsed.startedTaskTitles)
        ? parsed.startedTaskTitles.filter((title): title is string => typeof title === "string")
        : [],
      alloc: {
        Cash: Number.isFinite(parsed.alloc?.Cash) ? Number(parsed.alloc?.Cash) : 0,
        Cloud: Number.isFinite(parsed.alloc?.Cloud) ? Number(parsed.alloc?.Cloud) : 0,
        Digital: Number.isFinite(parsed.alloc?.Digital) ? Number(parsed.alloc?.Digital) : 0,
        Task: Number.isFinite(parsed.alloc?.Task) ? Number(parsed.alloc?.Task) : 0,
      },
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
      wallet: typeof parsed.wallet === "string" ? parsed.wallet : null,
    };
  } catch {
    return {
      cash: 0,
      earned: 0,
      tasksDone: 0,
      tasksStarted: 0,
      startedTaskTitles: [] as string[],
      alloc: { Cash: 0, Cloud: 0, Digital: 0, Task: 0 } as Alloc,
      ledger: [] as typeof activity,
      wallet: null as string | null,
    };
  }
};

function DepVestApp() {
  const initialDemoState = readStoredDemoState();
  const [view, setView] = useState<View>("Portfolio");
  const [notice, setNotice] = useState("");
  const [flow, setFlow] = useState<Flow>(null);
  const [cash, setCash] = useState(initialDemoState.cash);
  const [earned, setEarned] = useState(initialDemoState.earned);
  const [tasksDone, setTasksDone] = useState(initialDemoState.tasksDone);
  const [tasksStarted, setTasksStarted] = useState(initialDemoState.tasksStarted);
  const [startedTaskTitles, setStartedTaskTitles] = useState<string[]>(
    initialDemoState.startedTaskTitles,
  );
  const [alloc, setAlloc] = useState<Alloc>(initialDemoState.alloc);
  const [terms, setTerms] = useState<Terms>(DEFAULT_TERMS);
  const [ledger, setLedger] = useState<typeof activity>(initialDemoState.ledger);
  const [wallet, setWallet] = useState<string | null>(initialDemoState.wallet);
  const [pendingFlow, setPendingFlow] = useState<Flow>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DEMO_STATE_KEY,
      JSON.stringify({
        cash,
        earned,
        tasksDone,
        tasksStarted,
        startedTaskTitles,
        alloc,
        ledger,
        wallet,
      }),
    );
  }, [alloc, cash, earned, ledger, startedTaskTitles, tasksDone, tasksStarted, wallet]);
  const [connectOpen, setConnectOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };
  const go = (v: View) => {
    setView(v);
    setMoreOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0 });
  };
  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const stamp = () => new Date().toUTCString().slice(5, 22) + " UTC";
  const addEntry = (
    title: string,
    value: string,
    meta: string,
    accent: Accent,
    icon: typeof Zap,
    options?: {
      status?: ActivityStatus;
      vaultId?: string;
      settlementTier?: string;
      reference?: string;
    },
  ) => {
    const timestamp = Date.now();
    const id = `tx-${timestamp}-${Math.random().toString(16).slice(2, 8)}`;
    setLedger((l) => [
      {
        id,
        title,
        value,
        meta,
        accent,
        icon,
        status: options?.status ?? "completed",
        timestamp,
        reference:
          options?.reference ??
          `0x${Math.random().toString(16).slice(2, 10)}…${Math.random().toString(16).slice(2, 6)}`,
        vaultId: options?.vaultId ?? "DepVest portfolio",
        settlementTier: options?.settlementTier ?? "Standard T+1",
      },
      ...l,
    ]);
    return id;
  };
  const settleEntry = (id: string, onSettled: () => void, message: string) => {
    window.setTimeout(() => {
      setLedger((rows) =>
        rows.map((row) => (row.id === id ? { ...row, status: "completed" } : row)),
      );
      onSettled();
      showNotice(message);
    }, 3500);
  };
  const allRows = () => [...ledger, ...activity];
  const pendingWithdrawals = ledger
    .filter((row) => row.status === "pending" && /withdrawal/i.test(row.title))
    .reduce((total, row) => total + Math.abs(Number(row.value.replace(/[^\d.]/g, ""))), 0);
  const availableCash = Math.max(0, cash - pendingWithdrawals);
  const allocationTotal = Object.values(alloc).reduce((sum, value) => sum + value, 0);
  const idleCash = Math.max(0, availableCash * (allocationTotal === 0 ? 1 : alloc.Cash / 100));
  const cashIsUnallocated =
    allocationTotal === 0 ||
    (alloc.Cash === 100 && alloc.Cloud === 0 && alloc.Digital === 0 && alloc.Task === 0);
  const requireWallet = (nextFlow: Flow) => {
    if (wallet) {
      setFlow(nextFlow);
      return;
    }
    setPendingFlow(nextFlow);
    showNotice("Please connect a wallet to proceed with this activity.");
    setConnectOpen(true);
  };
  const setAction = (a: string) => {
    if (a === "Deposit" || a === "Deposit funds") return requireWallet({ kind: "deposit" });
    if (a === "Withdraw funds") return requireWallet({ kind: "withdraw" });
    if (a === "Rebalance")
      return requireWallet({
        kind: "rebalance",
        ...(allocationTotal === 0 ? { initial: { Cash: 100, Cloud: 0, Digital: 0, Task: 0 } } : {}),
      });
    if (a.startsWith("Allocate Cash: ")) {
      const targetVault = a.slice("Allocate Cash: ".length);
      const targetKey: keyof Alloc = /compute/i.test(targetVault) ? "Cloud" : "Digital";
      const current = allocationTotal === 0 ? { Cash: 100, Cloud: 0, Digital: 0, Task: 0 } : alloc;
      const initial = { ...current, Cash: 0, [targetKey]: current[targetKey] + current.Cash };
      return requireWallet({ kind: "rebalance", initial, targetVault });
    }
    if (a === "Calculator") {
      return setFlow({ kind: "calculator" });
    }
    if (a === "Waitlist") return showNotice("Waitlist joined — DePIN vaults coming soon");
    if (a === "Quick Earn") {
      showNotice("Quick Earn queue opened");
      return go("Active Earn");
    }
    if (a === "Export ledger") {
      exportLedgerCsv(allRows());
      return showNotice("Ledger exported as CSV");
    }
    if (a.startsWith("Task|")) {
      if (tasksStarted >= TASK_SESSION_LIMIT) {
        showNotice("Task limit reached for this session.");
        return;
      }
      const [, title, reward] = a.split("|");
      if (!title || !reward || startedTaskTitles.includes(title)) return;
      const taskFlow = { kind: "task" as const, title, reward: Number(reward) };
      if (!wallet) return requireWallet(taskFlow);
      setTasksStarted((current) => current + 1);
      setStartedTaskTitles((current) => [...current, title]);
      return setFlow(taskFlow);
    }
    if (a.startsWith("Invest in ")) return setFlow({ kind: "vault", name: a.slice(10) });
    if (a.startsWith("Start Earning")) return go("Active Earn");
    const name = a.split(": ")[1];
    requireWallet(name ? { kind: "deposit", vault: name } : { kind: "deposit" });
  };
  const disconnect = () => {
    setWallet(null);
    setProfileOpen(false);
    showNotice("Wallet disconnected");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      <Header
        onMore={() => setMoreOpen(true)}
        view={view}
        onView={go}
        wallet={wallet}
        onConnect={() => setConnectOpen(true)}
        onDisconnect={disconnect}
        onProfile={() => setProfileOpen(true)}
        onNotice={showNotice}
      />
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-6 sm:pb-[calc(9rem+env(safe-area-inset-bottom,0px))] md:pt-8 lg:px-8 lg:pb-20">
        {view === "Portfolio" && (
          <Portfolio
            terms={terms}
            onAction={setAction}
            onNotice={showNotice}
            onView={go}
            onReceipt={setReceipt}
            alloc={alloc}
            total={cash}
            idleCash={idleCash}
            showIdleBanner={cashIsUnallocated}
            rows={allRows()}
          />
        )}
        {view === "Invest" && <Invest onAction={setAction} terms={terms} />}
        {view === "Active Earn" && (
          <ActiveEarn
            terms={terms}
            onAction={setAction}
            earned={earned}
            done={tasksDone}
            attempts={tasksStarted}
            attemptedTasks={startedTaskTitles}
            taskLimit={TASK_SESSION_LIMIT}
          />
        )}
        {view === "Wallet & Ledger" && (
          <WalletLedger
            rows={allRows()}
            cash={availableCash}
            earned={earned}
            onAction={setAction}
            onReceipt={setReceipt}
            wallet={wallet}
            onConnect={() => setConnectOpen(true)}
          />
        )}
        {view === "Invite Friends" && <InviteFriends onNotice={showNotice} />}
        {view === "How It Works" && <HowItWorks terms={terms} onStart={() => go("Invest")} />}
        {view === "Q&A" && <FAQ terms={terms} onSupport={() => go("Support")} />}
        {view === "About" && <About />}
        {view === "Rules" && <Rules terms={terms} />}
        {view === "Support" && <Support onNotice={showNotice} onFaq={() => go("Q&A")} />}
      </main>
      <MobileNav
        view={view}
        onView={go}
        onMore={() => setMoreOpen(true)}
        onAction={() => setAction("Deposit")}
      />
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-[18px] border-border bg-popover">
          <SheetHeader className="text-left">
            <SheetTitle>More</SheetTitle>
            <SheetDescription>Learn, share, and get help.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 grid gap-2 pb-4">
            {moreItems.map(({ label, icon: Icon, copy }) => (
              <button
                key={label}
                onClick={() => go(label)}
                className={cn(
                  "flex items-center gap-3 rounded-md border p-3 text-left",
                  view === label
                    ? "border-success/40 bg-success/10"
                    : "border-border bg-background/40",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{copy}</span>
                </span>
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      {notice && (
        <div className="fixed bottom-[calc(7.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[60] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-md border border-success/25 bg-popover px-4 py-3 text-sm shadow-panel lg:bottom-5">
          <Check className="size-4 shrink-0 text-success" />{" "}
          <span className="truncate">{notice}</span>
        </div>
      )}
      <TransferDialog
        flow={flow}
        cash={availableCash}
        terms={terms}
        walletAddress={wallet ? WALLET_ADDRESS : null}
        onWalletRequired={() => requireWallet(flow)}
        onClose={() => setFlow(null)}
        onNotice={showNotice}
        onDeposit={(n, net, strategyAlloc, strategyName) => {
          if (!wallet) return requireWallet(flow);
          setFlow(null);
          const id = addEntry(
            `USDC deposit · ${strategyName} auto-deployed`,
            `+${fmt(n)}`,
            `${net} network • ${stamp()}`,
            "cash",
            Plus,
            { status: "pending", vaultId: strategyName },
          );
          showNotice(`Deposit of ${fmt(n)} with ${strategyName} is pending clearing`);
          settleEntry(
            id,
            () => {
              setCash((c) => c + n);
              setAlloc(strategyAlloc);
            },
            `Deposit of ${fmt(n)} with ${strategyName} confirmed`,
          );
        }}
        onWithdraw={(n, net) => {
          if (!wallet) return requireWallet(flow);
          setFlow(null);
          const id = addEntry(
            "USDC withdrawal",
            `-${fmt(n)}`,
            `${net} • ${stamp()}`,
            "digital",
            ArrowDownToLine,
            {
              status: "pending",
              vaultId: "Connected wallet",
              settlementTier: net.includes("Instant") ? "Express" : "Standard T+1",
            },
          );
          showNotice(`Withdrawal of ${fmt(n)} is pending clearing`);
          settleEntry(id, () => setCash((c) => c - n), `Withdrawal of ${fmt(n)} confirmed`);
        }}
      />
      <RebalanceDialog
        open={flow?.kind === "rebalance"}
        alloc={alloc}
        initial={flow?.kind === "rebalance" ? (flow.initial ?? null) : null}
        targetVault={flow?.kind === "rebalance" ? (flow.targetVault ?? null) : null}
        total={cash}
        rebalanceFee={terms.fees.rebalance}
        walletAddress={wallet ? WALLET_ADDRESS : null}
        onWalletRequired={() => requireWallet(flow)}
        onClose={() => setFlow(null)}
        onSave={(a) => {
          if (!wallet) return requireWallet(flow);
          setAlloc(a);
          setFlow(null);
          addEntry(
            "Portfolio rebalanced",
            "$0.00",
            `Target mix updated • ${stamp()}`,
            "cloud",
            RefreshCw,
          );
          showNotice("Target mix saved");
        }}
      />
      <CalculatorDialog
        open={flow?.kind === "calculator"}
        onClose={() => setFlow(null)}
        onInvest={(amount, target) => {
          const strategyName: DepositStrategyName =
            target.Cloud >= 60
              ? "Aggressive Tech"
              : target.Cash >= 60
                ? "Conservative Haven"
                : "Balanced Yield";
          requireWallet({
            kind: "deposit",
            initialAmount: amount,
            initialAlloc: target,
            initialStrategy: strategyName,
          });
        }}
      />
      <TaskDialog
        flow={flow}
        walletAddress={wallet ? WALLET_ADDRESS : null}
        onWalletRequired={() => requireWallet(flow)}
        onClose={() => setFlow(null)}
        onComplete={async (title, reward) => {
          if (!wallet) return requireWallet(flow);
          const entropy = crypto.getRandomValues(new Uint8Array(32));
          const receiptPayload = new TextEncoder().encode(
            `${title}|${reward}|${WALLET_ADDRESS}|${Date.now()}|${Array.from(entropy).join(",")}`,
          );
          const digest = await crypto.subtle.digest("SHA-256", receiptPayload);
          const reference = `0x${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
          setFlow(null);
          const id = addEntry(
            `AI task payout · ${title}`,
            `+${fmt(reward)}`,
            `${WALLET_ADDRESS} · ${stamp()}`,
            "task",
            Zap,
            {
              status: "pending",
              vaultId: "AI Task Work",
              settlementTier: "Instant verification · gas-free Base",
              reference,
            },
          );
          setCash((current) => current + reward);
          setEarned((current) => current + reward);
          setTasksDone((current) => current + 1);
          showNotice(`Task payout of ${fmt(reward)} credited; settlement pending`);
          settleEntry(id, () => {}, `Task payout of ${fmt(reward)} confirmed`);
        }}
      />
      <VaultDetailDialog
        vault={
          flow?.kind === "vault"
            ? (vaults.map((v) => withTerms(v, terms, alloc)).find((v) => v.name === flow.name) ??
              null)
            : null
        }
        onClose={() => setFlow(null)}
        onNotice={showNotice}
        onDeposit={(name) => requireWallet({ kind: "deposit", vault: name })}
      />
      <ConnectWalletDialog
        open={connectOpen}
        onOpenChange={(open) => {
          setConnectOpen(open);
          if (!open) setPendingFlow(null);
        }}
        onConnected={(w) => {
          setWallet(w);
          setConnectOpen(false);
          const requestedFlow = pendingFlow;
          setPendingFlow(null);
          if (requestedFlow?.kind === "task") {
            setTasksStarted((current) => current + 1);
            setStartedTaskTitles((current) => [...current, requestedFlow.title]);
          }
          if (requestedFlow) setFlow(requestedFlow);
          showNotice(`${WALLET_ADDRESS} connected on Base network`);
        }}
      />
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        wallet={wallet}
        onConnect={() => {
          setProfileOpen(false);
          setConnectOpen(true);
        }}
        onDisconnect={disconnect}
        onInvite={() => go("Invite Friends")}
        onNotice={showNotice}
      />
      <ReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} onNotice={showNotice} />
    </div>
  );
}

function Header({
  view,
  onView,
  wallet,
  onConnect,
  onDisconnect,
  onProfile,
  onNotice,
  onMore,
}: {
  onMore: () => void;
  view: View;
  onView: (view: View) => void;
  wallet: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onProfile: () => void;
  onNotice: (m: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <button
          className="flex min-w-0 shrink-0 items-center gap-3"
          onClick={() => onView("Portfolio")}
          aria-label="Open portfolio"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <Layers3 className="size-5" />
          </span>
          <span className="text-base font-semibold">DepVest</span>
          <span className="hidden rounded border border-border px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground 2xl:inline">
            Multi-Asset Hub
          </span>
        </button>
        <nav
          className="hidden rounded-full border border-border bg-card p-1 lg:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <NavButton
              key={item.label}
              item={item}
              active={view === item.label}
              onClick={() => onView(item.label)}
            />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 xl:flex">
            {moreItems.map((m) => (
              <button
                key={m.label}
                onClick={() => onView(m.label)}
                className={cn(
                  "rounded-full px-3 py-2 text-xs transition-colors",
                  view === m.label
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          {wallet ? (
            <WalletChip wallet={wallet} onDisconnect={onDisconnect} onNotice={onNotice} />
          ) : (
            <Button
              onClick={onConnect}
              className="h-9 shrink-0 rounded-full bg-success px-3 text-primary-foreground hover:bg-success/90 sm:px-4"
            >
              <WalletCards />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          )}
          <NotificationsPopover />
          <button
            onClick={onProfile}
            aria-label="Open profile"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary text-xs font-semibold transition-colors hover:border-success/50"
          >
            <User className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileNav({
  view,
  onView,
  onMore,
}: {
  view: View;
  onView: (v: View) => void;
  onMore: () => void;
  onAction?: () => void;
}) {
  const Tab = ({
    label,
    short,
    Icon,
    active,
    onClick,
  }: {
    label: string;
    short: string;
    Icon: typeof Menu;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="group flex h-full min-w-0 flex-1 items-center justify-center px-0.5"
    >
      <span
        className={cn(
          "flex h-[52px] w-full max-w-[68px] flex-col items-center justify-center gap-1 rounded-2xl border text-[10px] font-medium transition-all duration-200",
          active
            ? "border-success/35 bg-success/15 text-success shadow-glow"
            : "border-transparent text-foreground/85 group-hover:bg-secondary/60 group-hover:text-foreground group-active:scale-95",
        )}
      >
        <Icon className={cn("size-5 transition-transform", active && "scale-110")} />
        <span className={cn("truncate", active && "font-semibold")}>{short}</span>
      </span>
    </button>
  );
  const moreActive = moreItems.some((m) => m.label === view);
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto w-[calc(100%-1.5rem)] max-w-md lg:hidden"
    >
      <div className="flex h-[68px] items-stretch rounded-3xl border border-border bg-card px-1 drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
        {navItems.map((item) => (
          <Tab
            key={item.label}
            label={item.label}
            short={item.short}
            Icon={item.icon}
            active={view === item.label}
            onClick={() => onView(item.label)}
          />
        ))}
        <Tab label="More" short="More" Icon={Menu} active={moreActive} onClick={onMore} />
      </div>
    </nav>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-2 rounded-full px-4 text-xs transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {item.label}
    </button>
  );
}

function Portfolio({
  terms,
  onAction,
  onNotice,
  onView,
  onReceipt,
  alloc,
  total,
  idleCash,
  showIdleBanner,
  rows,
}: {
  onAction: (value: string) => void;
  onNotice: (value: string) => void;
  onView: (v: View) => void;
  onReceipt: (r: Receipt) => void;
  alloc: Alloc;
  total: number;
  idleCash: number;
  showIdleBanner: boolean;
  rows: typeof activity;
  terms: Terms;
}) {
  return (
    <>
      <PortfolioSummary onAction={onAction} alloc={alloc} total={total} />
      {total > 0 && idleCash > 0 && showIdleBanner && (
        <section className="mt-4 flex flex-col gap-4 rounded-[14px] border border-success/35 bg-success/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">You have {usd(idleCash)} in liquid cash.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Put your capital to work across yield-generating vaults.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Preview only. Strategy changes are simulated and returns are not guaranteed.
            </p>
          </div>
          <Button className="shrink-0 rounded-full" onClick={() => onAction("Rebalance")}>
            Deploy to Vaults <ArrowUpRight />
          </Button>
        </section>
      )}
      {total === 0 && (
        <section
          aria-label="Activate your account"
          className="mt-4 rounded-[14px] border border-border bg-card p-5"
        >
          <p className="text-sm font-semibold">Activate Your Account</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose how you want to start growing your balance.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col rounded-md border border-success/30 bg-success/10 p-4">
              <Landmark className="size-5 text-success" />
              <b className="mt-3 text-sm">Deploy Capital</b>
              <p className="mt-1 flex-1 text-[11px] text-muted-foreground">
                Earn passive yield via Treasury, Compute, or Blue-Chips.
              </p>
              <Button className="mt-4 rounded-full" onClick={() => onAction("Deposit")}>
                Deploy Capital
                <ArrowUpRight />
              </Button>
            </div>
            <div className="flex flex-col rounded-md border border-task/30 bg-task/10 p-4">
              <Zap className="size-5 text-task" />
              <b className="mt-3 text-sm">Earn Without Depositing</b>
              <p className="mt-1 flex-1 text-[11px] text-muted-foreground">
                Zero capital. Get paid instantly for validating AI datasets.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => onView("Active Earn")}
              >
                Earn Without Depositing
                <Zap />
              </Button>
            </div>
          </div>
        </section>
      )}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionLabel title="Asset Vaults" right={`4 vaults · ${usd(total)} total`} />
          <TooltipProvider>
            <div className="space-y-4">
              {vaults.map((vault) => (
                <VaultCard
                  key={vault.name}
                  vault={withTerms(vault, terms, alloc, total)}
                  onAction={onAction}
                  onNotice={onNotice}
                  idleCash={idleCash}
                />
              ))}
            </div>
          </TooltipProvider>
          <div className="mt-4 flex items-center gap-3 rounded-md border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
            <Sparkles className="size-4 shrink-0" />
            <span className="min-w-0">
              Add a new vault? Explore private credit & DePIN coming soon.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => onAction("Waitlist")}
            >
              Join waitlist
            </Button>
          </div>
        </section>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Performance
            onAction={onAction}
            onView={onView}
            onReceipt={onReceipt}
            rows={rows}
            terms={terms}
            alloc={alloc}
            balance={total}
          />
          <div className="flex items-start gap-3 rounded-md border border-border bg-card p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary">
              <ShieldCheck className="size-4 text-muted-foreground" />
            </span>
            <div>
              <p className="text-xs font-medium">Institutional-grade custody</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Custody and audit details will be published with the official product terms.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function PortfolioSummary({
  onAction,
  alloc,
  total,
}: {
  onAction: (value: string) => void;
  alloc: Alloc;
  total: number;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-border bg-card shadow-panel">
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_250px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Label>Portfolio Value</Label>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-4">
            <h1 className="font-mono text-4xl font-medium md:text-[44px]">{usd(total)}</h1>
          </div>
          <div className="mt-10 grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 flex justify-between">
                <Label>Asset Allocation</Label>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {Object.values(alloc).some(Boolean)
                    ? "Target mix"
                    : "Not allocated yet — use Rebalance"}
                </span>
              </div>
              <AllocationBar alloc={alloc} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Legend accent="cash" label="Cash" value={`${alloc.Cash}%`} />
                <Legend accent="cloud" label="Cloud" value={`${alloc.Cloud}%`} />
                <Legend accent="digital" label="Digital" value={`${alloc.Digital}%`} />
                <Legend accent="task" label="Task" value={`${alloc.Task}%`} />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div
                style={ringStyle(alloc)}
                className="grid size-[132px] shrink-0 place-items-center rounded-full"
              >
                <div className="grid size-[92px] place-items-center rounded-full bg-card text-center">
                  <div>
                    <Label>Allocation</Label>
                    <p className="mt-1 text-lg font-semibold">4 ASSETS</p>
                  </div>
                </div>
              </div>
              <div className="hidden grid-cols-2 gap-x-6 gap-y-3 text-xs xl:grid">
                <span className="text-muted-foreground">Cash</span>
                <b>{alloc.Cash}%</b>
                <span className="text-muted-foreground">Cloud</span>
                <b>{alloc.Cloud}%</b>
                <span className="text-muted-foreground">Digital</span>
                <b>{alloc.Digital}%</b>
                <span className="text-muted-foreground">Task</span>
                <b>{alloc.Task}%</b>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col">
          <Button
            className="shrink-0 justify-center rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onAction("Deposit funds")}
          >
            <Plus />
            Deposit
          </Button>
          <Button
            variant="outline"
            className="shrink-0 justify-center rounded-full"
            onClick={() => onAction("Withdraw funds")}
          >
            <ArrowDownToLine />
            Withdraw
          </Button>
          <Button
            variant="outline"
            className="shrink-0 justify-center rounded-full"
            onClick={() => onAction("Rebalance")}
          >
            <RefreshCw />
            Rebalance
          </Button>
          <Button
            className="shrink-0 justify-center rounded-full border border-success/25 bg-success/15 text-success hover:bg-success/20"
            onClick={() => onAction("Quick Earn")}
          >
            <Zap />
            Quick Earn
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-6 py-4 text-[10px] text-muted-foreground md:px-8">
        <span>◉ Rates shown only once verified</span>
        <span>◉ 4 vaults</span>
      </div>
    </section>
  );
}

function VaultCard({
  vault,
  onAction,
  onNotice,
  idleCash,
}: {
  vault: (typeof vaults)[number];
  onAction: (value: string) => void;
  onNotice: (value: string) => void;
  idleCash: number;
}) {
  const [auto, setAuto] = useState(vault.auto);
  const [startedAt] = useState(() => Date.now());
  const [clock, setClock] = useState(startedAt);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const elapsed = clock - startedAt;
  const dayMs = 24 * 60 * 60 * 1000;
  const treasuryRemaining =
    (4 * 60 + 18 - (Math.floor(elapsed / 60_000) % (24 * 60)) + 24 * 60) % (24 * 60);
  const cloudRemaining = (12 * dayMs - (elapsed % (30 * dayMs)) + 30 * dayMs) % (30 * dayMs);
  const epochDays = Math.ceil(cloudRemaining / dayMs);
  const epochNumber = 14 + Math.floor((18 * dayMs + elapsed) / (30 * dayMs));
  const epochProgress = (((18 * dayMs + elapsed) % (30 * dayMs)) / (30 * dayMs)) * 100;
  const Icon = vault.icon;
  return (
    <article className="group rounded-[14px] border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-px">
      <div className="flex items-start gap-4">
        <span className={cn("vault-icon", `accent-${vault.accent}`)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{vault.name}</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Where does the yield come from for ${vault.name}?`}
                  className="rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CircleHelp className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-64 whitespace-normal text-left leading-relaxed"
              >
                <span className="font-semibold">Where does the yield come from?</span>
                <br />
                {vault.sourceExplanation}
                <br />
                <span className="text-primary-foreground/70">
                  Strategy description only; not confirmation of live assets or returns.
                </span>
              </TooltipContent>
            </Tooltip>
            <Badge accent={vault.accent}>
              ● {vault.rate} <span className="text-muted-foreground">{vault.rateLabel}</span>
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge accent={vault.accent}>{vault.risk}</Badge>
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">
              ✓ {vault.badge}
            </span>
            <span className="text-[10px] text-muted-foreground">{vault.detail}</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">{vault.note}</p>
          <p className="mt-1 text-[10px] text-success">
            {vault.accent === "cash"
              ? `Daily Compounding · Next payout in ${String(Math.floor(treasuryRemaining / 60)).padStart(2, "0")}h ${String(treasuryRemaining % 60).padStart(2, "0")}m`
              : vault.accent === "cloud"
                ? `Epoch #${epochNumber} (30-Day Cycle) · Closes in ${epochDays} days`
                : vault.accent === "digital"
                  ? "7-Day Unstaking Cooldown · Flexible Rewards"
                  : "Instant Payout Upon Verification"}
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground">
          <span className="hidden sm:inline">Auto-comp</span>
          <button
            aria-label={`Toggle auto-compound for ${vault.name}`}
            aria-pressed={auto}
            onClick={() => {
              setAuto(!auto);
              onNotice(`Auto-compound ${auto ? "paused" : "enabled"} for ${vault.name}`);
            }}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              auto ? "bg-success" : "bg-secondary",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-4 rounded-full bg-foreground transition-all",
                auto ? "left-[18px]" : "left-0.5",
              )}
            />
          </button>
        </label>
      </div>
      {vault.accent === "cloud" && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[9px] text-muted-foreground">
            <span>Epoch progress</span>
            <span>{Math.round(epochProgress)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <span
              className="block h-full rounded-full bg-cloud"
              style={{ width: `${epochProgress}%` }}
            />
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <Label>Balance</Label>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="font-mono text-[22px]">{vault.balance}</strong>
            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
              {vault.allocation}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">◉ {vault.terms}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
          {idleCash > 0 && (vault.accent === "cloud" || vault.accent === "digital") && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => onAction(`Allocate Cash: ${vault.name}`)}
            >
              Allocate Cash
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onAction(`Invest in ${vault.name}`)}
          >
            Details <ChevronRight />
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onAction(`${vault.action}: ${vault.name}`)}
          >
            <span className="truncate">{vault.action}</span> <ArrowUpRight />
          </Button>
        </div>
      </div>
      <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-secondary">
        <span
          className={cn("block h-full", `bar-${vault.accent}`)}
          style={{ width: vault.allocation }}
        />
      </div>
    </article>
  );
}

function Performance({
  onAction,
  onView,
  onReceipt,
  rows,
  terms,
  alloc,
  balance,
}: {
  onAction: (v: string) => void;
  onView: (v: View) => void;
  onReceipt: (r: Receipt) => void;
  rows: typeof activity;
  terms: Terms;
  alloc: Alloc;
  balance: number;
}) {
  const [tab, setTab] = useState<"performance" | "activity">("performance");
  const [range, setRange] = useState<"1W" | "1M" | "3M" | "1Y" | "ALL">("1M");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ranges = { "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: 1825 } as const;
  const weights = alloc.Cash + alloc.Cloud + alloc.Digital;
  const hasAllocation = weights > 0;
  const illustrativeWeights = { Cash: 40, Cloud: 35, Digital: 25 };
  const blendedRate =
    (["Cash", "Cloud", "Digital"] as const).reduce((sum, key) => {
      const weight = hasAllocation ? alloc[key] : illustrativeWeights[key];
      return sum + weight * (terms.apy[key] ?? 0);
    }, 0) / (hasAllocation ? 100 : 100);
  const missingActiveRate = (["Cash", "Cloud", "Digital"] as const).some(
    (key) => alloc[key] > 0 && terms.apy[key] == null,
  );
  const effectiveRate = hasAllocation ? blendedRate : 0;
  const dailyAccrual = missingActiveRate
    ? null
    : balance * (Math.pow(1 + effectiveRate / 100, 1 / 365) - 1);
  const annualReturn = missingActiveRate
    ? null
    : balance * (Math.pow(1 + effectiveRate / 100, 365 / 365) - 1);
  const rangeDays = ranges[range];
  const now = Date.now();
  const isProjection = balance === 0;
  const chartRate = hasAllocation ? blendedRate : 7.4;
  const chartPrincipal = isProjection
    ? 1000
    : balance / Math.pow(1 + Math.max(0, blendedRate) / 100, rangeDays / 365);
  const points = Array.from({ length: 33 }, (_, index) => {
    const progress = index / 32;
    const elapsedDays = rangeDays * progress;
    const direction = isProjection ? 1 : progress - 1;
    const date = new Date(now + direction * elapsedDays * 24 * 60 * 60 * 1000);
    const nav = chartPrincipal * Math.pow(1 + Math.max(0, chartRate) / 100, elapsedDays / 365);
    return { date, nav, yield: nav - chartPrincipal };
  });
  const minNav = Math.min(...points.map((point) => point.nav));
  const maxNav = Math.max(...points.map((point) => point.nav));
  const spread = Math.max(maxNav - minNav, chartPrincipal * 0.001, 0.01);
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: 28 + (index / (points.length - 1)) * 464,
    y: 178 - ((point.nav - minNav) / spread) * 130,
  }));
  const selected = hoveredIndex == null ? null : chartPoints[hoveredIndex];
  const line = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${line} L 492 190 L 28 190 Z`;
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: range === "ALL" ? "2-digit" : undefined,
    });
  const formatMoney = (amount: number) =>
    `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <section className="overflow-hidden rounded-[14px] border border-border bg-card shadow-card">
      <div className="flex items-center gap-1 border-b border-border p-3">
        <button
          aria-pressed={tab === "performance"}
          onClick={() => setTab("performance")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
            tab === "performance"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-secondary",
          )}
        >
          <BarChart3 className="size-3.5" />
          Performance
        </button>
        <button
          aria-pressed={tab === "activity"}
          onClick={() => setTab("activity")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
            tab === "activity"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-secondary",
          )}
        >
          <Activity className="size-3.5" />
          Live Activity
        </button>
      </div>
      {tab === "performance" ? (
        <div className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Portfolio performance</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {isProjection
                  ? `Projected Growth at ${chartRate.toFixed(2)}% Blended APY`
                  : "Estimated growth · yield simulated at current blended APY"}
              </p>
            </div>
            <span className="rounded-full border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] text-muted-foreground">
              {range}
            </span>
          </div>
          <div className="mb-3 flex justify-end gap-1">
            {(Object.keys(ranges) as Array<keyof typeof ranges>).map((item) => (
              <button
                key={item}
                aria-pressed={range === item}
                onClick={() => {
                  setRange(item);
                  setHoveredIndex(null);
                }}
                className={cn(
                  "min-w-8 rounded-full px-2 py-1.5 font-mono text-[9px] transition-colors",
                  range === item
                    ? "bg-success/15 text-success"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative">
            {selected && (
              <div className="pointer-events-none absolute left-1/2 top-1 z-10 -translate-x-1/2 rounded-md border border-border bg-popover/95 px-3 py-2 text-[10px] shadow-panel sm:left-auto sm:right-2 sm:translate-x-0">
                <p className="mb-1 font-medium">{formatDate(selected.date)}</p>
                <p className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Portfolio NAV</span>
                  <b className="font-mono">{formatMoney(selected.nav)}</b>
                </p>
                <p className="mt-1 flex justify-between gap-4">
                  <span className="text-muted-foreground">Cumulative simulated yield</span>
                  <b className="font-mono text-success">{formatMoney(selected.yield)}</b>
                </p>
              </div>
            )}
            <svg
              viewBox="0 0 520 210"
              className="h-[174px] w-full overflow-visible text-success sm:h-[190px]"
              preserveAspectRatio="none"
              role="slider"
              aria-label={`${range} portfolio ${isProjection ? "projected" : "estimated"} performance chart`}
              aria-valuemin={0}
              aria-valuemax={32}
              aria-valuenow={hoveredIndex ?? 32}
              aria-valuetext={
                selected
                  ? `${formatDate(selected.date)}, portfolio NAV ${formatMoney(selected.nav)}, cumulative simulated yield ${formatMoney(selected.yield)}`
                  : "Hover or use arrow keys to inspect the chart"
              }
              tabIndex={0}
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredIndex(
                  Math.max(
                    0,
                    Math.min(32, Math.round(((event.clientX - rect.left) / rect.width) * 32)),
                  ),
                );
              }}
              onFocus={() => setHoveredIndex((index) => index ?? 32)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                setHoveredIndex((index) =>
                  Math.max(0, Math.min(32, (index ?? 32) + (event.key === "ArrowRight" ? 1 : -1))),
                );
              }}
            >
              <defs>
                <linearGradient id="performance-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity=".24" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[58, 100, 142, 184].map((y) => (
                <line
                  key={y}
                  x1="28"
                  y1={y}
                  x2="492"
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity=".1"
                  strokeDasharray="3 5"
                />
              ))}
              <path d={area} fill="url(#performance-fill)" />
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={isProjection ? "7 5" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              {selected && (
                <>
                  <line
                    x1={selected.x}
                    y1="30"
                    x2={selected.x}
                    y2="190"
                    stroke="currentColor"
                    strokeOpacity=".4"
                    strokeDasharray="3 4"
                  />
                  <circle
                    cx={selected.x}
                    cy={selected.y}
                    r="5"
                    fill="currentColor"
                    stroke="var(--card)"
                    strokeWidth="2"
                  />
                </>
              )}
              <rect x="28" y="20" width="464" height="175" fill="transparent" />
            </svg>
          </div>
          <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
            <span>{formatDate(chartPoints[0].date)}</span>
            <span className="flex items-center gap-2">
              <i className="text-success">{isProjection ? "– Projection" : "– Estimated"}</i>
              <i>{isProjection ? "$1,000 illustration · not invested" : "– Simulated yield"}</i>
            </span>
            <span>{formatDate(chartPoints[32].date)}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric
              label={hasAllocation ? "Blended net APY" : "Illustrative APY"}
              value={
                missingActiveRate
                  ? "Unconfigured"
                  : `${(hasAllocation ? blendedRate : chartRate).toFixed(2)}%`
              }
              note={
                hasAllocation
                  ? `${alloc.Cash}% cash · ${alloc.Cloud}% cloud · ${alloc.Digital}% digital`
                  : "Example 40/35/25 vault mix"
              }
              success
            />
            <Metric
              label="Daily run-rate"
              value={dailyAccrual == null ? "Unconfigured" : `+${formatMoney(dailyAccrual)}`}
              note="/ day · at current balance"
              success
            />
            <Metric
              label="1Y projected return"
              value={annualReturn == null ? "Unconfigured" : `+${formatMoney(annualReturn)}`}
              note="/ yr · compounded estimate"
              success
            />
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
            Illustrative simulation, not verified performance or a guarantee. Actual returns depend
            on deployed balances and live rates.
          </p>
          <button
            onClick={() => onAction("Calculator")}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-md border border-success/25 bg-success/10 p-3 text-left text-[11px]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-success" />
              <span className="truncate">Compare blended strategy projections</span>
            </span>
            <span className="shrink-0 text-success">Calculator →</span>
          </button>
        </div>
      ) : (
        <div className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Live Activity</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {rows.length} {rows.length === 1 ? "transaction" : "transactions"} · latest first
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] text-success">
              <i className="size-1.5 animate-pulse rounded-full bg-success" />
              Updated live
            </span>
          </div>
          <div className="space-y-2">
            {rows.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-5 text-center text-[11px] text-muted-foreground">
                No activity yet. Deposits, payouts and tasks will appear here.
              </p>
            ) : (
              rows.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const statusLabel =
                  item.status === "pending"
                    ? "Clearing"
                    : item.status === "completed"
                      ? "Settled"
                      : "Failed";
                return (
                  <button
                    key={item.id}
                    onClick={() => onReceipt(item)}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-background/30 p-3 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className={cn("vault-icon size-8 shrink-0", `accent-${item.accent}`)}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium">{item.title}</span>
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[10px]",
                            item.value.startsWith("-") ? "text-muted-foreground" : "text-success",
                          )}
                        >
                          {item.value}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[9px] text-muted-foreground">
                          {item.meta}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[9px]",
                            item.status === "pending"
                              ? "bg-warning/15 text-warning"
                              : item.status === "completed"
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {statusLabel}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <button
            onClick={() => onView("Wallet & Ledger")}
            className="mt-4 w-full rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-left text-[10px] font-medium text-success transition-colors hover:bg-secondary"
          >
            View full ledger ({rows.length} {rows.length === 1 ? "transaction" : "transactions"}) →
          </button>
        </div>
      )}
    </section>
  );
}

function Invest({ onAction, terms }: { onAction: (value: string) => void; terms: Terms }) {
  const [query, setQuery] = useState("");
  const visible = vaults
    .map((v) => withTerms(v, terms))
    .filter((vault) => vault.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <section>
      <PageIntro
        eyebrow="Vault Marketplace"
        title="Put every dollar to work."
        copy="Compare verified yield strategies across cash, compute, and digital assets."
      />
      <div className="mb-6 flex items-center gap-3 rounded-md border border-border bg-card px-4">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vaults"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((vault) => (
          <article key={vault.name} className="rounded-[14px] border border-border bg-card p-6">
            <div className="flex justify-between">
              <span className={cn("vault-icon", `accent-${vault.accent}`)}>
                <vault.icon className="size-5" />
              </span>
              <Badge accent={vault.accent}>{vault.risk}</Badge>
            </div>
            <h2 className="mt-6 text-lg font-semibold">{vault.name}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{vault.detail}</p>
            <p className="mt-7 font-mono text-3xl">
              {vault.rate} <span className="text-xs text-muted-foreground">{vault.rateLabel}</span>
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <span className="text-[10px] text-muted-foreground">{vault.terms}</span>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => onAction(`Invest in ${vault.name}`)}
              >
                Explore <ArrowUpRight />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActiveEarn({
  onAction,
  earned,
  done,
  attempts,
  terms,
  attemptedTasks,
  taskLimit,
}: {
  onAction: (value: string) => void;
  earned: number;
  done: number;
  attempts: number;
  terms: Terms;
  attemptedTasks: string[];
  taskLimit: number;
}) {
  const rewardRangeConfig = terms.taskReward;
  const taskDefinitions = [
    {
      title: "Validate product labels",
      detail: "Match products to their best-fit category.",
      time: "~3 min",
      icon: Bot,
      tier: 0,
    },
    {
      title: "Tag customer intent",
      detail: "Classify short customer messages.",
      time: "~2 min",
      icon: CircleHelp,
      tier: 0.15,
    },
    {
      title: "Review AI summary",
      detail: "Check generated summaries for factuality and tone.",
      time: "~4 min",
      icon: Sparkles,
      tier: 0.35,
    },
    {
      title: "Classify satellite tiles",
      detail: "Identify the dominant land use in map tiles.",
      time: "~3 min",
      icon: Layers3,
      tier: 0.5,
    },
    {
      title: "Check product attributes",
      detail: "Review product details for accuracy.",
      time: "~3 min",
      icon: Check,
      tier: 0.6,
    },
    {
      title: "Screen listing content",
      detail: "Flag restricted or sensitive listing content.",
      time: "~4 min",
      icon: ShieldCheck,
      tier: 0.75,
    },
    {
      title: "Categorize help requests",
      detail: "Route support messages to the right team.",
      time: "~2 min",
      icon: CircleHelp,
      tier: 0.85,
    },
    {
      title: "Detect duplicate listings",
      detail: "Compare listing details for likely duplicates.",
      time: "~4 min",
      icon: Search,
      tier: 1,
    },
  ];
  const tasks = taskDefinitions.map((task) => {
    const amount = rewardRangeConfig
      ? Math.round(
          (rewardRangeConfig.min + (rewardRangeConfig.max - rewardRangeConfig.min) * task.tier) *
            100,
        ) / 100
      : null;
    return { ...task, reward: amount == null ? "Unconfigured" : `$${amount.toFixed(2)}` };
  });
  const remaining = Math.max(0, taskLimit - attempts);
  const visibleTasks = tasks.filter((task) => !attemptedTasks.includes(task.title));
  const atLimit = remaining === 0;
  const completedPercent = Math.min(100, Math.round((attempts / taskLimit) * 100));

  return (
    <section>
      <PageIntro
        eyebrow="Active Earn"
        title="Earn by completing quality tasks."
        copy={`${rewardRange(rewardRangeConfig)} per accepted task · Up to ${taskLimit} task attempts per session · Rewards depend on task acceptance`}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {atLimit ? (
            <div className="rounded-[14px] border border-success/25 bg-success/5 p-6">
              <h2 className="text-base font-semibold">Session task limit reached</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                You used all {taskLimit} task attempts this session. Attempt limits and earnings
                reset when you reload the app.
              </p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="rounded-[14px] border border-border bg-card p-6">
              <h2 className="text-base font-semibold">You completed every available task</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Check back when more tasks are available.
              </p>
            </div>
          ) : (
            visibleTasks.map(({ title, detail, reward, time, icon: Icon }) => (
              <article
                key={title}
                className="flex flex-wrap items-center gap-3 rounded-[14px] border border-border bg-card p-4 sm:flex-nowrap sm:gap-4 sm:p-5"
              >
                <span className="vault-icon accent-task shrink-0">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {detail} · {time}
                  </p>
                </div>
                <strong className="font-mono text-success">{reward}</strong>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!rewardRangeConfig || atLimit}
                  onClick={() => onAction(`Task|${title}|${reward.slice(1)}`)}
                >
                  Start task <ChevronRight />
                </Button>
              </article>
            ))
          )}
        </div>
        <aside className="h-fit rounded-[14px] border border-border bg-card p-6">
          <Label>This session</Label>
          <p className="mt-3 font-mono text-4xl">${earned.toFixed(2)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {done} accepted · {attempts} of {taskLimit} attempts used
          </p>
          <div className="mt-5">
            <ProgressRow label="Session limit" value={`${completedPercent}%`} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {remaining} {remaining === 1 ? "attempt" : "attempts"} remaining in this session
          </p>
          <p className="mt-5 border-t border-border pt-4 text-[10px] leading-relaxed text-muted-foreground">
            Earnings are awarded only for accepted work. Task availability and reward amounts are
            subject to the applicable task terms.
          </p>
        </aside>
      </div>
    </section>
  );
}

function WalletLedger({
  rows,
  cash,
  earned,
  onAction,
  onReceipt,
  wallet,
  onConnect,
}: {
  rows: typeof activity;
  cash: number;
  earned: number;
  onAction: (value: string) => void;
  onReceipt: (r: Receipt) => void;
  wallet: string | null;
  onConnect: () => void;
}) {
  return (
    <section>
      <PageIntro
        eyebrow="Wallet & Ledger"
        title="Every movement, accounted for."
        copy="Review balances, yields, and verified portfolio transactions in one place."
      />
      <div className="mb-5 flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5 sm:flex-row sm:items-center">
        <span className="vault-icon accent-cash shrink-0">
          <WalletCards className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          {wallet ? (
            <>
              <p className="text-sm font-semibold">{wallet} connected</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {WALLET_ADDRESS} · Base network
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">No wallet connected</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Connect a wallet to deposit and receive payouts.
              </p>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {wallet ? (
            <>
              <Button className="rounded-full" onClick={() => onAction("Deposit funds")}>
                <Plus />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => onAction("Withdraw funds")}
              >
                <ArrowDownToLine />
                Withdraw
              </Button>
            </>
          ) : (
            <Button
              className="col-span-2 rounded-full bg-success text-primary-foreground hover:bg-success/90"
              onClick={onConnect}
            >
              <WalletCards />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        <WalletStat
          label="Available cash"
          value={`$${cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<WalletCards />}
        />
        <WalletStat
          label="Pending yield"
          value="—"
          note="Accrues once funds are allocated to a vault with a verified rate"
          icon={<Activity />}
        />
        <WalletStat label="Total earned" value={`$${earned.toFixed(2)}`} icon={<BarChart3 />} />
      </div>
      <div className="mt-6 rounded-[14px] border border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Transaction ledger</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Tap an entry to view its receipt
            </p>
          </div>
        </div>
        <LedgerFilters rows={rows} onReceipt={onReceipt} />
      </div>
    </section>
  );
}

const LEDGER_TYPES = ["All", "Deposits", "Withdrawals", "Tasks", "Rebalances"] as const;
const LEDGER_RANGES = ["All Time", "Today", "Last 7 Days", "Last 30 Days", "Custom"] as const;
const LEDGER_STATUSES = ["All Status", "Pending", "Completed"] as const;
const typeOf = (t: string) =>
  /deposit/i.test(t)
    ? "Deposits"
    : /withdraw/i.test(t)
      ? "Withdrawals"
      : /task|payout/i.test(t)
        ? "Tasks"
        : /rebalanc/i.test(t)
          ? "Rebalances"
          : "Other";
const localDayStart = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day).getTime() : null;
};
const localDayEnd = (value: string) => {
  const start = localDayStart(value);
  return start == null ? null : start + 24 * 60 * 60 * 1000 - 1;
};
function LedgerFilters({
  rows,
  onReceipt,
}: {
  rows: typeof activity;
  onReceipt: (r: Receipt) => void;
}) {
  const [type, setType] = useState<(typeof LEDGER_TYPES)[number]>("All");
  const [range, setRange] = useState<(typeof LEDGER_RANGES)[number]>("All Time");
  const [status, setStatus] = useState<(typeof LEDGER_STATUSES)[number]>("All Status");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const now = Date.now();
  const rangeMs: Record<Exclude<(typeof LEDGER_RANGES)[number], "Custom">, number | null> = {
    "All Time": null,
    Today: 24 * 60 * 60 * 1000,
    "Last 7 Days": 7 * 24 * 60 * 60 * 1000,
    "Last 30 Days": 30 * 24 * 60 * 60 * 1000,
  };
  const cutoff = range === "Custom" || rangeMs[range] == null ? null : now - rangeMs[range]!;
  const customStart = range === "Custom" && from ? localDayStart(from) : null;
  const customEnd = range === "Custom" && to ? localDayEnd(to) : null;
  const list = rows.filter(
    (r) =>
      (cutoff == null || r.timestamp >= cutoff) &&
      (customStart == null || r.timestamp >= customStart) &&
      (customEnd == null || r.timestamp <= customEnd) &&
      (type === "All" || typeOf(r.title) === type) &&
      (status === "All Status" || r.status === status.toLowerCase()) &&
      (r.title + " " + r.meta + " " + r.value).toLowerCase().includes(q.trim().toLowerCase()),
  );
  const hasActiveFilters =
    range !== "All Time" ||
    type !== "All" ||
    status !== "All Status" ||
    !!from ||
    !!to ||
    !!q.trim();
  const resetFilters = () => {
    setRange("All Time");
    setFrom("");
    setTo("");
    setType("All");
    setStatus("All Status");
    setQ("");
  };
  return (
    <>
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {LEDGER_RANGES.map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              aria-pressed={range === item}
              className={cn(
                "rounded-full px-3 py-1 text-[10px]",
                range === item
                  ? "bg-success/15 text-success"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        {range === "Custom" && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-[10px] text-muted-foreground">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
            <label className="grid gap-1 text-[10px] text-muted-foreground">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {LEDGER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px]",
                    type === t
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Transaction status" className="flex flex-wrap gap-1.5">
              {LEDGER_STATUSES.map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  aria-pressed={status === item}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px]",
                    status === item
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={80}
              placeholder="Search description, network, amount…"
              className="h-9 w-full rounded-full border border-input bg-background px-4 text-xs outline-none sm:ml-auto sm:w-64"
            />
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 rounded-full"
              onClick={() => exportLedgerCsv(list)}
            >
              Export statement
            </Button>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span>
              Showing {list.length} of {rows.length} transactions
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-success hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
      {rows.length === 0 && (
        <p className="p-8 text-center text-xs text-muted-foreground">
          No transactions yet. Make a deposit to get started.
        </p>
      )}
      {rows.length > 0 && list.length === 0 && (
        <p className="p-8 text-center text-xs text-muted-foreground">
          No transactions match the selected date range and filters.
        </p>
      )}
      {list.map((item) => (
        <button
          key={item.id}
          onClick={() => onReceipt(item)}
          className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4 text-left last:border-0 hover:bg-secondary/30 sm:gap-4"
        >
          <span className={cn("vault-icon size-8", `accent-${item.accent}`)}>
            <item.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{item.title}</p>
            <p className="mt-1 truncate text-[9px] text-muted-foreground">
              {new Date(item.timestamp).toLocaleString()} · {item.meta}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px]",
                item.status === "pending"
                  ? "bg-warning/15 text-warning"
                  : item.status === "failed"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-success/10 text-success",
              )}
            >
              {item.status === "pending" ? (
                <i className="size-1.5 animate-pulse rounded-full bg-warning" />
              ) : item.status === "failed" ? (
                "●"
              ) : (
                "✓"
              )}{" "}
              {item.status === "pending"
                ? "Pending Clearing"
                : item.status === "failed"
                  ? "Failed"
                  : "Completed"}
            </span>
          </div>
          <span
            className={cn(
              "font-mono text-xs",
              item.value.startsWith("-") ? "text-muted-foreground" : "text-success",
            )}
          >
            {item.value}
          </span>
        </button>
      ))}
    </>
  );
}

function AllocationBar({ alloc }: { alloc: Alloc }) {
  return (
    <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-secondary p-0.5">
      <span className="bar-cash rounded-full" style={{ width: `${alloc.Cash}%` }} />
      <span className="bar-cloud rounded-full" style={{ width: `${alloc.Cloud}%` }} />
      <span className="bar-digital rounded-full" style={{ width: `${alloc.Digital}%` }} />
      <span className="bar-task rounded-full" style={{ width: `${alloc.Task}%` }} />
    </div>
  );
}
function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  );
}
function Badge({ children, accent }: { children: ReactNode; accent: Accent }) {
  return (
    <span className={cn("rounded-full border px-2 py-1 text-[9px]", `badge-${accent}`)}>
      {children}
    </span>
  );
}
function Legend({ accent, label, value }: { accent: Accent; label: string; value: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[10px]">
      <i className={cn("size-2 rounded-full", `bar-${accent}`)} />
      {label}
      <b className="font-mono text-muted-foreground">{value}</b>
    </span>
  );
}
function SectionLabel({ title, right }: { title: string; right: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <Label>{title}</Label>
      <span className="font-mono text-[9px] text-muted-foreground">{right}</span>
    </div>
  );
}
function Metric({
  label,
  value,
  note,
  success,
}: {
  label: string;
  value: string;
  note: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 p-3">
      <Label>{label}</Label>
      <p className={cn("mt-2 font-mono text-xs font-semibold", success && "text-success")}>
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-[9px] text-muted-foreground",
          success && note.startsWith("+") && "text-success",
        )}
      >
        {note}
      </p>
    </div>
  );
}
function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-8 max-w-2xl md:mb-10">
      <Label>{eyebrow}</Label>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-[44px]">{title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{copy}</p>
    </div>
  );
}
function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: value }} />
      </div>
    </div>
  );
}
function WalletStat({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-6">
      <span className="vault-icon accent-cash">{icon}</span>
      <p className="mt-6 text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl">{value}</p>
      {note && <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>}
    </div>
  );
}
const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function withTerms<T extends (typeof vaults)[number]>(
  v: T,
  terms: Terms,
  alloc?: Alloc,
  total = 0,
): T {
  const key =
    v.accent === "cash"
      ? "Cash"
      : v.accent === "cloud"
        ? "Cloud"
        : v.accent === "digital"
          ? "Digital"
          : null;
  const rate = key ? pct(terms.apy[key]) : rewardRange(terms.taskReward);
  const a = alloc ? alloc[key ?? "Task"] : 0;
  const balance =
    key && total
      ? `$${((total * a) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : v.balance;
  return { ...v, rate, allocation: `${a}%`, balance };
}
function ringStyle(a: Alloc) {
  const c = a.Cash,
    d = c + a.Cloud,
    e = d + a.Digital;
  if (e + a.Task === 0) return { background: "var(--secondary)" };
  return {
    background: `conic-gradient(var(--success) 0 ${c}%, var(--cloud) ${c}% ${d}%, var(--digital) ${d}% ${e}%, var(--task) ${e}% 100%)`,
  };
}
