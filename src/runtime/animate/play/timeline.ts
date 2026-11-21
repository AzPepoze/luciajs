import type { EaseStyle } from "../modes/easing.ts";
import type { Ease } from "../modes/modes.ts";
import type { Interpolator } from "../value/interpolator.ts";
import { interpolate } from "../value/interpolate.ts";

/** One stretch between two keys. Its easing style belongs to the key it ends at. */
export interface Segment {
  start: number;
  end: number;
  easeStyle: EaseStyle;
  ease: Ease;
  values: Interpolator[];
  /** The raw start and end values, kept so a timeline can restart from the current look. */
  fromText: string[];
  toText: string[];
}

export interface Timeline {
  props: string[];
  segments: Segment[];
}

/** Writes the styles at timeline position `progress` (0..1). Runs every frame. */
export function writeProgress(
  style: CSSStyleDeclaration,
  { props, segments }: Timeline,
  progress: number,
): void {
  const segment = segmentAt(segments, progress);
  const local = (progress - segment.start) / (segment.end - segment.start);
  const eased = segment.ease(segment.easeStyle, local);
  for (let i = 0; i < props.length; i++) {
    style.setProperty(props[i]!, String(segment.values[i]!(eased)));
  }
}

// A property with no current value keeps its own start value.
export function startingFrom(timeline: Timeline, current: (prop: string) => string): Timeline {
  const [first, ...rest] = timeline.segments;
  const from = timeline.props.map((prop, i) => current(prop) || first!.fromText[i]!);
  const restart: Segment = {
    ...first!,
    values: timeline.props.map((_, i) => interpolate(from[i], first!.toText[i])),
    fromText: from,
  };
  return { props: timeline.props, segments: [restart, ...rest] };
}

export interface Phased {
  timeline: Timeline;
  detach: boolean;
}

// DETACH items never take a property from the enter items.
export function ownTimelines(items: Phased[]): Timeline[] {
  const owner = new Map<string, number>();
  items.forEach(({ timeline, detach }, index) =>
    timeline.props.forEach((prop) => owner.set(phasedKey(prop, detach), index)),
  );
  return items.map(({ timeline, detach }, index) =>
    keepProps(timeline, (prop) => owner.get(phasedKey(prop, detach)) === index),
  );
}

function phasedKey(prop: string, detach: boolean): string {
  return detach ? `detach:${prop}` : prop;
}

function keepProps(timeline: Timeline, keep: (prop: string) => boolean): Timeline {
  const indexes = timeline.props.flatMap((prop, index) => (keep(prop) ? [index] : []));
  return {
    props: indexes.map((index) => timeline.props[index]!),
    segments: timeline.segments.map((segment) => ({
      ...segment,
      values: indexes.map((index) => segment.values[index]!),
      fromText: indexes.map((index) => segment.fromText[index]!),
      toText: indexes.map((index) => segment.toText[index]!),
    })),
  };
}

function segmentAt(segments: Segment[], progress: number): Segment {
  for (const segment of segments) {
    if (progress <= segment.end) return segment;
  }
  return segments[segments.length - 1]!;
}
