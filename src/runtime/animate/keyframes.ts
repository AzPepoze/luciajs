import type { EaseStyle } from "./easing.ts";
import { animateDefault } from "./defaults.ts";
import { interpolate } from "./interpolate.ts";
import { readDefault, readKey, type DefaultEasing, type PartialEasing } from "./keyform.ts";
import type { Ease } from "./modes.ts";
import type { Segment, Timeline } from "./timeline.ts";
import { runtimeError } from "../errors.ts";
import { isKeyframesKey, KEYFRAMES_HINT, KEYFRAMES_NAME, unknownKeyValues } from "./keys.ts";

/** The string style properties of the DOM, in camelCase (opacity, backgroundColor). Methods and non-string properties are left out. */
type DomStyleKey = {
  [K in keyof CSSStyleDeclaration]: K extends string
    ? CSSStyleDeclaration[K] extends string
      ? K
      : never
    : never;
}[keyof CSSStyleDeclaration];

/** A CSS object: DOM style properties in camelCase, and custom properties that start with `--`. */
export type Style = {
  [K in Exclude<DomStyleKey, "cssText" | "cssFloat">]?: string | number;
} & { [custom: `--${string}`]: string | number };

/** A full key: its easing style, its ease and its styles. */
export type Keyframe = [EaseStyle, Ease, Style];
/** A key is its styles, or its styles with an ease, an easing style, or both. See keyform.ts. */
export type KeyframeValue = Style | [EaseStyle, Ease, Style] | [EaseStyle, Style] | [Ease, Style];
/** The keys 0 and 1 are required. `default` is the easing that keys without their own use. */
export type Keyframes = { default?: DefaultEasing; 0: KeyframeValue; 1: KeyframeValue } & Record<
  number,
  KeyframeValue
>;

interface Stop {
  at: number;
  easeStyle: EaseStyle;
  ease: Ease;
  style: Map<string, string>;
}

/** Validates the keys and precomputes every segment. Runs at each play, so the engine default is current. */
export function prepareTimeline(keyframes: Keyframes, probe?: HTMLElement): Timeline {
  const stops = readStops(keyframes, readDefault(keyframes.default));
  const props = propertyNames(stops);
  const values = stops.map((stop) => props.map((prop) => valueAt(stops, stop, prop)));
  return { props, segments: segmentsOf(stops, values, probe) };
}

function readStops(keyframes: Keyframes, fromKeyframes: PartialEasing): Stop[] {
  checkKeyNames(keyframes);
  const stops = Object.keys(keyframes)
    .filter((key) => key !== "default")
    .map((key) => toStop(Number(key), keyframes[Number(key)]!, fromKeyframes))
    .sort((a, b) => a.at - b.at);
  checkStops(stops);
  return stops;
}

function checkKeyNames(keyframes: Keyframes): void {
  for (const key of Object.keys(keyframes)) {
    if (!isKeyframesKey(key)) {
      const values = unknownKeyValues(key, [KEYFRAMES_NAME], KEYFRAMES_HINT);
      throw runtimeError("L2054", values, key);
    }
  }
}

function toStop(at: number, value: KeyframeValue, fromKeyframes: PartialEasing): Stop {
  const [easeStyle, ease, style] = readKey(value, fromKeyframes, animateDefault());
  const entries = Object.entries(style).map(
    ([name, value]) => [cssName(name), String(value)] as const,
  );
  return { at, easeStyle, ease, style: new Map(entries) };
}

function cssName(name: string): string {
  if (name.startsWith("--")) return name;
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function checkStops(stops: Stop[]): void {
  stops.forEach((stop, i) => {
    if (!(stop.at >= 0 && stop.at <= 1)) throw runtimeError("L2036", { at: String(stop.at) });
    if (i > 0 && stop.at === stops[i - 1]!.at) throw runtimeError("L2037", { at: String(stop.at) });
  });
  if (stops[0]?.at !== 0 || stops[stops.length - 1]?.at !== 1) {
    throw runtimeError("L2038");
  }
}

function propertyNames(stops: Stop[]): string[] {
  return [...new Set(stops.flatMap((stop) => [...stop.style.keys()]))];
}

function valueAt(stops: Stop[], stop: Stop, prop: string): string {
  return stop.style.get(prop) ?? nearestValue(stops, stop.at, prop);
}

/** A property missing from a key takes the value of the nearest key that sets it. */
function nearestValue(stops: Stop[], at: number, prop: string): string {
  let best = "";
  let bestDistance = Infinity;
  for (const other of stops) {
    const value = other.style.get(prop);
    const distance = Math.abs(other.at - at);
    if (value !== undefined && distance < bestDistance) {
      best = value;
      bestDistance = distance;
    }
  }
  return best;
}

function segmentsOf(stops: Stop[], values: string[][], probe: HTMLElement | undefined): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const to = stops[i + 1]!;
    const from = values[i]!;
    const end = values[i + 1]!;
    segments.push({
      start: stops[i]!.at,
      end: to.at,
      easeStyle: to.easeStyle,
      ease: to.ease,
      values: from.map((value, p) => interpolate(value, end[p], probe)),
      fromText: from,
      toText: end,
    });
  }
  return segments;
}
