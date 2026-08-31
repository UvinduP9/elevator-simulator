import type { Direction, Floor, StopQueue } from "./types";

export function emptyQueue(): StopQueue {
  return { up: [], down: [] };
}

function uniqueSortedAsc(floors: Floor[], floor: Floor): Floor[] {
  if (floors.includes(floor)) return floors;
  return [...floors, floor].sort((a, b) => a - b);
}

function uniqueSortedDesc(floors: Floor[], floor: Floor): Floor[] {
  if (floors.includes(floor)) return floors;
  return [...floors, floor].sort((a, b) => b - a);
}

export function insertPickup(queue: StopQueue, floor: Floor, direction: Direction): StopQueue {
  if (direction === "up") {
    return { ...queue, up: uniqueSortedAsc(queue.up, floor) };
  }
  return { ...queue, down: uniqueSortedDesc(queue.down, floor) };
}

export function insertDestination(queue: StopQueue, fromFloor: Floor, destFloor: Floor): StopQueue {
  if (destFloor === fromFloor) return queue;
  if (destFloor > fromFloor) {
    return { ...queue, up: uniqueSortedAsc(queue.up, destFloor) };
  }
  return { ...queue, down: uniqueSortedDesc(queue.down, destFloor) };
}

export function removeStop(queue: StopQueue, floor: Floor): StopQueue {
  return {
    up: queue.up.filter((f) => f !== floor),
    down: queue.down.filter((f) => f !== floor),
  };
}

export function nextStop(queue: StopQueue, floor: number, direction: Direction): Floor | null {
  if (direction === "up") {
    const ahead = queue.up.filter((f) => f > floor);
    return ahead.length === 0 ? null : ahead[0]!;
  }
  const ahead = queue.down.filter((f) => f < floor);
  return ahead.length === 0 ? null : ahead[0]!;
}

export function canReverse(queue: StopQueue, direction: Direction, floor: number): boolean {
  return nextStop(queue, floor, direction) === null;
}

export function stopCount(queue: StopQueue): number {
  return queue.up.length + queue.down.length;
}

/**
 * Copy only the stop the car must travel toward first.
 * A down call above (or up call below) is not ahead in its hall list, so `nextStop`
 * cannot see it. Destinations between the car and that pickup stay on the hall list
 * so they are not served on the way to the pickup.
 */
export function ensureApproachStops(queue: StopQueue, fromFloor: number): StopQueue {
  let next = queue;
  const downAbove = queue.down.filter((f) => f > fromFloor);
  if (downAbove.length > 0) {
    next = insertPickup(next, Math.max(...downAbove), "up");
  }
  const upBelow = queue.up.filter((f) => f < fromFloor);
  if (upBelow.length > 0) {
    next = insertPickup(next, Math.min(...upBelow), "down");
  }
  return next;
}

export function planStops(queue: StopQueue, floor: number, direction: Direction | null): Floor[] {
  const upAhead = queue.up.filter((f) => f > floor);
  const downAhead = queue.down.filter((f) => f < floor);
  if (direction === "down") {
    return [...downAhead, ...upAhead];
  }
  return [...upAhead, ...downAhead];
}

export function queuesEqual(a: StopQueue, b: StopQueue): boolean {
  return a.up.join(",") === b.up.join(",") && a.down.join(",") === b.down.join(",");
}
