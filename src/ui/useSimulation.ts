import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationService } from "../simulation";
import type { SimulationSnapshot } from "./types";

const MAX_FRAME_DT = 0.1;

export function useSimulation() {
  const serviceRef = useRef<SimulationService | null>(null);
  if (serviceRef.current === null) {
    serviceRef.current = new SimulationService();
  }
  const service = serviceRef.current;
  const pausedRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot>(() => service.getSnapshot());

  const refresh = useCallback(() => {
    const next = service.getSnapshot();
    pausedRef.current = next.status === "Paused";
    setSnapshot(next);
  }, [service]);

  useEffect(() => {
    let raf = 0;
    const loop = (ts: number) => {
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      if (last !== null && !pausedRef.current) {
        const realDt = Math.min(MAX_FRAME_DT, Math.max(0, (ts - last) / 1000));
        service.step(realDt);
        setSnapshot(service.getSnapshot());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [service]);

  return { snapshot, service, refresh };
}
