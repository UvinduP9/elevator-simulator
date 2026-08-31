import type { EventType, SimEvent } from "./types";

export class EventLogStore {
  private events: SimEvent[] = [];

  append(event: SimEvent): void {
    this.events.push(event);
  }

  filter(type: EventType | "all"): SimEvent[] {
    return this.events.filter((event) => type === "all" || event.type === type).map((event) => ({ ...event }));
  }

  clear(): void {
    this.events = [];
  }
}
