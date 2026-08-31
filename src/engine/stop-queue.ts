import type { Direction, StopQueue } from "./types";
import { isFloor, opposite } from "./types";

function sortedUnique(values: number[], direction: Direction): number[] {
  return [...new Set(values)].sort((a, b) => (direction === "up" ? a - b : b - a));
}

export function insertStop(queue: StopQueue, floor: number, direction: Direction): StopQueue {
  if (!isFloor(floor)) throw new RangeError(`Floor must be between 1 and 10: ${floor}`);
  return { ...queue, [direction]: sortedUnique([...queue[direction], floor], direction) };
}

export function insertPickup(queue: StopQueue, floor: number, direction: Direction): StopQueue {
  return insertStop(queue, floor, direction);
}

export function insertDestination(queue: StopQueue, floor: number, direction: Direction): StopQueue {
  return insertStop(queue, floor, direction);
}

export function removeStop(queue: StopQueue, floor: number, direction: Direction): StopQueue {
  return { ...queue, [direction]: queue[direction].filter((stop) => stop !== floor) };
}

export function nextStop(queue: StopQueue, currentFloor: number, direction: Direction): number | null {
  const candidates = queue[direction].filter((floor) =>
    direction === "up" ? floor >= currentFloor : floor <= currentFloor,
  );
  return candidates[0] ?? null;
}

export function canReverse(queue: StopQueue, direction: Direction): boolean {
  return queue[direction].length === 0;
}

export function nextDirection(queue: StopQueue, current: Direction): Direction | null {
  if (!canReverse(queue, current)) return current;
  return queue[opposite(current)].length > 0 ? opposite(current) : null;
}

export function orderedStops(queue: StopQueue, direction: Direction | null): number[] {
  if (direction === null) return [...queue.up, ...queue.down];
  return [...queue[direction], ...queue[opposite(direction)]];
}
