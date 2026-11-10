// The wallet popup library defines browser web components when it loads. The
// server has no DOM, so give it inert stand-ins; the popup itself only runs in the browser.
const g = globalThis as Record<string, unknown>;
if (typeof g.HTMLElement === "undefined") {
  class ShimElement {}
  g.HTMLElement = ShimElement;
  g.Element ??= ShimElement;
  g.Node ??= ShimElement;
}
if (typeof g.customElements === "undefined") {
  const registry = new Map<string, unknown>();
  g.customElements = {
    define: (name: string, ctor: unknown) => void registry.set(name, ctor),
    get: (name: string) => registry.get(name),
    whenDefined: () => Promise.resolve(),
  };
}
export {};
