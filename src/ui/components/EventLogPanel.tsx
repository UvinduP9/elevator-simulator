import { useState } from "react";
import type { EventType, LogEntry } from "../types";

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
  const [filter, setFilter] = useState<EventType | "All Events">("All Events");
  const visibleEvents = events.filter((event) => filter === "All Events" || event.type === filter);
  return (
    <section className="panel event-log" data-testid="event-log-panel">
      <div className="panel-head">
        Event Log
        <label>
          Filter:
          <select
            data-testid="event-log-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as EventType | "All Events")}
          >
            <option>All Events</option>
            <option>REQUEST</option>
            <option>DISPATCH</option>
            <option>ELEVATOR</option>
            <option>PASSENGER</option>
          </select>
        </label>
      </div>
      <div className="log-list">
        {visibleEvents.map((entry, index) => (
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
