import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type AdvisorInput = {
  alloc: { Cash: number; Cloud: number; Digital: number; Task: number };
  balance: number;
  risk: "Conservative" | "Moderate" | "Aggressive";
  horizon: "Under 1 year" | "1-3 years" | "3+ years";
  goal: string;
};

export type Advice = {
  score: number;
  summary: string;
  vulnerabilities: string[];
  nextSteps: string[];
  suggested: { Cash: number; Cloud: number; Digital: number; Task: number };
};

const SYSTEM = `You are a cautious portfolio risk analyst for DepVest, a multi-vault yield app with four vaults:
Cash (treasury-backed stable yield, low risk), Cloud (AI cloud compute revenue, high/volatile risk),
Digital (blue-chip crypto staking, high risk), Task (micro-task earnings, no capital at risk).
Given the investor's allocation (percentages), balance, risk tolerance, horizon and goal, return ONLY a JSON object, no markdown:
{"score":number 1-100 (higher = riskier),"summary":string (max 2 sentences),
"vulnerabilities":[up to 4 short strings],"nextSteps":[up to 4 short actionable strings],
"suggested":{"Cash":int,"Cloud":int,"Digital":int,"Task":int} summing to exactly 100}.
This is educational information, not financial advice. Never promise returns or invent yield numbers.`;

export async function analyzePortfolio(input: AdvisorInput): Promise<Advice> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this app.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let failure: unknown = null;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM,
    prompt: JSON.stringify(input),
    onError: ({ error }) => { failure = error; },
    providerOptions: {
      openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
    },
  });
  const text = await result.text;
  if (failure || !text) {
    const status = (failure as { statusCode?: number } | null)?.statusCode;
    if (status === 402) throw new Error("AI credits are used up. Add credits in workspace billing to continue.");
    if (status === 429) throw new Error("Too many requests right now. Please wait a minute and try again.");
    if (status === 403) throw new Error("AI access is blocked for this workspace.");
    console.error("advisor failed", failure);
    throw new Error("The advisor could not complete the analysis. Please try again.");
  }
  const raw = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Record<string, any>;
  const s = raw["suggested"] ?? {};
  const keys = ["Cash", "Cloud", "Digital", "Task"] as const;
  const sug = Object.fromEntries(keys.map((k) => [k, Math.max(0, Math.round(Number(s[k]) || 0))])) as Advice["suggested"];
  const sum = keys.reduce((a, k) => a + sug[k], 0);
  if (sum !== 100) sug.Cash = Math.max(0, sug.Cash + (100 - sum));
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 4).map((x: string) => x.slice(0, 240)) : []);
  return {
    score: Math.min(100, Math.max(1, Math.round(Number(raw["score"]) || 50))),
    summary: String(raw["summary"] ?? "").slice(0, 400),
    vulnerabilities: list(raw["vulnerabilities"]),
    nextSteps: list(raw["nextSteps"]),
    suggested: sug,
  };
}
