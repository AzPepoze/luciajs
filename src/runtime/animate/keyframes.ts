import type { Transition } from "./easing.ts";
import { interpolate } from "./interpolate.ts";
import { readKey, type Curve } from "./keyform.ts";
import type { Ease } from "./modes.ts";
import type { Segment, Timeline } from "./timeline.ts";

export type Style = Record<string, string | number>;
/** A full key: its transition, its ease and its styles. */
export type Keyframe = [Transition, Ease, Style];
/** A key may be just its styles, or it may set its own transition and/or ease. See keyform.ts. */
export type KeyframeValue = Style | [Transition, Ease, Style] | [Transition, Style] | [Ease, Style];
export type Keyframes = Record<number, KeyframeValue>;

interface Stop {
  at: number;
  transition: Transition;
  ease: Ease;
  style: Map<string, string>;
}

/** Validates the keys and precomputes every segment. Runs once per element. */
export function prepareTimeline(keyframes: Keyframes, curve: Curve, probe?: HTMLElement): Timeline {
  const stops = readStops(keyframes, curve);
  const props = propertyNames(stops);
  const values = stops.map((stop) => props.map((prop) => valueAt(stops, stop, prop)));
  return { props, segments: segmentsOf(stops, values, probe) };
}

function readStops(keyframes: Keyframes, curve: Curve): Stop[] {
  const stops = Object.keys(keyframes)
    .map((key) => toStop(Number(key), keyframes[Number(key)]!, curve))
    .sort((a, b) => a.at - b.at);
  checkStops(stops);
  return stops;
}

function toStop(at: number, value: KeyframeValue, curve: Curve): Stop {
  const [transition, ease, style] = readKey(value, curve);
  const entries = Object.entries(style).map(([name, value]) => [cssName(name), String(value)] as const);
  return { at, transition, ease, style: new Map(entries) };
}

function cssName(name: string): string {
  if (name.startsWith("--")) return name;
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function checkStops(stops: Stop[]): void {
  stops.forEach((stop, i) => {
    if (!(stop.at >= 0 && stop.at <= 1)) throw new Error(`animate keyframe ${stop.at} is outside 0..1`);
    if (i > 0 && stop.at === stops[i - 1]!.at) throw new Error(`animate keyframe ${stop.at} is listed twice`);
  });
  if (stops[0]?.at !== 0 || stops[stops.length - 1]?.at !== 1) {
    throw new Error("animate keyframes must include the keys 0 and 1");
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
      transition: to.transition,
      ease: to.ease,
      values: from.map((value, p) => interpolate(value, end[p], probe)),
      fromText: from,
      toText: end,
    });
  }
  return segments;
}
