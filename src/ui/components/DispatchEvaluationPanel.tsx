import type { DispatchEvaluation } from "../types";

type Props = {
  evaluation: DispatchEvaluation | null;
};

export function DispatchEvaluationPanel({ evaluation }: Props) {
  if (!evaluation) {
    return (
      <section className="panel" data-testid="dispatch-evaluation-panel">
        <div className="panel-head">Dispatch Evaluation</div>
        <p className="empty-state">Create or select a request to inspect its dispatch score.</p>
      </section>
    );
  }
  return (
    <section className="panel" data-testid="dispatch-evaluation-panel">
      <div className="panel-head">Dispatch Evaluation - Request #{evaluation.requestId}</div>
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
              <td className={row.emphasize ? "color-A" : undefined}>{row.A}</td>
              <td>{row.B}</td>
              <td>{row.C}</td>
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
