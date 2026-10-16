import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  Check,
  CircleDollarSign,
  Copy,
  Cpu,
  ExternalLink,
  Gift,
  HelpCircle,
  KeyRound,
  Landmark,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const WALLET_ADDRESS = "0x8a24…4e91";

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{children}</span>;
}

function Intro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-8 max-w-2xl md:mb-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-[44px]">{title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{copy}</p>
    </div>
  );
}

/* ---------------- Connect wallet ---------------- */

const wallets = [
  { name: "MetaMask", note: "Browser extension", tag: "Popular" },
  { name: "Coinbase Wallet", note: "Mobile & extension", tag: "Base native" },
  { name: "Phantom", note: "Multi-chain wallet", tag: "" },
  { name: "WalletConnect", note: "Scan with any mobile wallet", tag: "" },
];

export function ConnectWalletDialog({ open, onOpenChange, onConnected }: { open: boolean; onOpenChange: (v: boolean) => void; onConnected: (wallet: string) => void }) {
  const [pending, setPending] = useState<string | null>(null);
  const connect = (name: string) => {
    setPending(name);
    window.setTimeout(() => {
      setPending(null);
      onConnected(name);
    }, 900);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-popover">
        <DialogHeader>
          <DialogTitle>Connect a wallet</DialogTitle>
          <DialogDescription>Choose a wallet to fund vaults and receive payouts on Base.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              disabled={!!pending}
              onClick={() => connect(w.name)}
              className="flex w-full items-center gap-3 rounded-md border border-border bg-background/40 p-3 text-left transition-colors hover:border-primary/50 disabled:opacity-60"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary"><Wallet className="size-5 text-success" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{w.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{w.note}</span>
              </span>
              {pending === w.name ? (
                <span className="font-mono text-[10px] text-success">Connecting…</span>
              ) : w.tag ? (
                <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[9px] text-success">{w.tag}</span>
              ) : null}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 text-[10px] text-muted-foreground"><ShieldCheck className="size-3" /> Preview only — no real wallet is accessed.</p>
      </DialogContent>
    </Dialog>
  );
}

export function WalletChip({ wallet, balance = 0, onDisconnect, onNotice }: { wallet: string; balance?: number; onDisconnect: () => void; onNotice: (m: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-9 items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 font-mono text-[11px] text-success">
          <i className="size-1.5 rounded-full bg-success" />
          <span className="hidden sm:inline">{WALLET_ADDRESS}</span>
          <Wallet className="size-3.5 sm:hidden" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 border-border bg-popover">
        <Eyebrow>Connected via {wallet}</Eyebrow>
        <p className="mt-2 font-mono text-base">{WALLET_ADDRESS}</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full border border-digital/30 bg-digital/10 px-2 py-0.5 text-[10px] text-digital">● Base</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={() => onNotice("Wallet address copied")}><Copy />Copy</Button>
          <Button size="sm" variant="outline" onClick={() => onNotice("Switched network to Ethereum")}>Switch net</Button>
        </div>
        <Button size="sm" variant="ghost" className="mt-2 w-full text-destructive" onClick={onDisconnect}><LogOut />Disconnect</Button>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------- Notifications ---------------- */

const initialNotes: Array<{ id: number; title: string; meta: string; icon: typeof Bell; unread: boolean }> = [];

export function NotificationsPopover() {
  const [notes, setNotes] = useState(initialNotes);
  const unread = notes.filter((n) => n.unread).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative shrink-0 rounded-full border-border bg-card" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-success text-[9px] font-semibold text-primary-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] border-border bg-popover p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="text-sm font-semibold">Notifications</p>
          <button className="text-[11px] text-success disabled:text-muted-foreground" disabled={!unread} onClick={() => setNotes(notes.map((n) => ({ ...n, unread: false })))}>Mark all as read</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notes.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">No notifications yet.</p>}
          {notes.map(({ id, title, meta, icon: Icon, unread: u }) => (
            <button key={id} onClick={() => setNotes(notes.map((n) => (n.id === id ? { ...n, unread: false } : n)))} className="flex w-full items-start gap-3 border-b border-border p-4 text-left last:border-0 hover:bg-secondary/40">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary"><Icon className="size-4 text-muted-foreground" /></span>
              <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{meta}</span></span>
              {u && <i className="mt-1.5 size-2 shrink-0 rounded-full bg-success" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------- Profile ---------------- */

export function ProfileSheet({ open, onOpenChange, wallet, referralCode, onConnect, onDisconnect, onInvite, onCopyReferral, onNotice }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  wallet: string | null;
  referralCode: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onInvite: () => void;
  onCopyReferral: () => void;
  onNotice: (m: string) => void;
}) {
  const [prefs, setPrefs] = useState({ yield: true, rebalance: true, security: true });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border bg-popover sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">Your profile</SheetTitle>
          <SheetDescription className="sr-only">Account details, security and preferences</SheetDescription>
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-border bg-secondary text-lg font-semibold"><Users className="size-5" /></span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">Guest investor</p>
              <p className="truncate text-xs text-muted-foreground">Not signed in</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] text-success"><ShieldCheck className="size-3" />Not verified</span>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <section className="rounded-md border border-border bg-background/40 p-4">
            <Eyebrow>Account overview</Eyebrow>
            <dl className="mt-3 space-y-2 text-xs">
              
              <Row k="Membership" v="Standard" />
              <Row k="Fees" v="0% deposit / withdraw" />
              <Row k="Referral code" v={referralCode ? <span className="inline-flex items-center gap-2 font-mono">{referralCode}<button type="button" aria-label="Copy referral code" className="text-success hover:text-success/80" onClick={onCopyReferral}><Copy className="size-3.5" /></button></span> : "Connect wallet"} />
            </dl>
          </section>

          <section className="rounded-md border border-border bg-background/40 p-4">
            <Eyebrow>Security & wallet</Eyebrow>
            <dl className="mt-3 space-y-2 text-xs">
              <Row k="Primary wallet" v={wallet ? <span className="font-mono">{WALLET_ADDRESS}</span> : <button className="text-success" onClick={onConnect}>Connect wallet</button>} />
              <Row k="Two-factor auth" v={<span>Off</span>} />
              <Row k="Custody" v="Regulated custodian" />
            </dl>
          </section>

          <section className="rounded-md border border-border bg-background/40 p-4">
            <Eyebrow>Preferences</Eyebrow>
            <div className="mt-3 space-y-3 text-xs">
              <Pref label="Daily yield notifications" checked={prefs.yield} onChange={() => toggle("yield")} />
              <Pref label="Auto-rebalance alerts" checked={prefs.rebalance} onChange={() => toggle("rebalance")} />
              <Pref label="Security alerts" checked={prefs.security} onChange={() => toggle("security")} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onInvite}><UserPlus />Invite friends</Button>
            <Button variant="outline" onClick={() => onNotice("Tax report CSV prepared")}><ArrowDownToLine />Export CSV</Button>
          </div>
          {wallet && <Button variant="ghost" className="w-full text-destructive" onClick={onDisconnect}><LogOut />Disconnect wallet</Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
}
function Pref({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="flex items-center justify-between gap-3"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>;
}

/* ---------------- Receipt ---------------- */

export type Receipt = {
  title: string;
  value: string;
  meta: string;
  status?: "pending" | "completed" | "failed";
  timestamp?: number;
  reference?: string;
  vaultId?: string;
  settlementTier?: string;
} | null;

export function ReceiptDialog({ receipt, onClose, onNotice }: { receipt: Receipt; onClose: () => void; onNotice: (m: string) => void }) {
  return (
    <Dialog open={!!receipt} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-border bg-popover">
        <DialogHeader>
          <DialogTitle>Transaction receipt</DialogTitle>
          <DialogDescription>{receipt?.title}</DialogDescription>
        </DialogHeader>
        {receipt && (
          <div className="space-y-4">
            <p className="font-mono text-3xl text-success">{receipt.value}</p>
            <dl className="space-y-2 rounded-md border border-border bg-background/40 p-4 text-xs">
              <Row k="Status" v={receipt.status === "pending" ? <span className="text-warning">● Pending Clearing</span> : receipt.status === "failed" ? <span className="text-destructive">● Failed</span> : <span className="text-success">✓ Completed</span>} />
              {receipt.timestamp != null && <Row k="Timestamp" v={new Date(receipt.timestamp).toLocaleString()} />}
              <Row k="Details" v={<span className="max-w-[60%] text-[11px]">{receipt.meta}</span>} />
              <Row k="Network" v="Base" />
              <Row k="Vault" v={receipt.vaultId ?? "DepVest vault"} />
              <Row k="Settlement tier" v={receipt.settlementTier ?? "Standard T+1"} />
              <Row k={receipt.title.startsWith("AI task payout ·") ? "SHA-256 receipt" : "Tx reference"} v={<span className="break-all font-mono text-[10px]">{receipt.reference ?? "0x9f3c…e21a"}</span>} />
            </dl>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onNotice("Receipt copied")}><Copy />Copy</Button>
              <Button variant="outline" onClick={() => onNotice("Block explorer preview opened")}><ExternalLink />Explorer</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Invite friends ---------------- */

export function InviteFriends({ referralCode, referralEarnings, pendingReferralEarnings, activeReferrals, appliedReferralCode, onNotice, onCopy, onApplyReferralCode, onAddPreviewActivatedReferral, onClaim }: {
  referralCode: string | null;
  referralEarnings: number;
  pendingReferralEarnings: number;
  activeReferrals: number;
  appliedReferralCode: string | null;
  onNotice: (m: string) => void;
  onCopy: (value: string, label: string) => void;
  onApplyReferralCode: (value: string) => void;
  onAddPreviewActivatedReferral: () => void;
  onClaim: () => void;
}) {
  const [referralInput, setReferralInput] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref")?.toUpperCase() ?? "" : "");
  const link = referralCode && typeof window !== "undefined"
    ? `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}`
    : "";
  const shareMessage = link ? `Join me on DepVest: ${link}` : "";
  const currentTier = activeReferrals >= 10 ? 3 : activeReferrals >= 3 ? 2 : activeReferrals >= 1 ? 1 : 0;
  const nextTierAt = currentTier === 0 ? 1 : currentTier === 1 ? 3 : currentTier === 2 ? 10 : 10;
  const progress = currentTier === 3 ? 100 : Math.min(100, (activeReferrals / nextTierAt) * 100);
  const applyReferral = () => {
    const code = referralInput.trim().toUpperCase();
    if (!/^DV-[A-Z0-9]{6}$/.test(code)) {
      onNotice("Enter a valid referral code in DV-XXXXXX format");
      return;
    }
    if (code === referralCode) {
      onNotice("You cannot apply your own referral code");
      return;
    }
    if (appliedReferralCode) {
      onNotice("A referral code has already been applied");
      return;
    }
    onApplyReferralCode(code);
    setReferralInput(code);
    onNotice(`Referral code ${code} saved in this preview`);
  };
  return (
    <section>
      <Intro eyebrow="Invite Friends" title="Grow together, earn together." copy="Only successfully registered referrals with activated accounts count toward your progress and rewards. Referral activity and claims on this page are a local preview, not live payouts." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={<Gift />} label="Rewards earned" value={`$${referralEarnings.toFixed(2)}`} />
        <Stat icon={<Users />} label="Qualified referrals" value={String(activeReferrals)} />
        <Stat icon={<Check />} label="Activated accounts" value={String(activeReferrals)} />
        <Stat icon={<Sparkles />} label="Current tier" value={currentTier ? `Tier ${currentTier}` : "Not reached"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[14px] border border-border bg-card p-5 md:p-6">
          <Eyebrow>Your personal referral code</Eyebrow>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="flex h-11 min-w-0 items-center rounded-md border border-input bg-background px-3 font-mono text-sm"><span className="truncate">{referralCode ?? "Connect a wallet to get your code"}</span></div>
            <Button className="h-11" disabled={!referralCode} onClick={() => referralCode && onCopy(referralCode, "Referral code")}><Copy />Copy</Button>
          </div>
          <Eyebrow>Your invite link</Eyebrow>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="flex h-11 min-w-0 items-center rounded-md border border-input bg-background px-3 font-mono text-sm"><span className="truncate">{link || "Connect a wallet to create an invite link"}</span></div>
            <Button className="h-11" disabled={!link} onClick={() => onCopy(link, "Invite link")}><Copy />Copy</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {link ? <>
              <a className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent" href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noreferrer">X / Twitter</a>
              <a className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent" href={`mailto:?subject=${encodeURIComponent("Join me on DepVest")}&body=${encodeURIComponent(shareMessage)}`}>Email</a>
            </> : <>
              <Button variant="outline" size="sm" disabled>WhatsApp</Button>
              <Button variant="outline" size="sm" disabled>X / Twitter</Button>
              <Button variant="outline" size="sm" disabled>Email</Button>
            </>}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{currentTier === 3 ? "Highest referral tier reached (15%)" : `Progress to Tier ${currentTier + 1} (${(currentTier + 1) * 5}%)`}</span><span className="font-mono">{activeReferrals} / {nextTierAt} active</span></div>
            <div className="mt-2 h-2 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[["Tier 1", "5%", "1+ friend"], ["Tier 2", "10%", "3+ friends"], ["Tier 3", "15%", "10+ friends"]].map(([t, p, r], i) => (
                <div key={t} className={cn("rounded-md border p-3", currentTier >= i + 1 ? "border-success/40 bg-success/10" : "border-border bg-background/30")}>
                  <p className="text-[10px] text-muted-foreground">{t}</p>
                  <p className={cn("mt-1 font-mono text-lg", currentTier >= i + 1 && "text-success")}>{p}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">{r}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-border bg-background/40 p-4">
            <Eyebrow>Friend's referral code</Eyebrow>
            {appliedReferralCode ? <p className="mt-3 text-xs">Applied code <span className="font-mono font-semibold">{appliedReferralCode}</span> in this preview.</p> : <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input aria-label="Friend's referral code" value={referralInput} onChange={(event) => setReferralInput(event.target.value.toUpperCase())} maxLength={9} placeholder="DV-XXXXXX" className="h-10 min-w-0 rounded-md border border-input bg-background px-3 font-mono text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              <Button variant="outline" onClick={applyReferral}>Apply code</Button>
            </div>}
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Code attribution is stored only in this local preview and is not verified against an account.</p>
          </div>
        </div>

        <div className="rounded-[14px] border border-border bg-card">
          <div className="border-b border-border p-5"><p className="text-sm font-semibold">Referral rewards</p><p className="mt-1 text-[10px] text-muted-foreground">Available to claim: ${pendingReferralEarnings.toFixed(2)} · Local preview</p></div>
          <div className="space-y-3 p-5">
            <Button className="w-full rounded-full" disabled={pendingReferralEarnings <= 0} onClick={onClaim}><Gift />Claim to Cash</Button>
            <p className="text-[10px] leading-relaxed text-muted-foreground">Claimed rewards move into Available cash and appear in Wallet history.</p>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium">Preview a qualified referral</p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">No account-registration service is connected. This preview action represents a friend who registered successfully and activated their account; only then is the referral counted and the sample reward added.</p>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onAddPreviewActivatedReferral}>Simulate successful registration + activation · $2.50</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-[14px] border border-border bg-card p-5"><span className="vault-icon accent-cash">{icon}</span><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-mono text-xl">{value}</p></div>;
}

/* ---------------- How it works ---------------- */
