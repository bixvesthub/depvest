export interface UserProfile {
  id: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  isAuthenticated: boolean;
  linkedWallets: LinkedWallet[];
}

export interface AccountPreferences {
  riskTolerance: "Conservative" | "Balanced" | "Aggressive";
  emailNotifications: boolean;
}

export interface LinkedWallet {
  address: string;
  provider: "MetaMask" | "Coinbase" | "Ledger" | "Ledger Live" | "WalletConnect" | "Rainbow" | "Trust Wallet" | "Injected wallet";
  isPrimary: boolean;
  verifiedAt: string;
}

export interface DvtBalance {
  total: number;
  available: number;
  locked: number;
  pending: number;
  lifetimeEarned: number;
  lifetimePurchased: number;
}
