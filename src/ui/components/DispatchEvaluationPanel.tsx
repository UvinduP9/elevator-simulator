import type { DispatchEvaluation } from "../types";

type Props = {
  evaluation: DispatchEvaluation;
};

function cell(value: number | string): string {
  return typeof value === "number" ? value.toFixed(1) : value;
}

export function DispatchEvaluationPanel({ evaluation }: Props) {
  const title =
    evaluation.requestId === "—"
      ? "Dispatch Evaluation"
      : `Dispatch Evaluation - Request #${evaluation.requestId}`;

  return (
    <section className="panel" data-testid="dispatch-evaluation-panel">
      <div className="panel-head">{title}</div>
      <p className="eval-caption">Latest assigned request, or click a row in Active Requests</p>
      <table className="table">
        <thead>
          <tr>
            <th>Factor</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
          </tr>
        </thead>
        <tbody>
          {evaluation.rows.map((row) => (
            <tr key={row.factor}>
              <td>{row.factor}</td>
              <td className={row.emphasize ? "color-A" : undefined}>{cell(row.A)}</td>
              <td>{cell(row.B)}</td>
              <td>{cell(row.C)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`eval-note color-${evaluation.selected}`}>
        Selected: Elevator {evaluation.selected}
      </div>
    </section>
  );
}
