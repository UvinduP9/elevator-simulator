import { DirectionLabel } from "./DirectionLabel";
import { FLOOR_NUMBERS } from "../buildingLayout";
import type { ElevatorView, HallCall } from "../types";
import { HallCallColumn } from "./HallCallColumn";
import { ElevatorCar } from "./ElevatorCar";

type Props = {
  hallCalls: HallCall[];
  elevators: ElevatorView[];
};

export function BuildingVisualizer({ hallCalls, elevators }: Props) {
  const byId = {
    A: elevators.find((e) => e.id === "A")!,
    B: elevators.find((e) => e.id === "B")!,
    C: elevators.find((e) => e.id === "C")!,
  };

  return (
    <section className="panel visualizer" data-testid="building-visualizer">
      <div className="visualizer-head">
        <span className="label-floor">Floor</span>
        <span>Hall Calls</span>
        <span className="shaft-label-A">A</span>
        <span className="shaft-label-B">B</span>
        <span className="shaft-label-C">C</span>
      </div>
      <div className="visualizer-body">
      <div className="visualizer-grid">
        {FLOOR_NUMBERS.map((floor) => (
          <div className="floor-row" key={floor}>
            <div className="floor-num">{floor}</div>
            <HallCallColumn floor={floor} hallCalls={hallCalls} />
            <div className="shaft-cell">
              <div className="shaft-track" />
            </div>
            <div className="shaft-cell">
              <div className="shaft-track" />
            </div>
            <div className="shaft-cell">
              <div className="shaft-track" />
            </div>
          </div>
        ))}
      </div>
        <div className="cars-layer">
          <div />
          <div />
          <div className="car-slot">
            <ElevatorCar elevator={byId.A} />
          </div>
          <div className="car-slot">
            <ElevatorCar elevator={byId.B} />
          </div>
          <div className="car-slot">
            <ElevatorCar elevator={byId.C} />
          </div>
        </div>
      </div>
      <p className="visualizer-hint">
        Click <DirectionLabel direction="up" /> or <DirectionLabel direction="down" /> to create a
        passenger
      </p>
    </section>
  );
}
