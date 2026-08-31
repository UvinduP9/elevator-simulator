import type { ActiveRequest } from "../types";
import { DirectionLabel } from "./DirectionLabel";
import { ElevatorLetter } from "./ElevatorLetter";

type Props = {
  requests: ActiveRequest[];
  onSelect: (id: string) => void;
};

export function ActiveRequestsPanel({ requests, onSelect }: Props) {
  return (
    <section className="panel" data-testid="active-requests-panel">
      <div className="panel-head">Active Requests</div>
      <table className="table">
        <thead>
          <tr>
            <th>Floor</th>
            <th>Dir</th>
            <th>Wait</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr
              key={req.id}
              className={req.highlighted ? "row-highlight request-row" : "request-row"}
              onClick={() => onSelect(req.id)}
            >
              <td>F{req.floor}</td>
              <td>
                <DirectionLabel direction={req.direction} />
              </td>
              <td>{req.waitSeconds.toFixed(1)}s</td>
              <td>
                <ElevatorLetter id={req.assigned} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
