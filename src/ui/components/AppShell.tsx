import type { SimulationSnapshot } from "../types";
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
};

export function AppShell({ snapshot }: Props) {
  return (
    <div className="app-shell" data-testid="app-shell">
      <AppHeader snapshot={snapshot} />
      <div className="app-main">
        <div className="left-column">
          <BuildingVisualizer hallCalls={snapshot.hallCalls} elevators={snapshot.elevators} />
          <SimulationControlBar traffic={snapshot.traffic} speed={snapshot.speed} />
        </div>
        <div className="right-column">
          <div className="right-top">
            <ActiveRequestsPanel requests={snapshot.requests} />
            <DispatchEvaluationPanel evaluation={snapshot.evaluation} />
          </div>
          <ElevatorsStatusPanel elevators={snapshot.elevators} />
          <PerformancePanel metrics={snapshot.metrics} elevators={snapshot.elevators} />
        </div>
      </div>
      <EventLogPanel events={snapshot.events} />
    </div>
  );
}
