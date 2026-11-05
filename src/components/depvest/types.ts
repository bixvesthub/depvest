export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  linkedWallets: LinkedWallet[];
}

export interface LinkedWallet {
  address: string;
  provider: "MetaMask" | "Coinbase" | "Ledger";
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
