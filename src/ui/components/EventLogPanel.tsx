import type { EventType, LogEntry } from "../types";

type Props = {
  events: LogEntry[];
  filter: EventType | "all";
  onFilter: (filter: EventType | "all") => void;
};

const FILTERS: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "REQUEST", label: "REQUEST" },
  { value: "DISPATCH", label: "DISPATCH" },
  { value: "ELEVATOR", label: "ELEVATOR" },
  { value: "PASSENGER", label: "PASSENGER" },
];

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

export function EventLogPanel({ events, filter, onFilter }: Props) {
  const visible = filter === "all" ? events : events.filter((entry) => entry.type === filter);

  return (
    <section className="panel event-log" data-testid="event-log-panel">
      <div className="panel-head">
        Event Log
        <label>
          Filter:
          <select
            data-testid="event-log-filter"
            value={filter}
            onChange={(event) => onFilter(event.target.value as EventType | "all")}
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="log-list">
        {visible.length === 0 ? (
          <div className="log-row log-empty">No events</div>
        ) : (
          visible.map((entry, index) => (
            <div className="log-row" key={`${entry.time}-${index}`}>
              <span className="log-time">{entry.time}</span>
              <span className={pillClass(entry)}>{pillLabel(entry)}</span>
              <span className="log-text">{entry.text}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
