import type { ChainAdapter } from "@reown/appkit/react";
import type { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, mainnet, type AppKitNetwork } from "@reown/appkit/networks";
import { useEffect, useState } from "react";

const projectId =
  import.meta.env["VITE_WALLETCONNECT_PROJECT_ID"] || "8a744d2d06c2b91d43f47d8222079d07";

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [base, mainnet];

// The wallet libraries need browser APIs, so they load only in the browser.
let adapterPromise: Promise<WagmiAdapter> | undefined;
function getAdapter(): Promise<WagmiAdapter> {
  if (!adapterPromise) {
    adapterPromise = import("@reown/appkit-adapter-wagmi").then(
      ({ WagmiAdapter }) => new WagmiAdapter({ networks: [...networks], projectId, ssr: true }),
    );
  }
  return adapterPromise;
}

export function loadWagmiConfig() {
  return getAdapter().then((a) => a.wagmiConfig);
}

type Modal = {
  open: (options?: { view?: string }) => Promise<unknown>;
  getState: () => { open: boolean };
  subscribeState: (cb: (state: { open: boolean }) => void) => () => void;
};

// The wallet popup UI needs browser APIs, so it is loaded only in the browser.
let modalPromise: Promise<Modal> | undefined;
function getModal(): Promise<Modal> {
  if (!modalPromise) {
    modalPromise = Promise.all([import("@reown/appkit/react"), getAdapter()]).then(
      ([{ createAppKit }, wagmiAdapter]) =>
        createAppKit({
          // The adapter's namespace declaration conflicts with AppKit's exact-optional type.
          adapters: [wagmiAdapter as ChainAdapter],
          networks,
          defaultNetwork: base,
          projectId,
          metadata: {
            name: "DepVest",
            description: "Multi-Asset Investment Hub",
            url: window.location.origin,
            icons: ["https://depvest.com/favicon.ico"],
          },
          features: { email: false, socials: false },
          themeMode: "dark",
          themeVariables: {
            "--apkt-accent": "#34d399",
            "--w3m-accent": "#34d399",
          },
        }) as unknown as Modal,
    );
  }
  return modalPromise;
}

export function openAppKit(options?: { view?: "Connect" }) {
  return getModal().then((m) => m.open(options));
}

export function useAppKitOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    void getModal().then((m) => {
      if (cancelled) return;
      setOpen(m.getState().open);
      unsub = m.subscribeState((s) => setOpen(s.open));
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);
  return open;
}
