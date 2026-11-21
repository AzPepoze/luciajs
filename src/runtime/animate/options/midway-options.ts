import type { EaseStyle } from "../modes/easing.ts";
import { EASE, isEase, type Ease } from "../modes/modes.ts";
import {
  isMidwayMode,
  isTurnMode,
  MIDWAY,
  TURN,
  type MidwayMode,
  type TurnMode,
} from "../modes/midway-modes.ts";
import type { TurnFn } from "../play/turn.ts";
import { runtimeError } from "@runtime/errors.ts";

/** The `midway` field of an item. A MIDWAY member alone sets `play` and keeps the other defaults. */
export interface MidwayItem {
  play?: MidwayMode;
  turn?: TurnMode | TurnFn;
  turnDuration?: number;
  turnStyle?: EaseStyle;
  turnEase?: Ease;
}

export type AnimateMidway = MidwayMode | MidwayItem;

/** The checked midway options of one item. */
export interface MidwayOptions {
  play: MidwayMode;
  turn: TurnMode | TurnFn;
  turnDuration: number;
  turnStyle: EaseStyle;
  turnEase: Ease;
}

export const DEFAULT_MIDWAY: MidwayOptions = Object.freeze({
  play: MIDWAY.TURN,
  turn: TURN.SUDDEN,
  turnDuration: 200,
  turnStyle: EASE.STYLE.CUBIC,
  turnEase: EASE.INOUT,
});

const MIDWAY_KEYS = ["play", "turn", "turnDuration", "turnStyle", "turnEase"];

export function readMidway(midway: AnimateMidway | undefined): MidwayOptions {
  if (midway === undefined) return DEFAULT_MIDWAY;
  if (isMidwayMode(midway)) return { ...DEFAULT_MIDWAY, play: midway };
  if (typeof midway !== "object" || midway === null) {
    throw runtimeError("L2023", { value: String(midway) });
  }
  rejectUnknownKeys(midway);
  return {
    play: readPlay(midway.play),
    turn: readTurn(midway.turn),
    turnDuration: readDuration(midway.turnDuration),
    turnStyle: readTurnStyle(midway.turnStyle),
    turnEase: readEase(midway.turnEase),
  };
}

function rejectUnknownKeys(midway: object): void {
  for (const key of Object.keys(midway)) {
    if (!MIDWAY_KEYS.includes(key)) {
      throw runtimeError("L2024", { key });
    }
  }
}

function readPlay(play: MidwayMode | undefined): MidwayMode {
  if (play === undefined) return DEFAULT_MIDWAY.play;
  if (!isMidwayMode(play)) throw runtimeError("L2025", { value: String(play) });
  return play;
}

function readTurn(turn: TurnMode | TurnFn | undefined): TurnMode | TurnFn {
  if (turn === undefined) return DEFAULT_MIDWAY.turn;
  if (typeof turn === "function" || isTurnMode(turn)) return turn;
  throw runtimeError("L2026", { value: String(turn) });
}

function readDuration(turnDuration: number | undefined): number {
  if (turnDuration === undefined) return DEFAULT_MIDWAY.turnDuration;
  if (!Number.isFinite(turnDuration) || turnDuration < 0) {
    throw runtimeError("L2027", { value: String(turnDuration) });
  }
  return turnDuration;
}

function readTurnStyle(turnStyle: EaseStyle | undefined): EaseStyle {
  if (turnStyle === undefined) return DEFAULT_MIDWAY.turnStyle;
  if (typeof turnStyle !== "function") {
    throw runtimeError("L2028", { value: String(turnStyle) });
  }
  return turnStyle;
}

function readEase(turnEase: Ease | undefined): Ease {
  if (turnEase === undefined) return DEFAULT_MIDWAY.turnEase;
  if (!isEase(turnEase)) throw runtimeError("L2029", { value: String(turnEase) });
  return turnEase;
}
