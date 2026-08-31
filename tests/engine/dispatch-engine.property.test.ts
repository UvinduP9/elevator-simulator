import fc from "fast-check";
import {
  assign,
  canReverse,
  createStopQueue,
  evaluate,
  insertPickup,
  nextDirection,
  removeStop,
  score,
} from "../../src/engine";
import type { ElevatorId } from "../../src/engine";
import { elevatorArb, floorArb, requestArb } from "./arbitraries";

fc.configureGlobal({ numRuns: 150, verbose: true });

const uniqueElevatorsArb = fc
  .tuple(elevatorArb, elevatorArb, elevatorArb)
  .map(([a, b, c]) => [
    { ...a, id: "A" as const },
    { ...b, id: "B" as const },
    { ...c, id: "C" as const },
  ]);

describe("dispatch engine properties", () => {
  it("always selects a minimum-cost elevator and assign agrees with evaluate", () => {
    fc.assert(
      fc.property(requestArb, uniqueElevatorsArb, fc.integer({ min: 0, max: 20_000 }), (request, elevators, now) => {
        const state = { now: Math.max(now, request.createdAt), elevators, requests: [] };
        const breakdown = evaluate(request, state);
        const assignment = assign(request, state);
        const minimum = Math.min(...Object.values(breakdown).map((cost) => cost.total));
        expect(assignment.breakdown).toEqual(breakdown);
        expect(breakdown[assignment.elevatorId].total).toBe(minimum);
        const tied = (Object.keys(breakdown) as ElevatorId[]).filter(
          (id) => breakdown[id].total === minimum,
        );
        expect(assignment.elevatorId).toBe([...tied].sort()[0]);
      }),
    );
  });

  it("waiting-age credit is monotonic and never increases total cost", () => {
    fc.assert(
      fc.property(requestArb, elevatorArb, fc.nat({ max: 10_000 }), fc.nat({ max: 10_000 }), (request, elevator, a, b) => {
        const earlier = request.createdAt + Math.min(a, b);
        const later = request.createdAt + Math.max(a, b);
        const earlyScore = score(request, elevator, earlier);
        const lateScore = score(request, elevator, later);
        expect(lateScore.waitingAgeCredit).toBeGreaterThanOrEqual(earlyScore.waitingAgeCredit);
        expect(lateScore.total).toBeLessThanOrEqual(earlyScore.total);
      }),
    );
  });

  it("keeps stop queues unique and ordered in their travel direction", () => {
    fc.assert(
      fc.property(fc.array(floorArb, { maxLength: 50 }), (floors) => {
        const up = floors.reduce((queue, floor) => insertPickup(queue, floor, "up"), createStopQueue());
        const down = floors.reduce((queue, floor) => insertPickup(queue, floor, "down"), createStopQueue());
        expect(up.up).toEqual([...new Set(floors)].sort((a, b) => a - b));
        expect(down.down).toEqual([...new Set(floors)].sort((a, b) => b - a));
      }),
    );
  });

  it("never reverses before all current-direction stops are removed", () => {
    fc.assert(
      fc.property(fc.uniqueArray(floorArb, { minLength: 1 }), fc.array(floorArb), (upStops, downStops) => {
        let queue = createStopQueue();
        for (const floor of upStops) queue = insertPickup(queue, floor, "up");
        for (const floor of downStops) queue = insertPickup(queue, floor, "down");
        expect(canReverse(queue, "up")).toBe(false);
        expect(nextDirection(queue, "up")).toBe("up");
        for (const floor of upStops) queue = removeStop(queue, floor, "up");
        expect(canReverse(queue, "up")).toBe(true);
        expect(nextDirection(queue, "up")).toBe(queue.down.length > 0 ? "down" : null);
      }),
    );
  });

  it("matches a set model through random stateful queue operations", () => {
    const operationArb = fc.record({
      action: fc.constantFrom("add" as const, "remove" as const),
      floor: floorArb,
    });
    fc.assert(
      fc.property(fc.array(operationArb, { maxLength: 100 }), (operations) => {
        let queue = createStopQueue();
        const model = new Set<number>();
        for (const operation of operations) {
          if (operation.action === "add") {
            queue = insertPickup(queue, operation.floor, "up");
            model.add(operation.floor);
          } else {
            queue = removeStop(queue, operation.floor, "up");
            model.delete(operation.floor);
          }
          expect(queue.up).toEqual([...model].sort((a, b) => a - b));
        }
      }),
    );
  });
});
