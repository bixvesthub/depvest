import { describe, expect, it } from "vitest";

import { createReferralCode } from "@/lib/referral";

describe("createReferralCode", () => {
  it("creates a stable referral code for each connected wallet", () => {
    const code = createReferralCode("MetaMask");

    expect(code).toMatch(/^DV-[A-Z0-9]{6}$/);
    expect(createReferralCode("MetaMask")).toBe(code);
    expect(createReferralCode("Coinbase Wallet")).not.toBe(code);
  });
});
