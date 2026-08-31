export type Rng = () => number;

export function defaultRng(): number {
  return Math.random();
}

/** Inclusive integer in `[min, max]`. */
export function randomInt(rng: Rng, min: number, max: number): number {
  const span = max - min + 1;
  const index = Math.min(span - 1, Math.floor(rng() * span));
  return min + index;
}

export function pickOne<T>(rng: Rng, items: T[]): T {
  return items[randomInt(rng, 0, items.length - 1)]!;
}
