import { alight, assign, board, emptyQueue, tick } from "../engine";
import type { Direction, Elevator, ElevatorId, HallRequest, Passenger } from "../engine/types";
import { ELEVATOR_IDS } from "../engine/types";
import { initialClock, simDt } from "./clock";
import { appendEvent } from "./eventLog";
import { ARROW_TO, arrow } from "./format";
import { addBusy, initialMetrics, recordTrip, type MetricsState } from "./metrics";
import { defaultRng, pickOne, randomInt, type Rng } from "./rng";
import { buildSnapshot } from "./snapshot";
import { catchUpSpawns } from "./traffic";
import type {
  Elevators,
  SimEvent,
  SimPassenger,
  SimRequest,
  SimulationOptions,
  SimulationSnapshot,
  Speed,
  TrafficPreset,
} from "./types";

function idleCar(id: ElevatorId): Elevator {
  return {
    id,
    floor: 1,
    status: "idle",
    direction: null,
    queue: emptyQueue(),
    occupancy: 0,
    doorTimer: 0,
  };
}

function initialElevators(): Elevators {
  return { A: idleCar("A"), B: idleCar("B"), C: idleCar("C") };
}

function padId(seq: number): string {
  return String(seq).padStart(3, "0");
}

function validHall(floor: number, direction: Direction): boolean {
  if (direction === "up") return floor >= 1 && floor <= 9;
  return floor >= 2 && floor <= 10;
}

function destinationFloors(pickup: number, direction: Direction): number[] {
  if (direction === "up") {
    const out: number[] = [];
    for (let f = pickup + 1; f <= 10; f++) out.push(f);
    return out;
  }
  const out: number[] = [];
  for (let f = 1; f < pickup; f++) out.push(f);
  return out;
}

function stopFloor(elevator: Elevator): number {
  return Math.round(elevator.floor);
}

export class SimulationService {
  private rng: Rng;
  private now = 0;
  private speed: Speed = 1;
  private paused = false;
  private traffic: TrafficPreset = "Off";
  private spawnDebt = 0;
  private elevators: Elevators = initialElevators();
  private requests: SimRequest[] = [];
  private passengers: SimPassenger[] = [];
  private metrics: MetricsState = initialMetrics();
  private events: SimEvent[] = [];
  private selectedRequestId: string | null = null;
  private nextRequestSeq = 1;
  private motionFrom: Record<ElevatorId, number> = { A: 1, B: 1, C: 1 };
  private nextPassengerSeq = 1;

  constructor(options: SimulationOptions = {}) {
    this.rng = options.rng ?? defaultRng;
  }

  reset(): void {
    const clock = initialClock();
    this.now = clock.now;
    this.speed = clock.speed;
    this.paused = clock.paused;
    this.traffic = "Off";
    this.spawnDebt = 0;
    this.elevators = initialElevators();
    this.requests = [];
    this.passengers = [];
    this.metrics = initialMetrics();
    this.events = [];
    this.selectedRequestId = null;
    this.nextRequestSeq = 1;
    this.nextPassengerSeq = 1;
    this.motionFrom = { A: 1, B: 1, C: 1 };
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  setSpeed(speed: Speed): void {
    this.speed = speed;
  }

  setTraffic(preset: TrafficPreset): void {
    this.traffic = preset;
    if (preset === "Off") this.spawnDebt = 0;
  }

  selectRequest(id: string): void {
    if (this.requests.some((r) => r.request.id === id)) this.selectedRequestId = id;
  }

  clickHall(floor: number, direction: Direction): void {
    if (!validHall(floor, direction)) return;
    const dests = destinationFloors(floor, direction);
    if (dests.length === 0) return;
    this.createAndAssign(floor, direction, pickOne(this.rng, dests));
  }

  addRandomRequest(): void {
    const pickup = randomInt(this.rng, 1, 10);
    const direction: Direction =
      pickup === 1 ? "up" : pickup === 10 ? "down" : this.rng() < 0.5 ? "up" : "down";
    const dests = destinationFloors(pickup, direction);
    this.createAndAssign(pickup, direction, pickOne(this.rng, dests));
  }

  step(realDt: number): void {
    const dt = simDt({ now: this.now, speed: this.speed, paused: this.paused }, realDt);
    if (dt <= 0) return;
    this.now += dt;

    if (this.traffic !== "Off") {
      this.spawnDebt += dt;
      const { count, debt } = catchUpSpawns(this.spawnDebt, this.traffic);
      this.spawnDebt = debt;
      for (let i = 0; i < count; i++) this.addRandomRequest();
    }

    for (const id of ELEVATOR_IDS) {
      const before = this.elevators[id];
      let after = tick(before, dt);
      if (before.status !== "doors-open" && after.status === "doors-open") {
        this.logElevator(after, `Doors opened at F${stopFloor(after)}`);
        after = this.alightThenBoard(after);
      } else if (before.status !== after.status) {
        this.logStatusChange(after);
      }
      if (after.status === "moving-up" || after.status === "moving-down") {
        if (before.status !== after.status) this.motionFrom[id] = stopFloor(before);
      }
      if (after.status !== "idle") addBusy(this.metrics, id, dt);
      this.elevators[id] = after;
    }
  }

  getSnapshot(): SimulationSnapshot {
    return buildSnapshot({
      now: this.now,
      paused: this.paused,
      speed: this.speed,
      traffic: this.traffic,
      elevators: this.elevators,
      requests: this.requests,
      events: this.events,
      metrics: this.metrics,
      selectedRequestId: this.selectedRequestId,
      motionFrom: this.motionFrom,
    });
  }

  /** Test helper: current simulation seconds. */
  getNow(): number {
    return this.now;
  }

  /** Test helper: request records including destination and status. */
  getRequests(): readonly SimRequest[] {
    return this.requests;
  }

  private createAndAssign(pickup: number, direction: Direction, destination: number): void {
    const id = padId(this.nextRequestSeq++);
    const hall: HallRequest = {
      id,
      pickupFloor: pickup,
      direction,
      destinationFloor: destination,
      createdAt: this.now,
      assignedElevatorId: null,
      status: "unassigned",
    };
    this.events = appendEvent(this.events, {
      at: this.now,
      type: "REQUEST",
      text: `F${pickup} ${arrow(direction)} created`,
    });

    const result = assign(hall, { now: this.now, elevators: this.elevators });
    const previous = this.elevators[result.elevatorId];
    this.elevators = result.state.elevators;
    const winner = this.elevators[result.elevatorId];

    this.requests = [
      ...this.requests,
      { request: result.request, breakdown: result.breakdown, pickupAt: null, dropoffAt: null },
    ];
    this.selectedRequestId = id;
    this.events = appendEvent(this.events, {
      at: this.now,
      type: "DISPATCH",
      elevatorId: result.elevatorId,
      text: `Request #${id} ${ARROW_TO} Elevator ${result.elevatorId}`,
    });

    if (winner.status === "doors-open" && stopFloor(winner) === pickup) {
      if (previous.status !== "doors-open") {
        this.logElevator(winner, `Doors opened at F${pickup}`);
        this.elevators[result.elevatorId] = this.alightThenBoard(winner);
      } else {
        this.elevators[result.elevatorId] = this.boardAt(winner, pickup);
      }
    }
  }

  private alightThenBoard(elevator: Elevator): Elevator {
    const floor = stopFloor(elevator);
    const afterAlight = this.alightAt(elevator, floor);
    return this.boardAt(afterAlight, floor);
  }

  private alightAt(elevator: Elevator, floor: number): Elevator {
    const leaving = this.passengers.filter((p) => p.elevatorId === elevator.id && p.destinationFloor === floor);
    if (leaving.length === 0) return elevator;
    const updated = alight(
      elevator,
      leaving.map((p) => this.toPassenger(p)),
    );
    this.passengers = this.passengers.filter((p) => !leaving.includes(p));
    for (const p of leaving) {
      this.completeRequest(p);
      this.events = appendEvent(this.events, {
        at: this.now,
        type: "PASSENGER",
        elevatorId: elevator.id,
        text: `${p.id} alighted ${elevator.id} at F${floor}`,
      });
    }
    return updated;
  }

  private boardAt(elevator: Elevator, floor: number): Elevator {
    const boardingReqs = this.requests.filter(
      (r) =>
        r.request.status === "assigned" &&
        r.request.assignedElevatorId === elevator.id &&
        r.request.pickupFloor === floor,
    );
    if (boardingReqs.length === 0) return elevator;
    const newcomers: SimPassenger[] = boardingReqs.map((r) => ({
      id: `P${padId(this.nextPassengerSeq++)}`,
      requestId: r.request.id,
      originFloor: r.request.pickupFloor,
      destinationFloor: r.request.destinationFloor,
      elevatorId: elevator.id,
    }));
    const updated = board(
      elevator,
      newcomers.map((p) => this.toPassenger(p)),
    );
    this.passengers = [...this.passengers, ...newcomers];
    this.requests = this.requests.map((r) => {
      if (!boardingReqs.includes(r)) return r;
      return {
        ...r,
        pickupAt: this.now,
        request: { ...r.request, status: "boarded" },
      };
    });
    for (const p of newcomers) {
      this.events = appendEvent(this.events, {
        at: this.now,
        type: "PASSENGER",
        elevatorId: elevator.id,
        text: `${p.id} boarded ${elevator.id}, destination F${p.destinationFloor}`,
      });
    }
    return updated;
  }

  private completeRequest(passenger: SimPassenger): void {
    this.requests = this.requests.map((r) => {
      if (r.request.id !== passenger.requestId) return r;
      const pickupAt = r.pickupAt ?? this.now;
      const wait = pickupAt - r.request.createdAt;
      const journey = this.now - r.request.createdAt;
      recordTrip(this.metrics, wait, journey);
      return {
        ...r,
        dropoffAt: this.now,
        request: { ...r.request, status: "completed" },
      };
    });
  }

  private toPassenger(p: SimPassenger): Passenger {
    return {
      id: p.id,
      requestId: p.requestId,
      originFloor: p.originFloor,
      destinationFloor: p.destinationFloor,
    };
  }

  private logElevator(elevator: Elevator, text: string): void {
    this.events = appendEvent(this.events, {
      at: this.now,
      type: "ELEVATOR",
      elevatorId: elevator.id,
      text,
    });
  }

  private logStatusChange(elevator: Elevator): void {
    if (elevator.status === "idle") {
      this.logElevator(elevator, `Idle at F${stopFloor(elevator)}`);
    } else if (elevator.status === "moving-up") {
      this.logElevator(elevator, "Moving up");
    } else if (elevator.status === "moving-down") {
      this.logElevator(elevator, "Moving down");
    }
  }
}
