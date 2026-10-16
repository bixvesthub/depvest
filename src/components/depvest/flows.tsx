import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Check, Copy, LockKeyhole, QrCode, RefreshCw, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Terms } from "./terms";

export const DEPOSIT_ADDRESS = "0x8a24c9F31b07dE52a1C6f04B7e9D3a1f6b2c4e91";

export type Alloc = Record<"Cash" | "Cloud" | "Digital" | "Task", number>;
export type DepositStrategyName = "Balanced Yield" | "Conservative Haven" | "Aggressive Tech" | "Liquid Cash Only" | "US Treasury Cash" | "AI Cloud Compute" | "Blue-Chip Index";
export const DEPOSIT_STRATEGIES: Array<{ name: DepositStrategyName; description: string; alloc: Alloc }> = [
  { name: "Balanced Yield", description: "40% Cash / 35% Cloud / 25% Digital", alloc: { Cash: 40, Cloud: 35, Digital: 25, Task: 0 } },
  { name: "Conservative Haven", description: "75% Cash / 15% Cloud / 10% Digital", alloc: { Cash: 75, Cloud: 15, Digital: 10, Task: 0 } },
  { name: "Aggressive Tech", description: "10% Cash / 65% Cloud / 25% Digital", alloc: { Cash: 10, Cloud: 65, Digital: 25, Task: 0 } },
  { name: "Liquid Cash Only", description: "100% Cash / 0% Vaults", alloc: { Cash: 100, Cloud: 0, Digital: 0, Task: 0 } },
  { name: "US Treasury Cash", description: "100% US Treasury Cash", alloc: { Cash: 100, Cloud: 0, Digital: 0, Task: 0 } },
  { name: "AI Cloud Compute", description: "100% AI Cloud Compute", alloc: { Cash: 0, Cloud: 100, Digital: 0, Task: 0 } },
  { name: "Blue-Chip Index", description: "100% Blue-Chip Index", alloc: { Cash: 0, Cloud: 0, Digital: 100, Task: 0 } },
];

export type Flow =
  | { kind: "deposit"; vault?: string; initialAmount?: number; initialAlloc?: Alloc; initialStrategy?: DepositStrategyName }
  | { kind: "withdraw" }
  | { kind: "rebalance"; initial?: Alloc; targetVault?: string }
  | { kind: "calculator" }
  | { kind: "task"; title: string; reward: number }
  | { kind: "vault"; name: string }
  | null;

export type VaultInfo = { name: string; rate: string; rateLabel: string; risk: string; detail: string; balance: string; terms: string; accent: string };

type Notice = (m: string) => void;
const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Cap = ({ children }: { children: React.ReactNode }) => <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{children}</span>;
const Shell = ({ open, onClose, eyebrow, title, desc, children }: { open: boolean; onClose: () => void; eyebrow: string; title: string; desc: string; children: React.ReactNode }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-md">
      <DialogHeader className="text-left"><Cap>{eyebrow}</Cap><DialogTitle className="text-xl">{title}</DialogTitle><DialogDescription>{desc}</DialogDescription></DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
const Preview = () => <p className="flex items-center gap-2 text-[10px] text-muted-foreground"><LockKeyhole className="size-3" />Confirm amounts and network fees in your wallet before signing</p>;

/* ---------------- Deposit / Withdraw ---------------- */
export function TransferDialog({ flow, cash, walletBalance = 0, terms, walletAddress, onWalletRequired, onClose, onDeposit, onWithdraw, onNotice }: { flow: Flow; cash: number; walletBalance?: number; terms: Terms; walletAddress: string | null; onWalletRequired: () => void; onClose: () => void; onDeposit: (n: number, net: string, alloc: Alloc, strategyName: DepositStrategyName) => void; onWithdraw: (n: number, net: string) => void; onNotice: Notice }) {
  const isDeposit = flow?.kind === "deposit";
  const open = flow?.kind === "deposit" || flow?.kind === "withdraw";
  const [net, setNet] = useState("Base");
  const [amount, setAmount] = useState("1000");
  const [dest, setDest] = useState("");
  const [qr, setQr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [instant, setInstant] = useState(false);
  const initialAmount = flow?.kind === "deposit" ? flow.initialAmount : undefined;
  const vault = flow?.kind === "deposit" ? flow.vault : undefined;
  const initialAlloc = flow?.kind === "deposit" ? flow.initialAlloc : undefined;
  const initialStrategy = flow?.kind === "deposit" ? flow.initialStrategy : undefined;
  const vaultStrategy = DEPOSIT_STRATEGIES.find((item) => item.name === vault);
  const defaultStrategy = initialStrategy ?? vaultStrategy?.name ?? "Balanced Yield";
  const [strategyName, setStrategyName] = useState<DepositStrategyName>("Balanced Yield");
  useEffect(() => { if (open) { setAmount(isDeposit ? String(initialAmount ?? 1000) : "250"); setDest(""); setBusy(false); setQr(false); setInstant(false); setStrategyName(defaultStrategy); } }, [open, isDeposit, initialAmount, defaultStrategy]);
  const selectedStrategy = DEPOSIT_STRATEGIES.find((item) => item.name === strategyName) ?? DEPOSIT_STRATEGIES[0]!;
  const strategy = initialAlloc && initialStrategy === strategyName ? { ...selectedStrategy, alloc: initialAlloc } : selectedStrategy;
  const n = Number(amount) || 0;
  const fee = !isDeposit && instant ? Math.round(n * 1.5) / 100 : 0;
  const dvFee = isDeposit ? terms.fees.deposit : instant ? `${money(fee)} (1.5% express)` : "Free (standard)";
  const error = n <= 0 ? "Enter an amount" : n > 1_000_000 ? "Maximum is $1,000,000" : isDeposit && walletAddress && n > walletBalance ? `Wallet holds only ${money(walletBalance)} USDC` : !isDeposit && n > cash ? `Only ${money(cash)} available` : !isDeposit && !/^0x[a-fA-F0-9]{40}$/.test(dest.trim()) ? "Enter a valid 0x wallet address (42 characters)" : "";
  const submit = () => {
    if (error || busy) return;
    if (!walletAddress) { onWalletRequired(); return; }
    setBusy(true);
    if (isDeposit) onDeposit(n, net, strategy.alloc, strategy.name);
    else onWithdraw(n, `${net} · ${instant ? `Instant, fee ${money(fee)}` : "Standard T+1"}`);
  };
  return (
    <Shell open={open} onClose={onClose} eyebrow={isDeposit ? "Deposit · USDC" : "Withdraw · instant USDC"} title={isDeposit ? (vault ? `Add funds to ${vault}` : "Deposit funds") : "Withdraw funds"} desc={isDeposit ? "Send USDC to your DepVest address or pick an amount to simulate." : `Available cash: ${money(cash)}. Withdrawals settle in minutes.`}>
      <div className="space-y-5">
        {open && <div className="rounded-md border border-success/25 bg-success/5 p-3 text-[11px]"><Cap>Authorizing wallet</Cap><p className="mt-1 font-mono text-success">{walletAddress ?? "Connect wallet to continue"}</p></div>}
        <div><Cap>Network</Cap><div className="mt-2 grid grid-cols-2 gap-2">{["Base", "Ethereum"].map((x) => <button key={x} onClick={() => setNet(x)} className={cn("rounded-md border p-3 text-left text-sm", net === x ? "border-success/50 bg-success/10" : "border-border bg-background/40")}><b className="block">{x}</b><span className="text-[10px] text-muted-foreground">Gas paid in your wallet</span></button>)}</div></div>
        {isDeposit && <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="flex items-center justify-between"><Cap>Your USDC address ({net})</Cap><button onClick={() => setQr(!qr)} className="flex items-center gap-1 text-[10px] text-success"><QrCode className="size-3" />{qr ? "Hide" : "Show"} QR</button></div>
          {qr && <div className="mx-auto my-3 grid size-36 grid-cols-12 gap-px rounded bg-foreground p-2">{Array.from({ length: 144 }, (_, i) => <span key={i} className={((i * 7919) % 13) % 3 === 0 || [0, 1, 12, 13, 10, 11, 22, 23, 120, 121, 132, 133].includes(i) ? "bg-background" : ""} />)}</div>}
          <div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 truncate font-mono text-[11px]">{DEPOSIT_ADDRESS}</code><Button size="sm" variant="outline" className="rounded-full" onClick={() => { navigator.clipboard?.writeText(DEPOSIT_ADDRESS).catch(() => {}); onNotice(`Deposit: USDC ${net} address copied`); }}><Copy />Copy</Button></div>
        </div>}
        <div><Cap>Amount (USDC)</Cap>
          <div className="mt-2 flex items-center rounded-md border border-input bg-background px-4"><span className="text-muted-foreground">$</span><input inputMode="decimal" maxLength={10} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="h-12 w-full bg-transparent px-2 font-mono text-lg outline-none" /></div>
          {walletAddress && <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground"><span>{isDeposit ? "Wallet balance" : "DepVest available"}: <b className="font-mono text-foreground">{money(isDeposit ? walletBalance : cash)} USDC</b></span>{!isDeposit && <span>Wallet: <span className="font-mono">{money(walletBalance)}</span></span>}</div>}
          <div className="mt-2 flex flex-wrap gap-2">{(isDeposit ? [250, 1000] : [100, 250]).map((p) => <button key={p} onClick={() => setAmount(String(p))} className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px]">{money(p)}</button>)}<button onClick={() => setAmount(String(Math.floor((isDeposit ? walletBalance : cash) * 100) / 100))} className="rounded-full bg-success/15 px-3 py-1 font-mono text-[10px] text-success">Max</button></div>
        </div>
        {isDeposit && <div>
          <div className="flex items-center justify-between gap-2"><Cap>Deployment Strategy</Cap><span className="text-[9px] text-muted-foreground">Applied when deposit settles</span></div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {vaultStrategy && <button type="button" aria-pressed={strategyName === vaultStrategy.name} onClick={() => setStrategyName(vaultStrategy.name)} className={cn("rounded-md border p-3 text-left", strategyName === vaultStrategy.name ? "border-success/50 bg-success/10" : "border-border bg-background/40")}>
              <b className="block text-xs">🏦 {vaultStrategy.name} <span className="text-success">(Vault-specific)</span></b>
              <span className="mt-1 block text-[10px] text-muted-foreground">{vaultStrategy.description}</span>
            </button>}
            {DEPOSIT_STRATEGIES.slice(0, 4).map((item) => <button key={item.name} type="button" aria-pressed={strategyName === item.name} onClick={() => setStrategyName(item.name)} className={cn("rounded-md border p-3 text-left", strategyName === item.name ? "border-success/50 bg-success/10" : "border-border bg-background/40")}>
              <b className="block text-xs">{item.name === "Balanced Yield" ? "⚖️ " : item.name === "Conservative Haven" ? "🛡️ " : item.name === "Aggressive Tech" ? "🚀 " : "💵 "}{item.name}{item.name === "Balanced Yield" && <span className="ml-1 text-success">(Default)</span>}</b>
              <span className="mt-1 block text-[10px] text-muted-foreground">{item.description}</span>
            </button>)}
          </div>
          {vaultStrategy && <p className="mt-2 text-[10px] text-muted-foreground">Opened from <b className="text-foreground">{vaultStrategy.name}</b>. Choose any strategy above to change the deployment.</p>}
          <p className="mt-2 text-[10px] text-muted-foreground">Confirming updates your target portfolio distribution across vaults.</p>
        </div>}
        {!isDeposit && <div><Cap>Destination wallet</Cap><input value={dest} maxLength={42} onChange={(e) => setDest(e.target.value.trim())} placeholder="0x…" className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-xs outline-none" /><button onClick={() => setDest(DEPOSIT_ADDRESS)} className="mt-1 text-[10px] text-success">Use my connected wallet</button></div>}
        {!isDeposit && <div role="radiogroup" aria-label="Settlement speed"><Cap>Settlement</Cap><div className="mt-2 space-y-2">{[{ k: false, t: "Standard Settlement", d: "Settles next day (T+1) or at next vault epoch", f: "FREE" }, { k: true, t: "Instant Express Settlement", d: "Immediate on-chain processing via emergency liquidity pools", f: "1.5%" }].map((o) => <button key={o.t} role="radio" aria-checked={instant === o.k} onClick={() => setInstant(o.k)} className={cn("flex w-full items-center gap-3 rounded-md border p-3 text-left", instant === o.k ? "border-success/50 bg-success/10" : "border-border bg-background/40")}><span className={cn("size-3.5 shrink-0 rounded-full border", instant === o.k ? "border-success bg-success" : "border-muted-foreground")} /><span className="min-w-0 flex-1"><b className="block text-sm">{o.t}</b><span className="text-[10px] text-muted-foreground">{o.d}</span></span><span className="font-mono text-xs">{o.f}</span></button>)}</div></div>}
        <div className="space-y-1 rounded-md bg-secondary/50 p-3 font-mono text-[11px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Network fee</span><span>Shown by your wallet</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">DepVest fee</span><span className={dvFee ? "" : "text-muted-foreground"}>{dvFee ?? "Unconfigured"}</span></div>
          <div className="flex justify-between border-t border-border pt-1"><span className="text-muted-foreground">{isDeposit ? "Amount" : "You receive"}</span><b>{money(n - fee)}</b></div>
        </div>
        {error && n > 0 && <p className="text-[11px] text-destructive">{error}</p>}
        <Preview />
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!!error || busy} onClick={submit}>{busy ? "Processing…" : isDeposit ? "Confirm deposit" : "Withdraw now"}{!busy && (isDeposit ? <ArrowUpRight /> : <ArrowDownToLine />)}</Button></div>
      </div>
    </Shell>
  );
}

/* ---------------- Rebalance ---------------- */
const PRESETS: Array<{ name: string; icon: string; a: Alloc }> = [
  { name: "Conservative Haven", icon: "🛡️", a: { Cash: 75, Cloud: 15, Digital: 10, Task: 0 } },
  { name: "Balanced Yield", icon: "⚖️", a: { Cash: 40, Cloud: 35, Digital: 25, Task: 0 } },
  { name: "Aggressive Tech", icon: "🚀", a: { Cash: 10, Cloud: 65, Digital: 25, Task: 0 } },
];
export function RebalanceDialog({ open, alloc, initial, targetVault, total: balance = 0, rebalanceFee, walletAddress, onWalletRequired, onClose, onSave }: { open: boolean; alloc: Alloc; initial?: Alloc | null; targetVault?: string | null; total?: number; rebalanceFee?: string | null; walletAddress: string | null; onWalletRequired: () => void; onClose: () => void; onSave: (a: Alloc) => void }) {
  const [draft, setDraft] = useState(alloc);
  const [review, setReview] = useState(false);
  useEffect(() => { if (open) { setDraft(initial ?? alloc); setReview(false); } }, [open, alloc, initial]);
  const total = Object.values(draft).reduce((a, b) => a + b, 0);
  const colors: Record<keyof Alloc, string> = { Cash: "bar-cash", Cloud: "bar-cloud", Digital: "bar-digital", Task: "bar-task" };
  const keys = Object.keys(draft) as (keyof Alloc)[];
  const volatile = draft.Cloud + draft.Digital;
  const risky = draft.Cloud > 50 || volatile > 50;
  const Bar = ({ a }: { a: Alloc }) => <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-secondary">{keys.map((k) => <span key={k} className={colors[k]} style={{ width: `${a[k]}%` }} />)}</div>;
  const Warning = () => risky ? <div role="alert" className="flex gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-[11px] text-warning"><ShieldCheck className="size-4 shrink-0" /><span><b>Concentration risk:</b> {volatile}% is in higher-volatility vaults (AI Cloud Compute + Digital Assets). Consider keeping this under 50%.</span></div> : null;
  if (review) return (
    <Shell open={open} onClose={onClose} eyebrow="Confirm rebalance" title={targetVault ? `Review cash allocation to ${targetVault}` : "Review your new mix"} desc="Compare your current and proposed allocation before confirming.">
      <div className="space-y-5">
        <div><p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Current</p><Bar a={alloc} /></div>
        <div><p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Proposed</p><Bar a={draft} /></div>
        <div className="divide-y divide-border rounded-md border border-border text-xs">
          {keys.map((k) => { const d = draft[k] - alloc[k]; return <div key={k} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 p-3"><span className="flex items-center gap-2"><i className={cn("size-2 rounded-full", colors[k])} />{k}</span><span className="font-mono text-muted-foreground">{alloc[k]}%</span><span className="font-mono">→ {draft[k]}%</span><span className={cn("w-20 text-right font-mono", d > 0 ? "text-success" : d < 0 ? "text-destructive" : "text-muted-foreground")}>{d > 0 ? "+" : ""}{balance > 0 ? `$${((d / 100) * balance).toFixed(2)}` : `${d}%`}</span></div>; })}
        </div>
        <Warning />
        <p className="text-[10px] text-muted-foreground">Rebalance fee: {rebalanceFee ?? "Unconfigured"}</p>
        <div className="flex justify-between gap-2"><Button variant="ghost" onClick={() => setReview(false)}>Back</Button><Button onClick={() => walletAddress ? onSave(draft) : onWalletRequired()}><Check />Confirm & rebalance</Button></div>
      </div>
    </Shell>
  );
  return (
    <Shell open={open} onClose={onClose} eyebrow="Rebalance portfolio" title={targetVault ? `Allocate cash to ${targetVault}` : "Set your target mix"} desc={targetVault ? "The proposed mix moves the currently liquid cash allocation into this vault. Adjust it or choose a preset before confirming." : "Drag sliders — total must equal 100%."}>
      <div className="space-y-5">
        <Bar a={draft} />
        <div className="grid grid-cols-3 gap-2">{PRESETS.map((p) => { const on = keys.every((k) => draft[k] === p.a[k]); return <button key={p.name} onClick={() => setDraft(p.a)} aria-pressed={on} className={cn("rounded-md border p-2 text-left text-[11px]", on ? "border-success/50 bg-success/10" : "border-border bg-background/40")}><b className="block">{p.icon} {p.name}</b><span className="font-mono text-[9px] text-muted-foreground">{p.a.Cash}/{p.a.Cloud}/{p.a.Digital}/{p.a.Task}</span></button>; })}</div>
        {keys.map((k) => (
          <div key={k}><div className="mb-2 flex justify-between text-xs"><span className="flex items-center gap-2"><i className={cn("size-2 rounded-full", colors[k])} />{k}</span><b className="font-mono">{draft[k]}%</b></div>
            <Slider aria-label={`${k} allocation`} value={[draft[k]]} max={100} step={1} onValueChange={([v]) => setDraft({ ...draft, [k]: v ?? 0 })} /></div>
        ))}
        <div className={cn("flex items-center justify-between rounded-md border p-3 text-sm", total === 100 ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive")}>
          <span>Total</span><b className="font-mono">{total}%{total !== 100 && ` (${total > 100 ? "-" : "+"}${Math.abs(100 - total)}% needed)`}</b>
        </div>
        <Warning />
        <div className="flex justify-between gap-2"><Button variant="ghost" onClick={() => setDraft(alloc)}>Reset</Button><div className="flex gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={total !== 100} onClick={() => walletAddress ? setReview(true) : onWalletRequired()}><RefreshCw />Review</Button></div></div>
      </div>
    </Shell>
  );
}

/* ---------------- Calculator ---------------- */
export function CalculatorDialog({ open, onClose, onInvest }: { open: boolean; onClose: () => void; onInvest: (n: number, alloc: Alloc) => void }) {
  const strategies = [
    { name: "Conservative Haven", netApy: 4.65, allocation: { Cash: 75, Cloud: 15, Digital: 10, Task: 0 } },
    { name: "Balanced Yield", netApy: 7.82, allocation: { Cash: 40, Cloud: 35, Digital: 25, Task: 0 } },
    { name: "Aggressive Tech", netApy: 10.05, allocation: { Cash: 10, Cloud: 65, Digital: 25, Task: 0 } },
  ] satisfies Array<{ name: string; netApy: number; allocation: Alloc }>;
  const [amt, setAmt] = useState(5000);
  const [strategyIndex, setStrategyIndex] = useState(1);
  const [years, setYears] = useState(1);
  useEffect(() => { if (open) { setAmt(5000); setStrategyIndex(1); setYears(1); } }, [open]);
  const strategy = strategies[strategyIndex]!;
  const grossApy = strategy.netApy / 0.9;
  const grossAmount = amt * Math.pow(1 + grossApy / 100 / 12, 12 * years);
  const grossYield = grossAmount - amt;
  const fee = grossYield * 0.1;
  const netYield = grossYield - fee;
  const monthlyNetYield = amt * (Math.pow(1 + grossApy / 100 / 12, 1) - 1) * 0.9;
  const bankYield = amt * Math.pow(1 + 0.45 / 100 / 12, 12 * years) - amt;
  return (
    <Shell open={open} onClose={onClose} eyebrow="Simulator" title="Compounding & yield calculator" desc="Compare projected net returns and see the performance fee before deploying.">
      <div className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between"><Cap>Starting amount</Cap><b className="font-mono text-2xl">{money(amt)}</b></div>
          <Slider className="mt-3" aria-label="Principal" value={[amt]} min={250} max={100000} step={250} onValueChange={([v]) => setAmt(v ?? 250)} />
          <div className="mt-2 flex flex-wrap gap-2">{[1000, 5000, 10000, 25000].map((p) => <button key={p} aria-pressed={amt === p} onClick={() => setAmt(p)} className={cn("rounded-full px-3 py-1 font-mono text-[10px]", amt === p ? "bg-foreground text-background" : "bg-secondary")}>{money(p).replace(".00", "")}</button>)}</div>
        </div>
        <div>
          <Cap>Strategy</Cap>
          <div className="mt-2 grid gap-2">{strategies.map((item, index) => <button key={item.name} aria-pressed={strategyIndex === index} onClick={() => setStrategyIndex(index)} className={cn("flex items-center justify-between rounded-md border p-3 text-left", strategyIndex === index ? "border-success/50 bg-success/10" : "border-border bg-background/40")}><span><b className="block text-xs">{item.name}</b><span className="text-[10px] text-muted-foreground">{item.allocation.Cash}% Cash · {item.allocation.Cloud}% Compute · {item.allocation.Digital}% Digital</span></span><span className="font-mono text-xs text-success">{item.netApy.toFixed(2)}% {index === 0 ? "net APY" : "blended net APY"}</span></button>)}</div>
        </div>
        <div><Cap>Time horizon</Cap><div className="mt-2 flex gap-2">{[{ label: "6 Months", value: 0.5 }, { label: "1 Year", value: 1 }, { label: "3 Years", value: 3 }].map((item) => <button key={item.value} aria-pressed={years === item.value} onClick={() => setYears(item.value)} className={cn("flex-1 rounded-full px-3 py-2 text-[10px]", years === item.value ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")}>{item.label}</button>)}</div></div>
        <div className="space-y-2 rounded-md border border-border bg-secondary/40 p-3 text-xs">
          <p className="font-medium">{strategy.name} · {strategy.netApy.toFixed(2)}% net APY · {years} {years === 1 ? "year" : "years"}</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Gross yield generated</span><b className="font-mono">{money(grossYield)}</b></div>
          <div className="flex justify-between"><span className="text-muted-foreground">10% DepVest performance fee</span><b className="font-mono">−{money(fee)}</b></div>
          <div className="flex justify-between border-t border-border pt-2"><span>Net investor yield</span><b className="font-mono text-success">{money(netYield)}</b></div>
          <p className="text-[10px] text-muted-foreground">Estimated first-month net yield: <b className="font-mono text-success">+{money(monthlyNetYield)}</b></p>
          <p className="text-[10px] text-muted-foreground">Projected ending balance: {money(amt + netYield)}</p>
        </div>
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 flex justify-between text-[10px]"><Cap>Net return comparison</Cap><span className="text-muted-foreground">Bank savings · 0.45% APY</span></div>
          {[{ label: strategy.name, value: netYield, style: "bg-success" }, { label: "Bank savings", value: bankYield, style: "bg-muted-foreground" }].map((item) => <div key={item.label} className="mt-2"><div className="mb-1 flex justify-between text-[10px]"><span>{item.label}</span><b className="font-mono">{money(item.value)}</b></div><div className="h-1.5 rounded-full bg-secondary"><div className={cn("h-full rounded-full", item.style)} style={{ width: `${Math.max(3, (item.value / Math.max(netYield, bankYield, 1)) * 100)}%` }} /></div></div>)}
        </div>
        <p className="text-[10px] text-muted-foreground">Estimates only. Actual rates may change; returns are not guaranteed. Projections compound monthly and apply the performance fee to positive yield.</p>
        <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={onClose}>Close</Button><Button className="flex-1" onClick={() => onInvest(amt, strategy.allocation)}>Deploy This Strategy<ArrowUpRight /></Button></div>
      </div>
    </Shell>
  );
}

/* ---------------- Task ---------------- */
export function TaskDialog({ flow, walletAddress, onWalletRequired, onClose, onComplete }: { flow: Flow; walletAddress: string | null; onWalletRequired: () => void; onClose: () => void; onComplete: (title: string, reward: number) => Promise<void> }) {
  const open = flow?.kind === "task";
  const taskTitle = flow?.kind === "task" ? flow.title : null;
  const workflows = {
    "Validate product labels": {
      kind: "label",
      batchId: "LBL-2026-0418",
      steps: [
        { prompt: "Organic oat milk 1L", correct: "Grocery" },
        { prompt: "Wireless earbuds case", correct: "Electronics" },
        { prompt: "Ceramic coffee mug", correct: "Home" },
        { prompt: "Running shoe, size 42", correct: "Apparel" },
      ],
      choices: ["Grocery", "Electronics", "Home", "Apparel"],
    },
    "Review AI summary": {
      kind: "review",
      batchId: "SUM-2026-0093",
      steps: [
        { prompt: "The report says urban tree cover increased by 12% between 2020 and 2024.", sentence: "Urban tree cover increased by 12% between 2020 and 2024." },
        { prompt: "It attributes the change to the city's new planting initiative.", sentence: "The change is attributed to the city's new planting initiative." },
        { prompt: "The summary concludes that the program was an unqualified success.", sentence: "The program was an unqualified success." },
      ],
      choices: [],
    },
    "Classify satellite tiles": {
      kind: "satellite",
      batchId: "SAT-2026-0271",
      steps: [
        { prompt: "Dense rooftops and intersecting roads", detail: "Tile 01 · high-density grid", correct: "Urban" },
        { prompt: "Long crop rows with irrigation channels", detail: "Tile 02 · cultivated plain", correct: "Agricultural" },
        { prompt: "Continuous tree canopy with a narrow clearing", detail: "Tile 03 · mixed woodland", correct: "Forest" },
        { prompt: "Open blue surface bordered by a coastline", detail: "Tile 04 · coastal basin", correct: "Water" },
      ],
      choices: ["Urban", "Agricultural", "Forest", "Water"],
    },
    "Tag customer intent": {
      kind: "label",
      batchId: "INT-2026-0018",
      steps: [
        { prompt: "“Can you tell me when my order will arrive?”", correct: "Support request" },
        { prompt: "“I’m comparing prices for a new laptop.”", correct: "Product research" },
        { prompt: "“Where can I buy the blue version?”", correct: "Purchase intent" },
      ],
      choices: ["Purchase intent", "Support request", "Product research", "Other"],
    },
    "Check product attributes": {
      kind: "label",
      batchId: "ATTR-2026-0104",
      steps: [
        { prompt: "Listing says 500 ml; package image shows 500 ml.", correct: "Accurate" },
        { prompt: "A listing has no material information for a wool sweater.", correct: "Missing" },
        { prompt: "The title says size M; the size chart marks it as size L.", correct: "Incorrect" },
      ],
      choices: ["Accurate", "Incorrect", "Missing", "Unclear"],
    },
    "Screen listing content": {
      kind: "label",
      batchId: "SAFE-2026-0037",
      steps: [
        { prompt: "A standard description of a stainless-steel water bottle.", correct: "Allowed" },
        { prompt: "A listing includes a customer's phone number in the description.", correct: "Personal data" },
        { prompt: "A supplement claims it cures a serious disease.", correct: "Misleading claim" },
      ],
      choices: ["Allowed", "Personal data", "Restricted item", "Misleading claim"],
    },
    "Categorize help requests": {
      kind: "label",
      batchId: "HELP-2026-0081",
      steps: [
        { prompt: "“I was charged twice for my order.”", correct: "Billing" },
        { prompt: "“I can’t reset my password.”", correct: "Account access" },
        { prompt: "“The tracking page won’t load.”", correct: "Technical issue" },
      ],
      choices: ["Billing", "Account access", "Technical issue", "General question"],
    },
    "Detect duplicate listings": {
      kind: "label",
      batchId: "DUP-2026-0029",
      steps: [
        { prompt: "Same brand, model, color, and product identifier.", correct: "Likely duplicate" },
        { prompt: "Same product model but a different size and product identifier.", correct: "Distinct item" },
        { prompt: "Images match, but brand and model details are missing.", correct: "Needs review" },
      ],
      choices: ["Likely duplicate", "Distinct item", "Needs review"],
    },
  } as const;
  const workflow = taskTitle ? workflows[taskTitle as keyof typeof workflows] : workflows["Validate product labels"];
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<string | null>>([]);
  const [factuality, setFactuality] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(null);
  const [reviewResults, setReviewResults] = useState<Array<{ factuality: string; tone: string }>>([]);
  const [collecting, setCollecting] = useState(false);
  const [receiptError, setReceiptError] = useState(false);
  useEffect(() => {
    if (open) {
      setStep(0);
      setPicked(null);
      setAnswers([]);
      setFactuality(null);
      setTone(null);
      setReviewResults([]);
      setCollecting(false);
      setReceiptError(false);
    }
  }, [open, taskTitle]);
  if (!open) return <Shell open={false} onClose={onClose} eyebrow="" title="" desc="">{null}</Shell>;
  const done = step >= workflow.steps.length;
  const currentStep = workflow.steps[step];
  const progress = done ? 100 : Math.round((step / workflow.steps.length) * 100);
  const scoreAnswers = answers.slice();
  if (picked) scoreAnswers[step] = picked;
  const answeredCount = workflow.kind !== "review" ? scoreAnswers.filter(Boolean).length : 0;
  const accurateCount = workflow.kind === "review"
    ? reviewResults.filter((result) => result.factuality === "Accurate" && result.tone === "Neutral").length
    : scoreAnswers.filter((answer, index) => answer === workflow.steps[index]?.correct).length;
  const taskScore = workflow.kind === "review"
    ? reviewResults.reduce((score, result) => score + Number(result.factuality === "Accurate") + Number(result.tone === "Neutral"), 0)
    : accurateCount;
  const taskScoreTotal = workflow.kind === "review" ? workflow.steps.length * 2 : workflow.steps.length;
  const taskAccuracy = taskScoreTotal ? taskScore / taskScoreTotal : 0;
  const taskAccepted = taskAccuracy >= 0.7;
  const advance = () => {
    if (!walletAddress) return onWalletRequired();
    if (workflow.kind === "review") {
      if (!factuality || !tone) return;
      setReviewResults((current) => [...current.slice(0, step), { factuality, tone }]);
    } else {
      if (!picked) return;
      setAnswers((current) => [...current.slice(0, step), picked]);
    }
    setStep((current) => current + 1);
    setPicked(null);
    setFactuality(null);
    setTone(null);
  };
  return (
    <Shell open onClose={onClose} eyebrow="Active Earn" title={flow.title} desc={`${money(flow.reward)} session credit if accepted · 70% accuracy required`}>
      {!done ? <div className="space-y-4">
        <div className="rounded-md border border-success/25 bg-success/5 p-3 text-left text-[11px]"><Cap>Receiving wallet</Cap><p className="mt-1 font-mono text-success">{walletAddress ?? "Connect wallet to continue"}</p></div>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-background/40 p-3 text-[10px]">
          <div><Cap>Dataset batch</Cap><p className="mt-1 font-mono">{workflow.batchId}</p></div>
          <div><Cap>Task review</Cap><p className="mt-1 text-muted-foreground">Acceptance is based on answer quality</p></div>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground"><span>Step {step + 1} of {workflow.steps.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full bg-success transition-all" style={{ width: `${progress}%` }} /></div>
        {workflow.kind === "label" && <div className="flex items-center justify-between rounded-md border border-success/25 bg-success/5 px-3 py-2 text-[11px]"><span>Answer check</span><b className="font-mono text-success">{answeredCount ? `${Math.round((accurateCount / answeredCount) * 100)}% · ${accurateCount}/${answeredCount} correct` : "Select the best answer"}</b></div>}
        {workflow.kind === "review" && reviewResults.slice(0, step).map((result, index) => {
          const isApproved = result.factuality === "Accurate" && result.tone === "Neutral";
          return <div key={(workflow.steps[index] as { sentence?: string } | undefined)?.sentence} className={cn("flex items-center justify-between rounded-md border px-3 py-2 text-[10px]", isApproved ? "border-success/25 bg-success/5" : "border-warning/25 bg-warning/5")}><span className="truncate pr-2">{(workflow.steps[index] as { sentence?: string } | undefined)?.sentence}</span><span className={cn("shrink-0 rounded-full px-2 py-1", isApproved ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{isApproved ? "✓ Approved" : "⚑ Flagged for review"}</span></div>;
        })}
        <div className="rounded-md border border-border bg-background/40 p-5 text-center"><Sparkles className="mx-auto size-5 text-success" /><p className="mt-3 text-sm font-medium">{workflow.kind === "review" ? `“${(currentStep as { sentence?: string } | undefined)?.sentence ?? ""}”` : (currentStep as { prompt?: string } | undefined)?.prompt}</p>{workflow.kind === "label" && <p className="mt-1 text-[11px] text-muted-foreground">Choose the best answer for this item.</p>}{workflow.kind === "review" && <p className="mt-1 text-[11px] text-muted-foreground">Check this sentence for factuality and tone.</p>}{workflow.kind === "satellite" && <p className="mt-1 text-[11px] text-muted-foreground">{(currentStep as { detail?: string } | undefined)?.detail} · classify the dominant land use</p>}</div>
        {workflow.kind === "review" ? <div className="space-y-3">
          <div><Cap>Factuality</Cap><div className="mt-2 grid grid-cols-2 gap-2">{["Accurate", "Needs review"].map((choice) => <button key={choice} onClick={() => setFactuality(choice)} aria-pressed={factuality === choice} className={cn("rounded-md border p-3 text-xs", factuality === choice ? "border-success/50 bg-success/10" : "border-border")}>{choice}</button>)}</div></div>
          <div><Cap>Tone</Cap><div className="mt-2 grid grid-cols-2 gap-2">{["Neutral", "Needs revision"].map((choice) => <button key={choice} onClick={() => setTone(choice)} aria-pressed={tone === choice} className={cn("rounded-md border p-3 text-xs", tone === choice ? "border-success/50 bg-success/10" : "border-border")}>{choice}</button>)}</div></div>
        </div> : <div className="grid grid-cols-2 gap-2">{workflow.choices.map((choice) => <button key={choice} onClick={() => { if (!walletAddress) return onWalletRequired(); setPicked(choice); }} aria-pressed={picked === choice} className={cn("rounded-md border p-3 text-sm", picked === choice ? "border-success/50 bg-success/10" : "border-border")}>{choice}</button>)}</div>}
        <Button className="w-full" disabled={workflow.kind === "review" ? !factuality || !tone : !picked} onClick={advance}>{step === workflow.steps.length - 1 ? "Submit answers" : workflow.kind === "review" ? factuality === "Accurate" && tone === "Neutral" ? "Approve sentence" : "Flag sentence for review" : "Next"}</Button>
      </div> : !taskAccepted ? <div className="space-y-4 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-warning/15 text-warning"><Check className="size-6" /></span>
        <p className="text-lg font-semibold">Task not accepted</p>
        <p className="text-sm text-muted-foreground">Accuracy: {Math.round(taskAccuracy * 100)}% · at least 70% is required. No session credit was recorded.</p>
        <Button className="w-full" onClick={onClose}>Return to tasks</Button>
      </div> : <div className="space-y-4 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success"><Check className="size-6" /></span>
        <p className="text-lg font-semibold">Task accepted</p>
        <p className="font-mono text-3xl text-success">+{money(flow.reward)} session credit</p>
        <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-left text-[11px] text-muted-foreground">This interface records task completion and earnings in local session state only. It is not a live task-review or USDC payout service.</div>
        {receiptError && <p role="alert" className="text-xs text-destructive">Could not record this task completion. Please try again.</p>}
        <Button className="w-full" disabled={collecting} onClick={async () => {
          if (!walletAddress) return onWalletRequired();
          setCollecting(true);
          setReceiptError(false);
          try {
            await onComplete(flow.title, flow.reward);
          } catch {
            setReceiptError(true);
          } finally {
            setCollecting(false);
          }
        }}><Zap />{collecting ? "Recording task…" : "Record session credit"}</Button>
      </div>}
    </Shell>
  );
}

/* ---------------- Vault deep-dive ---------------- */
export function VaultDetailDialog({ vault, onClose, onDeposit, onNotice }: { vault: VaultInfo | null; onClose: () => void; onDeposit: (name: string) => void; onNotice: Notice }) {
  return (
    <Shell open={!!vault} onClose={onClose} eyebrow="Vault deep-dive" title={vault?.name ?? ""} desc={vault?.detail ?? ""}>
      {vault && <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">{[["Rate", `${vault.rate}`], ["Risk", vault.risk], ["Your balance", vault.balance]].map(([l, v]) => <div key={l} className="rounded-md border border-border bg-secondary/50 p-3"><Cap>{l}</Cap><p className="mt-2 truncate font-mono text-xs font-semibold">{v}</p></div>)}</div>
        <div><Cap>Yield history & utilization</Cap><p className="mt-2 rounded-md border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">No verified history yet.</p></div>
        <ul className="space-y-2 text-[11px] text-muted-foreground">
                    <li className="flex gap-2"><LockKeyhole className="size-3.5 shrink-0" />Terms: {vault.terms}</li>
        </ul>
        <div className="flex flex-wrap justify-end gap-2"><Button onClick={() => onDeposit(vault.name)}>Add funds<ArrowUpRight /></Button></div>
      </div>}
    </Shell>
  );
}

/* ---------------- CSV ---------------- */
export function exportLedgerCsv(rows: Array<{ title: string; value: string; meta: string; timestamp?: number; status?: string; reference?: string; vaultId?: string; settlementTier?: string }>) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csv = ["Timestamp,Description,Amount,Status,Vault,Settlement,Reference,Details", ...rows.map((r) => [
    r.timestamp == null ? "" : new Date(r.timestamp).toISOString(),
    r.title,
    r.value,
    r.status ?? "",
    r.vaultId ?? "",
    r.settlementTier ?? "",
    r.reference ?? "",
    r.meta,
  ].map(esc).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "depvest-transactions.csv"; a.click();
  URL.revokeObjectURL(url);
}
