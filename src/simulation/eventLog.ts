import { formatSimTime } from "./format";
import type { EventType, LogEntry, SimEvent } from "./types";

export function appendEvent(events: SimEvent[], event: SimEvent): SimEvent[] {
  return [...events, event];
}

export function filterEvents(events: SimEvent[], type: EventType | "all"): SimEvent[] {
  if (type === "all") return events;
  return events.filter((e) => e.type === type);
}

export function toLogEntries(events: SimEvent[]): LogEntry[] {
  return events.map((e) => ({
    time: formatSimTime(e.at),
    type: e.type,
    elevatorId: e.elevatorId,
    text: e.text,
  }));
}
