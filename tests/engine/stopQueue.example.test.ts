import { describe, expect, it } from "vitest";
import {
  canReverse,
  emptyQueue,
  insertPickup,
  ensureApproachStops,
  nextStop,
} from "../../src/engine/stopQueue";

describe("StopQueueManager", () => {
  it("inserts a same-direction ahead pickup and may extend the trip (US-D2)", () => {
    let q = insertPickup(emptyQueue(), 6, "up");
    q = insertPickup(q, 9, "up");
    expect(nextStop(q, 4, "up")).toBe(6);
    expect(q.up).toEqual([6, 9]);
  });

  it("does not reverse while current-direction stops remain (US-D3)", () => {
    const q = insertPickup(emptyQueue(), 8, "up");
    expect(canReverse(q, "up", 3)).toBe(false);
    expect(canReverse(q, "up", 8)).toBe(true);
  });

  it("insertPickup is idempotent", () => {
    const once = insertPickup(emptyQueue(), 4, "down");
    const twice = insertPickup(once, 4, "down");
    expect(twice).toEqual(once);
  });

  it("puts a down call above the car onto the up list so nextStop can see it", () => {
    const q = ensureApproachStops(insertPickup(emptyQueue(), 10, "down"), 1);
    expect(q.up).toContain(10);
    expect(nextStop(q, 1, "up")).toBe(10);
  });

  it("does not put a down destination onto the up list ahead of the pickup", () => {
    let q = insertPickup(emptyQueue(), 10, "down");
    q = insertPickup(q, 4, "down");
    q = ensureApproachStops(q, 1);
    expect(nextStop(q, 1, "up")).toBe(10);
    expect(q.up).not.toContain(4);
  });
});
