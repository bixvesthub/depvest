import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BASE_USDC_CONTRACT,
  connectInjectedWallet,
  readInjectedWalletState,
  subscribeWalletEvents,
} from "@/lib/wallet";

const address = "0x1111111111111111111111111111111111111111";

function installProvider(chainId = "0x2105") {
  const listeners = new Map<string, (value: unknown) => void>();
  const provider = {
    isMetaMask: true,
    request: vi.fn(async ({ method }: { method: string; params?: unknown[] }): Promise<unknown> => {
      if (method === "eth_requestAccounts" || method === "eth_accounts") return [address];
      if (method === "eth_chainId") return chainId;
      if (method === "eth_getBalance") return "0x16345785d8a0000";
      if (method === "eth_call") return `0x${(1_250_000_000).toString(16)}`;
      throw new Error(`Unexpected method ${method}`);
    }),
    on: vi.fn((event: string, listener: (value: unknown) => void) => listeners.set(event, listener)),
    removeListener: vi.fn((event: string) => listeners.delete(event)),
  };
  Object.defineProperty(window, "ethereum", { configurable: true, value: provider });
  return { provider, listeners };
}

describe("injected wallet", () => {
  beforeEach(() => {
    Object.defineProperty(window, "ethereum", { configurable: true, value: undefined });
  });

  it("requests account access and reads Base USDC and ETH without transactions", async () => {
    const { provider } = installProvider();

    await expect(connectInjectedWallet()).resolves.toMatchObject({
      address,
      provider: "MetaMask",
      usdcBalance: 1250,
      ethBalance: 0.1,
      chainId: "0x2105",
    });

    expect(provider.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(provider.request).toHaveBeenCalledWith({
      method: "eth_call",
      params: [{ to: BASE_USDC_CONTRACT, data: `0x70a08231${address.slice(2).padStart(64, "0")}` }, "latest"],
    });
    expect(provider.request.mock.calls.some(([request]) => request.method.startsWith("eth_send"))).toBe(false);
  });

  it("does not read the Base token contract from another network", async () => {
    const { provider } = installProvider("0x1");

    await expect(readInjectedWalletState()).resolves.toMatchObject({
      address,
      usdcBalance: 0,
      chainId: "0x1",
    });
    expect(provider.request).not.toHaveBeenCalledWith(expect.objectContaining({ method: "eth_call" }));
  });

  it("forwards account and chain changes and removes listeners on cleanup", () => {
    const { provider, listeners } = installProvider();
    const onAccountsChanged = vi.fn();
    const onChainChanged = vi.fn();

    const unsubscribe = subscribeWalletEvents(onAccountsChanged, onChainChanged);
    listeners.get("accountsChanged")?.([address]);
    listeners.get("chainChanged")?.("0x1");
    unsubscribe();

    expect(onAccountsChanged).toHaveBeenCalledWith([address]);
    expect(onChainChanged).toHaveBeenCalledWith("0x1");
    expect(provider.removeListener).toHaveBeenCalledTimes(2);
  });
});
