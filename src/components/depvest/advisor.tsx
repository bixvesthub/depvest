import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Alloc } from "./flows";

type Advice = { score: number; summary: string; vulnerabilities: string[]; nextSteps: string[]; suggested: Alloc };
const RISKS = ["Conservative", "Moderate", "Aggressive"] as const;
const HORIZONS = ["Under 1 year", "1-3 years", "3+ years"] as const;
type Risk = (typeof RISKS)[number];
type Horizon = (typeof HORIZONS)[number];

// Relative volatility weights per sleeve, used for a local, rule-based score.
const VOL: Alloc = { Cash: 5, Cloud: 70, Digital: 90, Task: 20 };
const TARGETS: Record<Risk, Alloc> = {
  Conservative: { Cash: 75, Cloud: 15, Digital: 10, Task: 0 },
  Moderate: { Cash: 40, Cloud: 35, Digital: 25, Task: 0 },
  Aggressive: { Cash: 10, Cloud: 65, Digital: 25, Task: 0 },
};

function analyze(alloc: Alloc, total: number, risk: Risk, horizon: Horizon): Advice {
  const sum = alloc.Cash + alloc.Cloud + alloc.Digital + alloc.Task;
  const a: Alloc = sum === 0 ? { Cash: 100, Cloud: 0, Digital: 0, Task: 0 } : alloc;
  const score = Math.round((a.Cash * VOL.Cash + a.Cloud * VOL.Cloud + a.Digital * VOL.Digital + a.Task * VOL.Task) / 100);
  let suggested = TARGETS[risk];
  if (horizon === "Under 1 year" && risk !== "Conservative") suggested = { Cash: suggested.Cash + 15, Cloud: suggested.Cloud - 10, Digital: suggested.Digital - 5, Task: 0 };
  const v: string[] = [];
  if (total <= 0) v.push("No funds deposited yet — the score reflects your target mix only.");
  if (a.Cloud + a.Digital > 50) v.push(`${a.Cloud + a.Digital}% sits in higher-volatility Cloud and Digital sleeves.`);
  (Object.keys(a) as (keyof Alloc)[]).forEach((k) => { if (a[k] >= 60 && k !== "Cash") v.push(`${k} is ${a[k]}% of your mix — a single-sleeve concentration.`); });
  if (a.Cash >= 90) v.push("Most funds are idle cash, which limits potential yield.");
  if (horizon === "Under 1 year" && a.Digital > 20) v.push("Short horizon with meaningful digital-asset exposure increases drawdown risk.");
  const target = TARGETS[risk];
  const steps: string[] = [];
  const drift = Math.abs(a.Cash - suggested.Cash) + Math.abs(a.Cloud - suggested.Cloud) + Math.abs(a.Digital - suggested.Digital);
  if (drift > 10) steps.push(`Move toward ${suggested.Cash}/${suggested.Cloud}/${suggested.Digital} (Cash/Cloud/Digital) to match a ${risk.toLowerCase()} profile.`);
  else steps.push("Your mix is close to your stated profile — review again after large deposits.");
  steps.push("Keep a cash buffer for planned withdrawals.");
  const fit = score < 35 ? "low" : score < 65 ? "moderate" : "high";
  const summary = `Your current mix carries ${fit} volatility for a ${risk.toLowerCase()} investor${target === suggested ? "" : " with a short horizon"}.`;
  return { score, summary, vulnerabilities: v, nextSteps: steps, suggested };
}

export function AdvisorDialog({ open, onClose, alloc, total, onApply }: { open: boolean; onClose: () => void; alloc: Alloc; total: number; onApply: (a: Alloc) => void }) {
  const [risk, setRisk] = useState<Risk>("Moderate");
  const [horizon, setHorizon] = useState<Horizon>("1-3 years");
  const [busy, setBusy] = useState(false);
  const [advice, setAdvice] = useState<Advice | null>(null);
  useEffect(() => { if (open) setAdvice(null); }, [open]);

  const run = () => {
    setBusy(true); setAdvice(null);
    window.setTimeout(() => { setAdvice(analyze(alloc, total, risk, horizon)); setBusy(false); }, 700);
  };
  const Pills = <T extends string>({ items, value, set }: { items: readonly T[]; value: T; set: (v: T) => void }) => (
    <div className="flex flex-wrap gap-1.5">{items.map((i) => <button key={i} onClick={() => set(i)} className={cn("rounded-full px-3 py-1.5 text-[11px]", value === i ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")}>{i}</button>)}</div>
  );
  const tone = (s: number) => s < 35 ? "text-success" : s < 65 ? "text-warning" : "text-destructive";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-lg">
        <DialogHeader><span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">AI Risk Check</span><DialogTitle>Personal risk check</DialogTitle><DialogDescription>Educational insights based on your current mix. Not financial advice.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background/40 p-3 font-mono text-[11px] text-muted-foreground">Cash {alloc.Cash}% · Cloud {alloc.Cloud}% · Digital {alloc.Digital}% · Task {alloc.Task}% · ${total.toFixed(2)}</div>
          <div><p className="mb-2 text-xs">Risk tolerance</p><Pills items={RISKS} value={risk} set={setRisk} /></div>
          <div><p className="mb-2 text-xs">Investment horizon</p><Pills items={HORIZONS} value={horizon} set={setHorizon} /></div>
          <Button className="w-full rounded-full" disabled={busy} onClick={run}>{busy ? <><Loader2 className="animate-spin" />Analyzing…</> : <><Sparkles />Analyze my portfolio</>}</Button>
          {advice && <div className="space-y-4 rounded-md border border-border p-4">
            <div className="flex items-center gap-4"><div className={cn("font-mono text-4xl font-semibold", tone(advice.score))}>{advice.score}</div><div><p className="text-xs font-medium">Risk score / 100</p><p className="mt-1 text-[11px] text-muted-foreground">{advice.summary}</p></div></div>
            {advice.vulnerabilities.length > 0 && <div><p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Watch-outs</p><ul className="list-disc space-y-1 pl-4 text-xs">{advice.vulnerabilities.map((v) => <li key={v}>{v}</li>)}</ul></div>}
            <div><p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Next steps</p><ul className="list-disc space-y-1 pl-4 text-xs">{advice.nextSteps.map((v) => <li key={v}>{v}</li>)}</ul></div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"><span className="font-mono text-[11px] text-muted-foreground">Suggested: {advice.suggested.Cash}/{advice.suggested.Cloud}/{advice.suggested.Digital}/{advice.suggested.Task}</span><Button size="sm" className="rounded-full" onClick={() => onApply(advice.suggested)}>Apply to Rebalance</Button></div>
          </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
