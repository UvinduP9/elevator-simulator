import {
  MAX_FLOOR,
  MIN_FLOOR,
  alight,
  assign,
  board,
  canReverse,
  createStopQueue,
  insertDestination,
  insertPickup,
  isFloor,
  nextStop,
  opposite,
  removeStop,
  tick as tickElevator,
} from "../engine";
import type {
  CostBreakdown,
  Direction,
  Elevator,
  ElevatorId,
  HallRequest,
  Passenger,
} from "../engine";
import { EventLogStore } from "./event-log-store";
import { MetricsCollector } from "./metrics-collector";
import type { RandomSource } from "./random";
import { createSeededRandom } from "./random";
import { SimulationClock } from "./simulation-clock";
import { TrafficGenerator } from "./traffic-generator";
import type { SimulationSnapshot, Speed, TrafficPreset } from "./types";

const ELEVATOR_STARTS: Record<ElevatorId, number> = { A: 1, B: 5, C: 10 };

function createElevators(): Elevator[] {
  return (["A", "B", "C"] as ElevatorId[]).map((id) => ({
    id,
    floor: ELEVATOR_STARTS[id],
    direction: null,
    status: "idle",
    stops: createStopQueue(),
    occupancy: 0,
    doorRemainingSeconds: 0,
    targetFloor: null,
    busySeconds: 0,
  }));
}

export class SimulationService {
  private readonly clock = new SimulationClock();
  private readonly traffic: TrafficGenerator;
  private readonly metrics = new MetricsCollector();
  private readonly eventLog = new EventLogStore();
  private elevators = createElevators();
  private requests: HallRequest[] = [];
  private passengers: Passenger[] = [];
  private latestEvaluation: { requestId: string; breakdown: CostBreakdown } | null = null;
  private requestSequence = 0;
  private readonly random: RandomSource;

  constructor(random: RandomSource = createSeededRandom(20260831)) {
    this.random = random;
    this.traffic = new TrafficGenerator(random);
  }

  getSnapshot(): SimulationSnapshot {
    const clock = this.clock.snapshot();
    return structuredClone({
      clock,
      traffic: this.traffic.getPreset(),
      world: { now: clock.now, elevators: this.elevators, requests: this.requests },
      passengers: this.passengers,
      metrics: this.metrics.snapshot(),
      events: this.eventLog.filter("all"),
      latestEvaluation: this.latestEvaluation,
    });
  }

  clickHall(floor: number, direction: Direction): HallRequest {
    if (!isFloor(floor)) throw new RangeError(`Floor must be between 1 and 10: ${floor}`);
    if ((floor === MAX_FLOOR && direction === "up") || (floor === MIN_FLOOR && direction === "down")) {
      throw new RangeError(`Direction ${direction} is invalid at floor ${floor}`);
    }
    return this.createRequest(floor, direction);
  }

  addRandomRequest(): HallRequest {
    const pickupFloor = MIN_FLOOR + Math.floor(this.random() * (MAX_FLOOR - MIN_FLOOR + 1));
    const direction: Direction =
      pickupFloor === MIN_FLOOR
        ? "up"
        : pickupFloor === MAX_FLOOR
          ? "down"
          : this.random() < 0.5
            ? "up"
            : "down";
    return this.createRequest(pickupFloor, direction);
  }

  setTraffic(preset: TrafficPreset): void {
    this.traffic.setPreset(preset, this.clock.snapshot().now);
  }

  setSpeed(speed: Speed): void {
    this.clock.setSpeed(speed);
  }

  pause(): void {
    this.clock.pause();
  }

  resume(): void {
    this.clock.resume();
  }

  reset(): void {
    this.clock.reset();
    this.traffic.reset();
    this.metrics.reset();
    this.eventLog.clear();
    this.elevators = createElevators();
    this.requests = [];
    this.passengers = [];
    this.latestEvaluation = null;
    this.requestSequence = 0;
  }

  selectRequest(id: string): void {
    const request = this.requests.find((candidate) => candidate.id === id);
    if (!request) return;
    this.latestEvaluation = {
      requestId: id,
      breakdown: assign(request, this.world()).breakdown,
    };
  }

  tick(realDt: number): SimulationSnapshot {
    const { simDt, state } = this.clock.tick(realDt);
    if (simDt === 0) return this.getSnapshot();

    const spawnCount = this.traffic.maybeSpawn(state.now);
    for (let index = 0; index < spawnCount; index += 1) this.addRandomRequest();
    this.metrics.onTick(simDt);
    this.elevators = this.elevators.map((elevator) => this.advanceElevator(elevator, simDt, state.now));
    return this.getSnapshot();
  }

  private world() {
    return { now: this.clock.snapshot().now, elevators: this.elevators, requests: this.requests };
  }

  private createRequest(pickupFloor: number, direction: Direction): HallRequest {
    const now = this.clock.snapshot().now;
    const destinationFloor = this.randomDestination(pickupFloor, direction);
    const request: HallRequest = {
      id: String(++this.requestSequence).padStart(3, "0"),
      pickupFloor,
      direction,
      destinationFloor,
      createdAt: now,
      status: "pending",
      assignedElevatorId: null,
    };
    const assignment = assign(request, this.world());
    request.status = "assigned";
    request.assignedElevatorId = assignment.elevatorId;
    this.requests.push(request);
    const elevator = this.elevators.find((candidate) => candidate.id === assignment.elevatorId)!;
    const approach: Direction =
      pickupFloor > elevator.floor ? "up" : pickupFloor < elevator.floor ? "down" : direction;
    elevator.stops = insertPickup(elevator.stops, pickupFloor, approach);
    if (elevator.direction === null) elevator.direction = approach;
    this.latestEvaluation = { requestId: request.id, breakdown: assignment.breakdown };
    this.metrics.onRequestCreated(request, now);
    this.eventLog.append({ time: now, type: "REQUEST", text: `F${pickupFloor} ${direction} created` });
    this.eventLog.append({
      time: now,
      type: "DISPATCH",
      text: `Request #${request.id} -> Elevator ${assignment.elevatorId}`,
    });
    return structuredClone(request);
  }

  private randomDestination(pickupFloor: number, direction: Direction): number {
    if (direction === "up") {
      return pickupFloor + 1 + Math.floor(this.random() * (MAX_FLOOR - pickupFloor));
    }
    return MIN_FLOOR + Math.floor(this.random() * (pickupFloor - MIN_FLOOR));
  }

  private advanceElevator(elevator: Elevator, dt: number, now: number): Elevator {
    let current = elevator;
    if (current.direction === null) current = { ...current, direction: this.chooseInitialDirection(current) };
    if (current.direction !== null && nextStop(current.stops, current.floor, current.direction) === null) {
      if (canReverse(current.stops, current.direction)) {
        const reverse = opposite(current.direction);
        current = { ...current, direction: current.stops[reverse].length > 0 ? reverse : null };
      }
    }
    const target = current.direction === null ? null : nextStop(current.stops, current.floor, current.direction);
    const wasDoorsOpen = current.status === "doors-open";
    let advanced = tickElevator(current, dt, { targetFloor: target });
    this.metrics.onUtilization(advanced.id, advanced.status !== "idle", dt);

    if (!wasDoorsOpen && advanced.status === "doors-open" && target !== null) {
      advanced = this.serviceFloor(advanced, target, now);
    }
    return advanced;
  }

  private chooseInitialDirection(elevator: Elevator): Direction | null {
    const candidates = [
      ...elevator.stops.up.map((floor) => ({ floor, queue: "up" as const })),
      ...elevator.stops.down.map((floor) => ({ floor, queue: "down" as const })),
    ];
    if (candidates.length === 0) return null;
    const nearest = candidates.sort(
      (left, right) => Math.abs(left.floor - elevator.floor) - Math.abs(right.floor - elevator.floor),
    )[0]!;
    if (nearest.floor > elevator.floor) return "up";
    if (nearest.floor < elevator.floor) return "down";
    return nearest.queue;
  }

  private serviceFloor(elevator: Elevator, floor: number, now: number): Elevator {
    const direction = elevator.direction;
    if (direction === null) return elevator;
    let updated = { ...elevator, stops: removeStop(elevator.stops, floor, direction) };

    const alighting = this.passengers.filter(
      (passenger) => passenger.elevatorId === elevator.id && passenger.destinationFloor === floor,
    );
    if (alighting.length > 0) {
      updated = alight(updated, alighting);
      const ids = new Set(alighting.map((passenger) => passenger.requestId));
      for (const request of this.requests.filter((candidate) => ids.has(candidate.id))) {
        request.status = "completed";
        request.completedAt = now;
        this.metrics.onDropoff(request, now);
      }
      this.passengers = this.passengers.filter((passenger) => !ids.has(passenger.requestId));
      this.eventLog.append({
        time: now,
        type: "PASSENGER",
        text: `${alighting.length} passenger(s) left Elevator ${elevator.id} at F${floor}`,
      });
    }

    const currentDirectionEmpty = updated.stops[direction].length === 0;
    const boardingRequests = this.requests.filter(
      (request) =>
        request.assignedElevatorId === elevator.id &&
        request.status === "assigned" &&
        request.pickupFloor === floor &&
        (request.direction === direction || currentDirectionEmpty),
    );
    const boarding = boardingRequests.map<Passenger>((request) => ({
      id: `P${request.id}`,
      requestId: request.id,
      elevatorId: elevator.id,
      destinationFloor: request.destinationFloor,
    }));
    if (boarding.length > 0) {
      updated = board(updated, boarding);
      this.passengers.push(...boarding);
      for (const request of boardingRequests) {
        request.status = "picked-up";
        request.pickedUpAt = now;
        updated.stops = insertDestination(updated.stops, request.destinationFloor, request.direction);
        this.metrics.onPickup(request, now);
      }
      this.eventLog.append({
        time: now,
        type: "PASSENGER",
        text: `${boarding.length} passenger(s) boarded Elevator ${elevator.id} at F${floor}`,
      });
    }

    for (const request of this.requests.filter(
      (candidate) =>
        candidate.assignedElevatorId === elevator.id &&
        candidate.status === "assigned" &&
        candidate.pickupFloor === floor,
    )) {
      updated.stops = insertPickup(updated.stops, floor, request.direction);
    }
    this.eventLog.append({ time: now, type: "ELEVATOR", text: `Elevator ${elevator.id} doors opened at F${floor}` });
    return updated;
  }
}
