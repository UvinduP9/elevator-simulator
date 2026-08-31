import type { ElevatorView } from "../types";
import { DirectionLabel } from "./DirectionLabel";
import { ElevatorLetter } from "./ElevatorLetter";

type Props = {
  elevators: ElevatorView[];
};

function StatusLabel({ status }: { status: ElevatorView["status"] }) {
  if (status === "moving-up") {
    return (
      <>
        Moving <DirectionLabel direction="up" />
      </>
    );
  }
  if (status === "moving-down") {
    return (
      <>
        Moving <DirectionLabel direction="down" />
      </>
    );
  }
  if (status === "doors-open") return "Doors open";
  return "Idle";
}

export function ElevatorsStatusPanel({ elevators }: Props) {
  return (
    <section className="panel" data-testid="elevators-status-panel">
      <div className="panel-head">Elevators</div>
      <table className="table">
        <thead>
          <tr>
            <th>Elevator</th>
            <th>Status</th>
            <th>Floor</th>
            <th>Next Stop</th>
            <th>Stops</th>
            <th>Occupancy</th>
            <th>Utilization</th>
          </tr>
        </thead>
        <tbody>
          {elevators.map((car) => (
            <tr key={car.id}>
              <td>
                <ElevatorLetter id={car.id} />
              </td>
              <td>
                <StatusLabel status={car.status} />
              </td>
              <td>{Number.isInteger(car.floor) ? car.floor : car.floor.toFixed(1)}</td>
              <td>{car.nextStop ?? "—"}</td>
              <td>{car.stops.join(" · ")}</td>
              <td className={`color-${car.id}`}>
                {car.occupancy} / {car.occupancyMax}
              </td>
              <td>
                <div className="util-mini">
                  <div className="util-track">
                    <div
                      className={`util-fill bg-${car.id}`}
                      style={{ width: `${car.utilization}%` }}
                    />
                  </div>
                  {car.utilization.toFixed(0)}%
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
