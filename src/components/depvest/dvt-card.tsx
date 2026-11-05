import { ArrowUpRight, Coins, Info, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DvtBalance } from "./types";

type DvtCardProps = {
  balance: DvtBalance;
  onClaimDvt: () => void;
  onOpenRoadmap: () => void;
};

const dvt = (amount: number) =>
  `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DVT`;

export function DvtCard({ balance, onClaimDvt, onOpenRoadmap }: DvtCardProps) {
  const metrics = [
    { label: "Available", amount: balance.available, note: "Ready for platform utility" },
    { label: "Locked (Vesting)", amount: balance.locked, note: "Subject to vesting release" },
    { label: "Pending", amount: balance.pending, note: "Session credits awaiting claim" },
    { label: "Total Holdings", amount: balance.total, note: "All DVT balances" },
  ];

  return (
    <section
      aria-labelledby="dvt-card-title"
      className="relative mb-5 overflow-hidden rounded-[14px] border border-success/25 bg-zinc-900/80 p-5 shadow-[0_0_32px_-18px_hsl(var(--success)/0.55)] sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-success/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-success/30 bg-success/10 text-success">
          <Coins className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-success shadow-[0_0_10px_hsl(var(--success))]" />
            <h2 id="dvt-card-title" className="text-base font-semibold">
              DepVest Token (DVT)
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Platform Utility &amp; Rewards Ecosystem
          </p>
        </div>
        <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">
          DVT Wallet
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-lg border border-zinc-800 bg-black/20 p-3"
          >
            <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            <p className="mt-2 truncate font-mono text-sm font-semibold text-foreground sm:text-base">
              {dvt(metric.amount)}
            </p>
            <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-4 flex flex-col gap-2 sm:flex-row">
        <Button className="rounded-full" disabled={balance.pending <= 0} onClick={onClaimDvt}>
          <Sparkles />
          Claim Pending DVT
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-zinc-700 bg-transparent"
          onClick={onOpenRoadmap}
        >
          <Info />
          Tokenomics &amp; Roadmap
        </Button>
      </div>

      <div className="relative mt-4 flex flex-col gap-1 rounded-md border border-warning/20 bg-warning/5 p-3 text-[10px] leading-relaxed sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          External trading and fiat exchange are currently under development. Internal utility
          active.
        </p>
        <button
          type="button"
          onClick={onOpenRoadmap}
          className="inline-flex shrink-0 items-center gap-1 font-medium text-success hover:underline"
        >
          Learn More
          <ArrowUpRight className="size-3" />
        </button>
      </div>
    </section>
  );
}
