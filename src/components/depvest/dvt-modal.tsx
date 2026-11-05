import { Check, Circle, Coins, Flame, Landmark, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DvtModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const utility = [
  "Governance participation",
  "Fee discounts on express withdrawals",
  "Boosted vault yields",
  "Task marketplace access",
];

const roadmap = [
  {
    phase: "Phase 1 · Active",
    title: "Internal ledger accounting",
    detail: "Task reward distribution and local DVT balance tracking.",
    active: true,
  },
  {
    phase: "Phase 2 · Upcoming",
    title: "Smart contract deployment",
    detail: "Planned contract deployment and cryptographic proof of reserves.",
    active: false,
  },
  {
    phase: "Phase 3 · Future",
    title: "Decentralized liquidity",
    detail: "Potential liquidity pools and partner exchange trading.",
    active: false,
  },
];

export function DvtModal({ open, onOpenChange }: DvtModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-success" />
            DVT Tokenomics &amp; Roadmap
          </DialogTitle>
          <DialogDescription>
            Planned DVT utility and release phases. DVT is tracked on the DepVest ledger until
            its on-chain launch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section className="rounded-md border border-border bg-background/40 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-success" />
              Token Utility
            </h3>
            <ul className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              {utility.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
              These are planned platform utility concepts; they are not currently available or
              guaranteed benefits.
            </p>
          </section>

          <section className="rounded-md border border-border bg-background/40 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Landmark className="size-4 text-success" />
              Supply &amp; Emission
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-medium">Configurable supply ceiling</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  A ceiling and issuance schedule have not yet been published.
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="flex items-center gap-1 text-xs font-medium">
                  <Flame className="size-3.5 text-warning" />
                  Anti-inflationary burn sinks
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  Potential burn mechanisms and rules remain under design.
                </p>
              </div>
              <div className="rounded-md border border-border p-3 sm:col-span-2">
                <p className="text-xs font-medium">Transparent distribution pools</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  Allocation categories, amounts, and emission schedules will need to be disclosed
                  before launch.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-background/40 p-4">
            <h3 className="text-sm font-semibold">Release Roadmap</h3>
            <ol className="mt-3 space-y-3">
              {roadmap.map((item) => (
                <li key={item.phase} className="flex gap-3">
                  <span className="mt-0.5 text-success">
                    {item.active ? <Check className="size-4" /> : <Circle className="size-4" />}
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-success">
                      {item.phase}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold">{item.title}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <p className="rounded-md border border-warning/25 bg-warning/5 p-3 text-[10px] leading-relaxed text-muted-foreground">
            DVT is a platform utility token. Earning DVT does not constitute an investment contract
            or guarantee of cash value.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
