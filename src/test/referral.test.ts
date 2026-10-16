import { describe, expect, it } from "vitest";

import { createReferralCode, qualifiesReferral } from "@/lib/referral";

describe("createReferralCode", () => {
  it("creates a stable referral code for each connected wallet", () => {
    const code = createReferralCode("MetaMask");

    expect(code).toMatch(/^DV-[A-Z0-9]{6}$/);
    expect(createReferralCode("MetaMask")).toBe(code);
    expect(createReferralCode("Coinbase Wallet")).not.toBe(code);
  });

  describe("qualifiesReferral", () => {
    it("requires successful registration and account activation", () => {
      expect(qualifiesReferral(true, true)).toBe(true);
      expect(qualifiesReferral(true, false)).toBe(false);
      expect(qualifiesReferral(false, true)).toBe(false);
      expect(qualifiesReferral(false, false)).toBe(false);
    });
  });
});
