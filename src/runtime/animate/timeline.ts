import type { Transition } from "./easing.ts";
import type { Ease } from "./modes.ts";
import type { Interpolator } from "./interpolator.ts";
import { interpolate } from "./interpolate.ts";

/** One stretch between two keys. Its curve belongs to the key it ends at. */
export interface Segment {
  start: number;
  end: number;
  transition: Transition;
  ease: Ease;
  /** One per entry in `Timeline.props`. */
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
export function writeProgress(style: CSSStyleDeclaration, { props, segments }: Timeline, progress: number): void {
  const segment = segmentAt(segments, progress);
  const local = (progress - segment.start) / (segment.end - segment.start);
  const eased = segment.ease(segment.transition, local);
  for (let i = 0; i < props.length; i++) {
    style.setProperty(props[i]!, String(segment.values[i]!(eased)));
  }
}

/**
 * The same timeline, but the first segment starts from the values `current` reads now. A
 * property with no current value keeps its own start value.
 */
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

/** Each property belongs to the last timeline that animates it, so later items win per property. */
export function ownTimelines(timelines: Timeline[]): Timeline[] {
  const owner = new Map<string, number>();
  timelines.forEach((timeline, index) => timeline.props.forEach((prop) => owner.set(prop, index)));
  return timelines.map((timeline, index) => keepProps(timeline, (prop) => owner.get(prop) === index));
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
