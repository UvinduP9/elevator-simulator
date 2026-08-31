import { elevatorCenterY } from "../buildingLayout";
import type { ElevatorId, ElevatorView } from "../types";
import { ARROW_TO, DirectionLabel } from "./DirectionLabel";

const ELEVATOR_COLOR: Record<ElevatorId, "blue" | "orange" | "purple"> = {
  A: "blue",
  B: "orange",
  C: "purple",
};

type Props = {
  elevator: ElevatorView;
};

export function ElevatorCar({ elevator }: Props) {
  const { id } = elevator;
  const color = ELEVATOR_COLOR[id];
  const moving = elevator.status === "moving-up" || elevator.status === "moving-down";
  const y = elevatorCenterY(elevator.floor);

  return (
    <div
      className="elevator-car"
      style={{ top: y }}
      data-testid={`elevator-car-${elevator.id}`}
    >
      <img
        src={`/elevators/elevator-${id.toLowerCase()}-${color}.svg`}
        alt=""
        className="elevator-image"
      />
      <div className={`elevator-content color-${id}`}>
        {moving ? (
          <>
            <DirectionLabel
              direction={elevator.status === "moving-up" ? "up" : "down"}
              inheritColor
            />
            <span>
              {elevator.fromFloor} {ARROW_TO} {elevator.toFloor}
            </span>
          </>
        ) : (
          <span>{elevator.occupancy}</span>
        )}
      </div>
    </div>
  );
}
