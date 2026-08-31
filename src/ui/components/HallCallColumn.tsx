import type { Direction, HallCall } from "../types";
import { ARROW_DOWN, ARROW_UP } from "./DirectionLabel";
import { ElevatorLetter } from "./ElevatorLetter";

type Props = {
  floor: number;
  hallCalls: HallCall[];
};

function callFor(calls: HallCall[], floor: number, direction: Direction) {
  return calls.find((c) => c.floor === floor && c.direction === direction);
}

export function HallCallColumn({ floor, hallCalls }: Props) {
  const up = floor < 10 ? callFor(hallCalls, floor, "up") : undefined;
  const down = floor > 1 ? callFor(hallCalls, floor, "down") : undefined;

  return (
    <div className="hall-cell">
      {floor < 10 && (
        <button
          type="button"
          className={`hall-btn${up?.assigned ? ` active-${up.assigned}` : ""}`}
          data-testid={`hall-call-${floor}-up`}
          aria-label={`Hall up floor ${floor}`}
        >
          {ARROW_UP}
        </button>
      )}
      {up?.assigned && <ElevatorLetter id={up.assigned} />}
      {floor > 1 && (
        <button
          type="button"
          className={`hall-btn${down?.assigned ? ` active-${down.assigned}` : ""}`}
          data-testid={`hall-call-${floor}-down`}
          aria-label={`Hall down floor ${floor}`}
        >
          {ARROW_DOWN}
        </button>
      )}
      {down?.assigned && <ElevatorLetter id={down.assigned} />}
    </div>
  );
}
