import { describe, expect, it, vi } from "vitest";

import EventEmitter, { EventEmitter as NamedEventEmitter } from "@/lib/events-shim";

describe("events shim", () => {
  it("exports a working EventEmitter constructor as the default and named export", () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.on("connected", listener);
    emitter.emit("connected");

    expect(NamedEventEmitter).toBe(EventEmitter);
    expect(listener).toHaveBeenCalledOnce();
  });
});
