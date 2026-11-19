/** What happens when a new play is asked for while one is still running. */
const MIDWAY_TURN: unique symbol = Symbol("TURN");
const FINISH: unique symbol = Symbol("FINISH");
const RESTART: unique symbol = Symbol("RESTART");
const SKIP: unique symbol = Symbol("SKIP");
const IGNORE: unique symbol = Symbol("IGNORE");

export const MIDWAY = Object.freeze({ TURN: MIDWAY_TURN, FINISH, RESTART, SKIP, IGNORE } as const);

export type MidwayMode = (typeof MIDWAY)[keyof typeof MIDWAY];

/** How the motion changes direction when a running play is turned around (MIDWAY.TURN and switches). */
const SUDDEN: unique symbol = Symbol("SUDDEN");
const SMOOTH: unique symbol = Symbol("SMOOTH");
const STOP: unique symbol = Symbol("STOP");

export const TURN = Object.freeze({ SUDDEN, SMOOTH, STOP } as const);

export type TurnMode = (typeof TURN)[keyof typeof TURN];

const MIDWAYS: ReadonlySet<unknown> = new Set<unknown>(Object.values(MIDWAY));
const TURNS: ReadonlySet<unknown> = new Set<unknown>(Object.values(TURN));

export function isMidwayMode(value: unknown): value is MidwayMode {
  return MIDWAYS.has(value);
}

export function isTurnMode(value: unknown): value is TurnMode {
  return TURNS.has(value);
}
