import { describe, expect, it } from "vitest";

import { prepareDemoLedger } from "@/lib/account";

describe("demo ledger reset", () => {
  it("filters entries before the saved reset point without deleting or rewriting state", () => {
    const state = { demoLedgerResetAt: 200, tasksDone: 3 };
    const result = prepareDemoLedger(
      [{ timestamp: 100 }, { timestamp: 200 }, { timestamp: 300 }],
      state,
      400,
    );

    expect(result.entries).toEqual([{ timestamp: 200 }, { timestamp: 300 }]);
    expect(result.state).toBe(state);
    expect(result.didReset).toBe(false);
  });

  it("creates a persistent reset point and hides legacy entries", () => {
    const result = prepareDemoLedger(
      [{ timestamp: 100 }, { timestamp: 200 }],
      { tasksDone: 3 },
      200,
    );

    expect(result.entries).toEqual([{ timestamp: 200 }]);
    expect(result.state).toEqual({ tasksDone: 3, demoLedgerResetAt: 200 });
    expect(result.didReset).toBe(true);
  });
});
