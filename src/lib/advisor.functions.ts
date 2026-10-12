import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { analyzePortfolio } from "./advisor.server";

const pct = z.number().int().min(0).max(100);

export const getRiskAdvice = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      alloc: z.object({ Cash: pct, Cloud: pct, Digital: pct, Task: pct }),
      balance: z.number().min(0).max(1e9),
      risk: z.enum(["Conservative", "Moderate", "Aggressive"]),
      horizon: z.enum(["Under 1 year", "1-3 years", "3+ years"]),
      goal: z.string().trim().max(300),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    try {
      return { ok: true as const, advice: await analyzePortfolio(data) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Analysis failed" };
    }
  });
