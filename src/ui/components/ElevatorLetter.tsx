import type { ElevatorId } from "../types";

export function ElevatorLetter({ id }: { id: ElevatorId }) {
  return <span className={`elevator-letter color-${id}`}>{id}</span>;
}
