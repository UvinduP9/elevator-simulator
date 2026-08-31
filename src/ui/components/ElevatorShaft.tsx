import type { ElevatorId, ElevatorView } from "../types";
import { ElevatorCar } from "./ElevatorCar";

type Props = {
  id: ElevatorId;
  elevator: ElevatorView;
};

export function ElevatorShaft({ id, elevator }: Props) {
  return (
    <div className="shaft-cell" data-testid={`elevator-shaft-${id}`}>
      <div className="shaft-track" />
      <ElevatorCar elevator={elevator} />
    </div>
  );
}
