import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import type { ChainAdapter } from "@reown/appkit/react";
import { base, mainnet, type AppKitNetwork } from "@reown/appkit/networks";

const projectId =
  import.meta.env["VITE_WALLETCONNECT_PROJECT_ID"] || "8a744d2d06c2b91d43f47d8222079d07";

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [base, mainnet];

const wagmiAdapter = new WagmiAdapter({
  networks: [...networks],
  projectId,
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

createAppKit({
  // The adapter's namespace declaration conflicts with AppKit's exact-optional type.
  adapters: [wagmiAdapter as ChainAdapter],
  networks,
  defaultNetwork: base,
  projectId,
  metadata: {
    name: "DepVest",
    description: "Multi-Asset Investment Hub",
    url: "https://depvest.com",
    icons: ["https://depvest.com/favicon.ico"],
  },
  features: {
    email: false,
    socials: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--apkt-accent": "#34d399",
    "--w3m-accent": "#34d399",
  },
});
