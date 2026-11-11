import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

function installDomShim() {
// The wallet popup library defines browser web components when it loads. The
// server has no DOM, so give it inert stand-ins; the popup itself only runs in the browser.
const g = globalThis as Record<string, unknown>;
if (typeof g["HTMLElement"] === "undefined") {
  class ShimElement {}
  g["HTMLElement"] = ShimElement;
  g["Element"] ??= ShimElement;
  g["Node"] ??= ShimElement;
}
for (const name of ["CSSStyleSheet", "ShadowRoot", "Document", "Event", "CustomEvent", "MutationObserver", "ResizeObserver", "IntersectionObserver"]) {
  if (typeof g[name] === "undefined") {
    g[name] = class {
      replaceSync() {}
      replace() { return Promise.resolve(this); }
      observe() {}
      disconnect() {}
    };
  }
}
if (typeof g["customElements"] === "undefined") {
  const registry = new Map<string, unknown>();
  g["customElements"] = {
    define: (name: string, ctor: unknown) => void registry.set(name, ctor),
    get: (name: string) => registry.get(name),
    whenDefined: () => Promise.resolve(),
  };
}
if (typeof g["document"] === "undefined") {
  const noop: unknown = new Proxy(function () {}, {
    get: (_t, k) => (k === Symbol.toPrimitive ? () => "" : noop),
    apply: () => noop,
    construct: () => noop as object,
  });
  g["document"] = noop;
}
}

installDomShim();

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    installDomShim();
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
