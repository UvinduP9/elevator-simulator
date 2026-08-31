import { DEFAULT_MOTION } from "./config";
import type { Direction, Elevator, MotionCommand, Passenger } from "./types";

function motionDirection(from: number, to: number): Direction {
  return to > from ? "up" : "down";
}

export function tick(elevator: Elevator, dt: number, command: MotionCommand): Elevator {
  if (dt < 0) throw new RangeError("Tick duration cannot be negative");
  if (dt === 0) return elevator;
  const doorDwellSeconds = command.doorDwellSeconds ?? DEFAULT_MOTION.doorDwellSeconds;
  const floorsPerSecond = command.floorsPerSecond ?? DEFAULT_MOTION.floorsPerSecond;

  if (elevator.status === "doors-open") {
    const remaining = Math.max(0, elevator.doorRemainingSeconds - dt);
    return {
      ...elevator,
      status: remaining === 0 ? "idle" : "doors-open",
      doorRemainingSeconds: remaining,
      targetFloor: remaining === 0 ? null : elevator.targetFloor,
      busySeconds: elevator.busySeconds + dt,
    };
  }

  if (command.targetFloor === null) {
    return { ...elevator, status: "idle", direction: null, targetFloor: null };
  }
  const distance = command.targetFloor - elevator.floor;
  if (Math.abs(distance) < 1e-9) {
    return {
      ...elevator,
      floor: command.targetFloor,
      status: "doors-open",
      doorRemainingSeconds: doorDwellSeconds,
      targetFloor: command.targetFloor,
      busySeconds: elevator.busySeconds + dt,
    };
  }

  const direction = motionDirection(elevator.floor, command.targetFloor);
  const travel = floorsPerSecond * dt;
  const floor =
    Math.abs(distance) <= travel
      ? command.targetFloor
      : elevator.floor + (direction === "up" ? travel : -travel);
  const arrived = floor === command.targetFloor;
  return {
    ...elevator,
    floor,
    direction,
    status: arrived ? "doors-open" : "moving",
    doorRemainingSeconds: arrived ? doorDwellSeconds : 0,
    targetFloor: command.targetFloor,
    busySeconds: elevator.busySeconds + dt,
  };
}

export function board(elevator: Elevator, passengers: Passenger[]): Elevator {
  return { ...elevator, occupancy: elevator.occupancy + passengers.length };
}

export function alight(elevator: Elevator, passengers: Passenger[]): Elevator {
  return { ...elevator, occupancy: Math.max(0, elevator.occupancy - passengers.length) };
}
