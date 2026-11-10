export const BASE_USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const BASE_CHAIN_ID_HEX = "0x2105";

type WalletProviderName =
  | "MetaMask"
  | "Coinbase"
  | "Ledger"
  | "Ledger Live"
  | "WalletConnect"
  | "Rainbow"
  | "Trust Wallet"
  | "Injected wallet";

interface InjectedProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: "accountsChanged" | "chainChanged", listener: (value: unknown) => void): void;
  removeListener?(event: "accountsChanged" | "chainChanged", listener: (value: unknown) => void): void;
}

export interface RealWalletState {
  address: string;
  provider: WalletProviderName;
  usdcBalance: number;
  ethBalance: number;
  chainId: string;
  balanceWarning?: string;
}

function getProvider(): InjectedProvider | undefined {
  if (typeof window === "undefined") return undefined;
  const provider: unknown = Reflect.get(window, "ethereum");
  if (
    typeof provider !== "object" ||
    provider === null ||
    !("request" in provider) ||
    typeof provider.request !== "function" ||
    !("on" in provider) ||
    typeof provider.on !== "function"
  ) {
    return undefined;
  }
  return provider as InjectedProvider;
}

export function hasInjectedWallet(): boolean {
  return Boolean(getProvider());
}

export function isWalletAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function getProviderName(provider: InjectedProvider): WalletProviderName {
  if (provider.isCoinbaseWallet) return "Coinbase";
  if (provider.isMetaMask) return "MetaMask";
  return "Injected wallet";
}

function encodeBalanceOfData(address: string): string {
  return `0x70a08231${address.slice(2).toLowerCase().padStart(64, "0")}`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown wallet error";
}

function parseHexBalance(value: unknown, decimals: number, label: string): number {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) {
    throw new Error(`Wallet returned an invalid ${label} balance.`);
  }
  const balance = Number(BigInt(value)) / 10 ** decimals;
  if (!Number.isFinite(balance)) throw new Error(`Wallet returned an invalid ${label} balance.`);
  return balance;
}

async function readBalances(provider: InjectedProvider, address: string, chainId: string) {
  const warnings: string[] = [];
  let ethBalance = 0;
  let usdcBalance = 0;

  try {
    const rawBalance = await provider.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    ethBalance = parseHexBalance(rawBalance, 18, "ETH");
  } catch (error) {
    warnings.push(`ETH balance could not be read: ${getErrorMessage(error)}`);
  }

  if (chainId.toLowerCase() === BASE_CHAIN_ID_HEX) {
    try {
      const rawBalance = await provider.request({
        method: "eth_call",
        params: [{ to: BASE_USDC_CONTRACT, data: encodeBalanceOfData(address) }, "latest"],
      });
      if (rawBalance !== "0x") usdcBalance = parseHexBalance(rawBalance, 6, "USDC");
    } catch (error) {
      warnings.push(`USDC balance could not be read: ${getErrorMessage(error)}`);
    }
  }

  return {
    ethBalance,
    usdcBalance,
    balanceWarning: warnings.length ? warnings.join(" ") : undefined,
  };
}

async function readWalletState(provider: InjectedProvider, address: string): Promise<RealWalletState> {
  if (!isWalletAddress(address)) throw new Error("Wallet returned an invalid account address.");
  const rawChainId = await provider.request({ method: "eth_chainId" });
  if (typeof rawChainId !== "string" || !/^0x[0-9a-f]+$/i.test(rawChainId)) {
    throw new Error("Wallet returned an invalid network ID.");
  }
  const balances = await readBalances(provider, address, rawChainId);
  return {
    address,
    provider: getProviderName(provider),
    chainId: rawChainId,
    ethBalance: balances.ethBalance,
    usdcBalance: balances.usdcBalance,
    ...(balances.balanceWarning ? { balanceWarning: balances.balanceWarning } : {}),
  };
}

export async function connectInjectedWallet(): Promise<RealWalletState> {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No Web3 wallet detected. Install MetaMask or Coinbase Wallet, or open this page in their app.");
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") {
    throw new Error("No account authorized by wallet.");
  }
  return readWalletState(provider, accounts[0]);
}

export async function readInjectedWalletState(address?: string): Promise<RealWalletState | null> {
  const provider = getProvider();
  if (!provider) return null;
  const accounts = address
    ? [address]
    : await provider.request({ method: "eth_accounts" });
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") return null;
  return readWalletState(provider, accounts[0]);
}

export function subscribeWalletEvents(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void,
) {
  const provider = getProvider();
  if (!provider) return () => {};

  const handleAccountsChanged = (value: unknown) => {
    onAccountsChanged(
      Array.isArray(value) ? value.filter((account): account is string => typeof account === "string") : [],
    );
  };
  const handleChainChanged = (value: unknown) => {
    if (typeof value === "string") onChainChanged(value);
  };

  provider.on("accountsChanged", handleAccountsChanged);
  provider.on("chainChanged", handleChainChanged);

  return () => {
    provider.removeListener?.("accountsChanged", handleAccountsChanged);
    provider.removeListener?.("chainChanged", handleChainChanged);
  };
}
