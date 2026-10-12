import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getRiskAdvice } from "@/lib/advisor.functions";
import { cn } from "@/lib/utils";
import type { Alloc } from "./flows";

type Advice = { score: number; summary: string; vulnerabilities: string[]; nextSteps: string[]; suggested: Alloc };
const RISKS = ["Conservative", "Moderate", "Aggressive"] as const;
const HORIZONS = ["Under 1 year", "1-3 years", "3+ years"] as const;

export function AdvisorDialog({ open, onClose, alloc, total, onApply }: { open: boolean; onClose: () => void; alloc: Alloc; total: number; onApply: (a: Alloc) => void }) {
  const ask = useServerFn(getRiskAdvice);
  const [risk, setRisk] = useState<(typeof RISKS)[number]>("Moderate");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("1-3 years");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);

  const run = async () => {
    setBusy(true); setError(""); setAdvice(null);
    try {
      const r = await ask({ data: { alloc, balance: total, risk, horizon, goal: goal.slice(0, 300) } });
      if (r.ok) setAdvice(r.advice); else setError(r.error);
    } catch { setError("The advisor is unavailable right now. Please try again."); }
    finally { setBusy(false); }
  };
  const Pills = <T extends string>({ items, value, set }: { items: readonly T[]; value: T; set: (v: T) => void }) => (
    <div className="flex flex-wrap gap-1.5">{items.map((i) => <button key={i} onClick={() => set(i)} className={cn("rounded-full px-3 py-1.5 text-[11px]", value === i ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")}>{i}</button>)}</div>
  );
  const tone = (s: number) => s < 35 ? "text-success" : s < 65 ? "text-warning" : "text-destructive";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-lg">
        <DialogHeader><span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">AI Risk Advisor</span><DialogTitle>Personal risk check</DialogTitle><DialogDescription>Educational insights based on your current mix. Not financial advice.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background/40 p-3 font-mono text-[11px] text-muted-foreground">Cash {alloc.Cash}% · Cloud {alloc.Cloud}% · Digital {alloc.Digital}% · Task {alloc.Task}% · ${total.toFixed(2)}</div>
          <div><p className="mb-2 text-xs">Risk tolerance</p><Pills items={RISKS} value={risk} set={setRisk} /></div>
          <div><p className="mb-2 text-xs">Investment horizon</p><Pills items={HORIZONS} value={horizon} set={setHorizon} /></div>
          <div><p className="mb-2 text-xs">Goal (optional)</p><input value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={300} placeholder="e.g. steady income, save for a house" className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs outline-none" /></div>
          <Button className="w-full rounded-full" disabled={busy} onClick={run}>{busy ? <><Loader2 className="animate-spin" />Analyzing…</> : <><Sparkles />Analyze my portfolio</>}</Button>
          {error && <p role="alert" className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"><AlertTriangle className="size-4 shrink-0" />{error}</p>}
          {advice && <div className="space-y-4 rounded-md border border-border p-4">
            <div className="flex items-center gap-4"><div className={cn("font-mono text-4xl font-semibold", tone(advice.score))}>{advice.score}</div><div><p className="text-xs font-medium">Risk score / 100</p><p className="mt-1 text-[11px] text-muted-foreground">{advice.summary}</p></div></div>
            {advice.vulnerabilities.length > 0 && <div><p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Vulnerabilities</p><ul className="list-disc space-y-1 pl-4 text-xs">{advice.vulnerabilities.map((v) => <li key={v}>{v}</li>)}</ul></div>}
            {advice.nextSteps.length > 0 && <div><p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Next steps</p><ul className="list-disc space-y-1 pl-4 text-xs">{advice.nextSteps.map((v) => <li key={v}>{v}</li>)}</ul></div>}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"><span className="font-mono text-[11px] text-muted-foreground">Suggested: {advice.suggested.Cash}/{advice.suggested.Cloud}/{advice.suggested.Digital}/{advice.suggested.Task}</span><Button size="sm" className="rounded-full" onClick={() => onApply(advice.suggested)}>Apply to Rebalance</Button></div>
          </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

