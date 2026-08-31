import type { Direction, EventType, SimulationSnapshot, Speed, TrafficPreset } from "../types";
import { AppHeader } from "./AppHeader";
import { BuildingVisualizer } from "./BuildingVisualizer";
import { SimulationControlBar } from "./SimulationControlBar";
import { ActiveRequestsPanel } from "./ActiveRequestsPanel";
import { DispatchEvaluationPanel } from "./DispatchEvaluationPanel";
import { ElevatorsStatusPanel } from "./ElevatorsStatusPanel";
import { PerformancePanel } from "./PerformancePanel";
import { EventLogPanel } from "./EventLogPanel";

type Props = {
  snapshot: SimulationSnapshot;
  eventFilter: EventType | "all";
  onHallClick: (floor: number, direction: Direction) => void;
  onPauseToggle: () => void;
  onReset: () => void;
  onAddRequest: () => void;
  onTraffic: (preset: TrafficPreset) => void;
  onSpeed: (speed: Speed) => void;
  onSelectRequest: (id: string) => void;
  onEventFilter: (filter: EventType | "all") => void;
};

export function AppShell({
  snapshot,
  eventFilter,
  onHallClick,
  onPauseToggle,
  onReset,
  onAddRequest,
  onTraffic,
  onSpeed,
  onSelectRequest,
  onEventFilter,
}: Props) {
  return (
    <div className="app-shell" data-testid="app-shell">
      <AppHeader snapshot={snapshot} onSpeed={onSpeed} />
      <div className="app-main">
        <div className="left-column">
          <BuildingVisualizer
            hallCalls={snapshot.hallCalls}
            elevators={snapshot.elevators}
            onHallClick={onHallClick}
          />
          <SimulationControlBar
            traffic={snapshot.traffic}
            speed={snapshot.speed}
            paused={snapshot.status === "Paused"}
            onPauseToggle={onPauseToggle}
            onReset={onReset}
            onAddRequest={onAddRequest}
            onTraffic={onTraffic}
            onSpeed={onSpeed}
          />
        </div>
        <div className="right-column">
          <div className="right-top">
            <ActiveRequestsPanel requests={snapshot.requests} onSelectRequest={onSelectRequest} />
            <DispatchEvaluationPanel evaluation={snapshot.evaluation} />
          </div>
          <ElevatorsStatusPanel elevators={snapshot.elevators} />
          <PerformancePanel metrics={snapshot.metrics} elevators={snapshot.elevators} />
        </div>
      </div>
      <EventLogPanel events={snapshot.events} filter={eventFilter} onFilter={onEventFilter} />
    </div>
  );
}
