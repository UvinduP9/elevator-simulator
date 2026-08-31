import type { LogEntry } from "../types";

type Props = {
  events: LogEntry[];
};

function pillLabel(entry: LogEntry) {
  if (entry.type === "ELEVATOR" && entry.elevatorId) return `ELEVATOR ${entry.elevatorId}`;
  return entry.type;
}

function pillClass(entry: LogEntry) {
  if (entry.type === "ELEVATOR" && entry.elevatorId) {
    return `pill pill-ELEVATOR-${entry.elevatorId}`;
  }
  return `pill pill-${entry.type}`;
}

export function EventLogPanel({ events }: Props) {
  return (
    <section className="panel event-log" data-testid="event-log-panel">
      <div className="panel-head">
        Event Log
        <label>
          Filter:
          <select data-testid="event-log-filter" defaultValue="All Events">
            <option>All Events</option>
            <option>REQUEST</option>
            <option>DISPATCH</option>
            <option>ELEVATOR</option>
            <option>PASSENGER</option>
          </select>
        </label>
      </div>
      <div className="log-list">
        {events.map((entry, index) => (
          <div className="log-row" key={`${entry.time}-${index}`}>
            <span className="log-time">{entry.time}</span>
            <span className={pillClass(entry)}>{pillLabel(entry)}</span>
            <span className="log-text">{entry.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
