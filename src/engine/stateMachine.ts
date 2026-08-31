import { ARRIVAL_EPS, DOOR_DWELL_SECONDS, FLOORS_PER_SECOND, MAX_FLOOR, MIN_FLOOR } from "./config";
import { canReverse, ensureApproachStops, nextStop, removeStop, stopCount } from "./stopQueue";
import type { Direction, Elevator, ElevatorStatus, Passenger } from "./types";

function clampFloor(floor: number): number {
  return Math.min(MAX_FLOOR, Math.max(MIN_FLOOR, floor));
}

function occupiedStop(floor: number): number | null {
  const at = Math.round(floor);
  if (Math.abs(floor - at) > ARRIVAL_EPS) return null;
  return at;
}

function movingStatus(direction: Direction): ElevatorStatus {
  return direction === "up" ? "moving-up" : "moving-down";
}

function opposite(direction: Direction): Direction {
  return direction === "up" ? "down" : "up";
}

function afterDoorsClose(elevator: Elevator): Elevator {
  const queue = ensureApproachStops(elevator.queue, elevator.floor);
  const current = { ...elevator, queue };
  const dir = current.direction;
  if (!dir) {
    return startTowardQueue(current);
  }
  const nxt = nextStop(current.queue, current.floor, dir);
  if (nxt !== null) {
    return { ...current, status: movingStatus(dir), doorTimer: 0 };
  }
  if (canReverse(current.queue, dir, current.floor)) {
    const opp = opposite(dir);
    const nxtOpp = nextStop(current.queue, current.floor, opp);
    if (nxtOpp !== null) {
      return { ...current, direction: opp, status: movingStatus(opp), doorTimer: 0 };
    }
  }
  return startTowardQueue(current);
}

function startTowardQueue(elevator: Elevator): Elevator {
  const queue = ensureApproachStops(elevator.queue, elevator.floor);
  const at = occupiedStop(elevator.floor);
  if (at !== null && (queue.up.includes(at) || queue.down.includes(at))) {
    const direction: Direction = elevator.direction ?? (queue.up.includes(at) ? "up" : "down");
    return {
      ...elevator,
      queue,
      direction,
      status: "doors-open",
      doorTimer: elevator.doorTimer > 0 ? elevator.doorTimer : DOOR_DWELL_SECONDS,
    };
  }
  const up = nextStop(queue, elevator.floor, "up");
  const down = nextStop(queue, elevator.floor, "down");
  if (up === null && down === null) {
    return { ...elevator, queue, status: "idle", direction: null, doorTimer: 0 };
  }
  let direction: Direction;
  if (up !== null && down !== null) {
    direction = Math.abs(up - elevator.floor) <= Math.abs(down - elevator.floor) ? "up" : "down";
  } else {
    direction = up !== null ? "up" : "down";
  }
  return { ...elevator, queue, direction, status: movingStatus(direction), doorTimer: 0 };
}

export function tick(elevator: Elevator, dt: number): Elevator {
  if (dt <= 0) return elevator;

  if (elevator.status === "doors-open") {
    const remaining = elevator.doorTimer - dt;
    if (remaining > 0) {
      return { ...elevator, doorTimer: remaining };
    }
    const stop = occupiedStop(elevator.floor);
    const cleared = {
      ...elevator,
      queue: stop === null ? elevator.queue : removeStop(elevator.queue, stop),
      doorTimer: 0,
    };
    return afterDoorsClose(cleared);
  }

  if (elevator.status === "idle" || elevator.direction === null) {
    if (stopCount(elevator.queue) === 0) return elevator;
    const started = startTowardQueue(elevator);
    if (started.status === "doors-open" || started.status === "idle" || started.direction === null) {
      return started;
    }
    return tick(started, dt);
  }

  const target = nextStop(elevator.queue, elevator.floor, elevator.direction);
  if (target === null) {
    return afterDoorsClose(elevator);
  }

  const sign = target > elevator.floor ? 1 : -1;
  const distance = Math.abs(target - elevator.floor);
  const step = FLOORS_PER_SECOND * dt;
  if (distance <= step + ARRIVAL_EPS) {
    return {
      ...elevator,
      floor: target,
      status: "doors-open",
      doorTimer: DOOR_DWELL_SECONDS,
    };
  }
  return { ...elevator, floor: clampFloor(elevator.floor + sign * step) };
}

export function board(elevator: Elevator, passengers: Passenger[]): Elevator {
  return { ...elevator, occupancy: elevator.occupancy + passengers.length };
}

export function alight(elevator: Elevator, passengers: Passenger[]): Elevator {
  const n = Math.min(passengers.length, elevator.occupancy);
  return { ...elevator, occupancy: elevator.occupancy - n };
}
