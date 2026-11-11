// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const eventsShimPath = fileURLToPath(new URL("./src/lib/events-shim.ts", import.meta.url));
const eventsPolyfillPath = require.resolve("events/events.js");

export default defineConfig({
  vite: {
    plugins: [
      {
        name: "browser-node-events",
        enforce: "pre",
        resolveId(id) {
          if (id === "node:events") {
            return eventsShimPath;
          }
          if (id === "events" || id === "events/events.js" || id === "node:events/events.js") {
            return eventsPolyfillPath;
          }
          return null;
        },
      },
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
