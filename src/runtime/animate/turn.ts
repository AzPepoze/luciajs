import type { EaseStyle } from "./easing.ts";
import type { Ease } from "./modes.ts";
import { TURN } from "./midway-modes.ts";
import type { MidwayOptions } from "./midway-options.ts";

/** Gives the progress to show during a turn. `t` is ms since the switch, `speed` is progress per ms. */
export type TurnFn = (from: number, to: number, t: number, speed: number) => number;

/** A change of direction in progress. `age` is the ms since the switch. */
export interface Turn {
  kind: "smooth" | "stop" | "custom";
  from: number;
  speed: number;
  age: number;
  duration: number;
  easeStyle: EaseStyle;
  ease: Ease;
  custom: TurnFn | undefined;
}

/** The turn for a switch, or undefined for an instant switch. STOP takes half of `turnDuration`. */
export function startTurn(
  { turn, turnDuration, turnStyle, turnEase }: MidwayOptions,
  from: number,
  speed: number,
): Turn | undefined {
  if (turn === TURN.SUDDEN || turnDuration <= 0) return undefined;
  const base = { from, speed, age: 0, easeStyle: turnStyle, ease: turnEase, custom: undefined };
  if (typeof turn === "function") return { ...base, kind: "custom", duration: turnDuration, custom: turn };
  if (turn === TURN.STOP) return { ...base, kind: "stop", duration: turnDuration / 2 };
  return { ...base, kind: "smooth", duration: turnDuration };
}

/** The progress to show at `turn.age`, while the new play is at `playAt`. */
export function turnValue(turn: Turn, playAt: number): number {
  const { from, speed, age, duration } = turn;
  if (turn.custom) return turn.custom(from, playAt, age, speed);
  if (turn.kind === "stop") return from + speed * age - (speed * age * age) / (2 * duration);
  const old = from + speed * age;
  const weight = turn.ease(turn.easeStyle, Math.min(1, age / duration));
  return old + (playAt - old) * weight;
}
