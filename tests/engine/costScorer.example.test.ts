import { describe, expect, it } from "vitest";
import { WAITING_AGE_RATE, W_DISTANCE } from "../../src/engine/config";
import { pickWinner, score, total } from "../../src/engine/costScorer";
import { hall, idleCar } from "./fixtures";

describe("CostScorer", () => {
  it("gives idle cars zero reverse and direction penalty (US-D4)", () => {
    const request = hall("1", 8, "up", 10);
    const row = score(request, idleCar("A", 3), 0);
    expect(row.reversePenalty).toBe(0);
    expect(row.directionCompatibility).toBe(0);
    expect(row.distance).toBe(5 * W_DISTANCE);
  });

  it("prefers the nearer idle car", () => {
    const request = hall("1", 5, "up", 8);
    const near = score(request, idleCar("A", 4), 0);
    const far = score(request, idleCar("B", 10), 0);
    expect(near.total).toBeLessThan(far.total);
    expect(pickWinner([near, far])).toBe("A");
  });

  it("waiting-age credit grows with wait time (US-D5)", () => {
    const request = hall("1", 5, "up", 8, 0);
    const car = idleCar("A", 1);
    const early = score(request, car, 0);
    const later = score(request, car, 20);
    expect(later.waitingAgeCredit).toBe(20 * WAITING_AGE_RATE);
    expect(later.waitingAgeCredit).toBeGreaterThan(early.waitingAgeCredit);
    expect(later.total).toBe(total(later));
  });

  it("20s of wait equals one floor of distance at WAITING_AGE_RATE", () => {
    const request = hall("1", 5, "up", 8, 0);
    const car = idleCar("A", 3);
    const later = score(request, car, 20);
    expect(later.waitingAgeCredit).toBe(W_DISTANCE);
    expect(later.total).toBe(later.distance - W_DISTANCE);
  });

  it("three-way cost table matches named weights (US-D1)", () => {
    const request = hall("1", 5, "up", 8);
    const a = score(request, idleCar("A", 4), 0);
    const b = score(request, idleCar("B", 10), 0);
    const c = score(request, idleCar("C", 9), 0);
    expect(a).toMatchObject({
      distance: 1 * W_DISTANCE,
      directionCompatibility: 0,
      scheduledStops: 0,
      reversePenalty: 0,
      waitingAgeCredit: 0,
      total: 1,
    });
    expect(b.total).toBe(5);
    expect(c.total).toBe(4);
    expect(pickWinner([a, b, c])).toBe("A");
  });

  it("breaks total ties with A then B then C (US-D1)", () => {
    const request = hall("1", 5, "up", 8);
    const a = score(request, idleCar("A", 5), 0);
    const b = { ...score(request, idleCar("B", 5), 0), total: a.total };
    const c = { ...score(request, idleCar("C", 5), 0), total: a.total };
    expect(pickWinner([c, b, a])).toBe("A");
  });
});
