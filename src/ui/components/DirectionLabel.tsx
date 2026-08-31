import type { Direction } from "../types";

/** Text-presentation arrows so they stay glyphs, not emoji. */
export const ARROW_UP = "\u2191\uFE0E";
export const ARROW_DOWN = "\u2193\uFE0E";
export const ARROW_TO = "\u2192\uFE0E";

type Props = {
  direction: Direction;
  inheritColor?: boolean;
};

export function DirectionLabel({ direction, inheritColor = false }: Props) {
  const className = inheritColor ? "dir-label" : `dir-label dir-${direction}`;
  return (
    <span className={className} aria-label={direction}>
      {direction === "up" ? ARROW_UP : ARROW_DOWN}
    </span>
  );
}
