export const TOTAL_FLOORS = 10;
export const FLOOR_HEIGHT = 66;
export const FLOOR_NUMBERS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const;

/** Vertical center of a car, measured from the top of the shaft. */
export function elevatorCenterY(position: number): number {
  return (TOTAL_FLOORS - position) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
}
