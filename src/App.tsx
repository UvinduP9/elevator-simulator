import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationService } from "./simulation";
import { AppShell } from "./ui/components/AppShell";
import { toUiSnapshot } from "./ui/simulationAdapter";
import type { Direction, Speed, TrafficPreset } from "./ui/types";

export function App() {
  const serviceRef = useRef<SimulationService | null>(null);
  if (serviceRef.current === null) serviceRef.current = new SimulationService();
  const service = serviceRef.current;
  const [snapshot, setSnapshot] = useState(() => toUiSnapshot(service.getSnapshot()));

  const refresh = useCallback(() => setSnapshot(toUiSnapshot(service.getSnapshot())), [service]);

  useEffect(() => {
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const realDt = Math.min(0.1, (now - previous) / 1000);
      previous = now;
      setSnapshot(toUiSnapshot(service.tick(realDt)));
    }, 50);
    return () => window.clearInterval(timer);
  }, [service]);

  const actions = {
    onHallClick: (floor: number, direction: Direction) => {
      service.clickHall(floor, direction);
      refresh();
    },
    onPauseToggle: () => {
      if (service.getSnapshot().clock.running) service.pause();
      else service.resume();
      refresh();
    },
    onReset: () => {
      service.reset();
      refresh();
    },
    onAddRequest: () => {
      service.addRandomRequest();
      refresh();
    },
    onTrafficChange: (traffic: TrafficPreset) => {
      service.setTraffic(traffic);
      refresh();
    },
    onSpeedChange: (speed: Speed) => {
      service.setSpeed(speed);
      refresh();
    },
    onRequestSelect: (id: string) => {
      service.selectRequest(id);
      refresh();
    },
  };

  return <AppShell snapshot={snapshot} actions={actions} />;
}
