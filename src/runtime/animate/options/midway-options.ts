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
import { runtimeError } from "../../errors.ts";
import { animateConfig } from "./config-store.ts";

/** The `midway` field of an item. A MIDWAY member alone sets `play` and keeps the other defaults. */
export interface MidwayItem {
  play?: MidwayMode;
  turn?: TurnMode | TurnFn;
  turnDuration?: number;
  turnStyle?: EaseStyle;
  turnEase?: Ease;
}

export type AnimateMidway = MidwayMode | MidwayItem;

export interface MidwayOptions {
  play: MidwayMode;
  turn: TurnMode | TurnFn;
  turnDuration: number;
  turnStyle: EaseStyle;
  turnEase: Ease;
}

export const MIDWAY_KEYS: readonly string[] = [
  "play",
  "turn",
  "turnDuration",
  "turnStyle",
  "turnEase",
];

/** The midway settings an item uses when it sets none: the config values, then the library ones. */
export function midwayDefault(): MidwayOptions {
  const midway = animateConfig().midway ?? {};
  return {
    play: midway.play ?? MIDWAY.TURN,
    turn: midway.turn ?? TURN.SUDDEN,
    turnDuration: midway.turnDuration ?? 200,
    turnStyle: midway.turnStyle ?? EASE.STYLE.CUBIC,
    turnEase: midway.turnEase ?? EASE.INOUT,
  };
}

export function readMidway(midway: AnimateMidway | undefined): MidwayOptions {
  if (midway === undefined) return midwayDefault();
  if (isMidwayMode(midway)) return { ...midwayDefault(), play: midway };
  if (typeof midway !== "object" || midway === null) {
    throw runtimeError("L2023", { value: String(midway) });
  }
  rejectUnknownKeys(midway);
  const base = midwayDefault();
  return {
    play: readPlay(midway.play ?? base.play),
    turn: readTurn(midway.turn ?? base.turn),
    turnDuration: readDuration(midway.turnDuration ?? base.turnDuration),
    turnStyle: readTurnStyle(midway.turnStyle ?? base.turnStyle),
    turnEase: readEase(midway.turnEase ?? base.turnEase),
  };
}

function rejectUnknownKeys(midway: object): void {
  for (const key of Object.keys(midway)) {
    if (!MIDWAY_KEYS.includes(key)) {
      throw runtimeError("L2024", { key });
    }
  }
}

function readPlay(play: MidwayMode): MidwayMode {
  if (!isMidwayMode(play)) throw runtimeError("L2025", { value: String(play) });
  return play;
}

function readTurn(turn: TurnMode | TurnFn): TurnMode | TurnFn {
  if (typeof turn === "function" || isTurnMode(turn)) return turn;
  throw runtimeError("L2026", { value: String(turn) });
}

function readDuration(turnDuration: number): number {
  if (!Number.isFinite(turnDuration) || turnDuration < 0) {
    throw runtimeError("L2027", { value: String(turnDuration) });
  }
  return turnDuration;
}

function readTurnStyle(turnStyle: EaseStyle): EaseStyle {
  if (typeof turnStyle !== "function") {
    throw runtimeError("L2028", { value: String(turnStyle) });
  }
  return turnStyle;
}

function readEase(turnEase: Ease): Ease {
  if (!isEase(turnEase)) throw runtimeError("L2029", { value: String(turnEase) });
  return turnEase;
}
