import { useState } from "react";
import { AppShell } from "./ui/components/AppShell";
import { useSimulation } from "./ui/useSimulation";
import type { EventType, Speed, TrafficPreset } from "./ui/types";

export function App() {
  const { snapshot, service, refresh } = useSimulation();
  const [eventFilter, setEventFilter] = useState<EventType | "all">("all");

  return (
    <AppShell
      snapshot={snapshot}
      eventFilter={eventFilter}
      onHallClick={(floor, direction) => {
        service.clickHall(floor, direction);
        refresh();
      }}
      onPauseToggle={() => {
        if (snapshot.status === "Paused") service.resume();
        else service.pause();
        refresh();
      }}
      onReset={() => {
        service.reset();
        setEventFilter("all");
        refresh();
      }}
      onAddRequest={() => {
        service.addRandomRequest();
        refresh();
      }}
      onTraffic={(preset: TrafficPreset) => {
        service.setTraffic(preset);
        refresh();
      }}
      onSpeed={(speed: Speed) => {
        service.setSpeed(speed);
        refresh();
      }}
      onSelectRequest={(id) => {
        service.selectRequest(id);
        refresh();
      }}
      onEventFilter={setEventFilter}
    />
  );
}
