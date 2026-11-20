import { listen, type Cleanup } from "../dom/bindings.ts";
import { isSwapping } from "../dom/hot/session.ts";
import type { Leave } from "../dom/leave.ts";
import { untrack, watch } from "../variable/graph.ts";
import { isReactive, unwrap } from "../variable/reactive.ts";
import type { Controller } from "./controller.ts";
import { Group } from "./group.ts";
import type { ItemOptions } from "./options.ts";
import { prefersReducedMotion, type Player } from "./player.ts";
import { sameMore, type ReadMore, type ScrollRead } from "./more.ts";
import { WHEN, isLayoutWhen, type When, type Source } from "./trigger.ts";
import { type ViewSettings } from "./view-options.ts";
import { watchScroll } from "./scroll.ts";
import { watchView } from "./view.ts";
import { bindHover } from "./hover.ts";
import { watchLayout } from "./layout.ts";
import { bindDetach } from "./shrink-space.ts";
import type { ShrinkSpec } from "./shrink-closer.ts";
import { layoutModeOf } from "./layout-mode.ts";
import type { GlideSpec } from "./layout-glide.ts";

/** The players that share one trigger, `once`, controller and more. A group is driven together. */
export interface Slot {
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  /** Set for the layout triggers, which glide the element. Each layout item has its own slot. */
  glide: GlideSpec | undefined;
  /** Set for a DETACH item that closes its space. Each such item has its own slot. */
  shrink: ShrinkSpec | undefined;
  /** True when a player in the group loops, so the group pauses off screen. */
  loops: boolean;
  group: Group;
}

interface Bucket {
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  glide: GlideSpec | undefined;
  shrink: ShrinkSpec | undefined;
  loops: boolean;
  players: Player[];
}

export function groupSlots(items: ItemOptions[], players: Player[], refresh: () => void): Slot[] {
  const buckets: Bucket[] = [];
  items.forEach((item, i) => addToBucket(buckets, item, players[i]!));
  return buckets.map(({ when, once, control, more, glide, shrink, loops, players: members }) => ({
    when,
    once,
    control,
    more,
    glide,
    shrink,
    loops,
    group: new Group(members, refresh),
  }));
}

function addToBucket(buckets: Bucket[], item: ItemOptions, player: Player): void {
  const bucket = bucketFor(buckets, item);
  bucket.players.push(player);
  if (item.timing.loop !== undefined) bucket.loops = true;
}

function bucketFor(buckets: Bucket[], item: ItemOptions): Bucket {
  const { when, once, control, more, shrink } = item;
  const glide = glideSpecOf(item);
  const found =
    glide || shrink
      ? undefined
      : buckets.find(
          (b) =>
            b.when === when && b.once === once && b.control === control && sameMore(b.more, more),
        );
  if (found) return found;
  const bucket: Bucket = { when, once, control, more, glide, shrink, loops: false, players: [] };
  buckets.push(bucket);
  return bucket;
}

/** The glide settings of a layout item. Other triggers have none. */
function glideSpecOf(item: ItemOptions): GlideSpec | undefined {
  if (!isLayoutWhen(item.when)) return undefined;
  return {
    mode: layoutModeOf(item.when),
    duration: item.timing.duration,
    delay: item.timing.delay,
    easing: item.keyframes.default,
  };
}

/** Starts what the slot's trigger asks for. MANUAL slots only move through a controller. */
export function bindTrigger(
  el: HTMLElement,
  { when, once, more, glide, shrink, loops, group }: Slot,
  cleanups: Cleanup[],
  leaves: Leave[],
): void {
  if (loops) cleanups.push(pauseOffScreen(el, group));
  if (isReactive(when)) bindSource(when, group, once, cleanups);
  else if (when === WHEN.ATTACH) attachTrigger(group);
  else if (when === WHEN.DETACH) bindDetach(el, group, shrink, leaves, cleanups);
  else if (when === WHEN.VIEW) bindView(el, more.view, group, once, cleanups);
  else if (when === WHEN.HOVER) bindHover(el, group, once, more.hover, cleanups);
  else if (when === WHEN.SCROLL) bindScroll(el, more.scroll, group, cleanups);
  else if (glide) cleanups.push(watchLayout(el, glide, once, () => void group.forward()));
}

// Loops start a little before they reach the screen, so they are running when it arrives.
const PAUSE_VIEW: ViewSettings = { rootMargin: "200px 0px", amount: 0 };

/** Looping items stop writing styles while their element is off screen. */
function pauseOffScreen(el: Element, group: Group): () => void {
  return watchView(el, PAUSE_VIEW, (inView) => group.setOffScreen(!inView));
}

/** A hot swap shows the end state at once, so the element does not play its entrance again. */
function attachTrigger(group: Group): void {
  if (isSwapping()) group.show(1);
  else void group.forward();
}

/** Scroll-linked: the group follows the element's place on screen. Reduced motion shows the end state. */
function bindScroll(el: HTMLElement, scroll: ScrollRead, group: Group, cleanups: Cleanup[]): void {
  if (prefersReducedMotion()) {
    group.show(1);
    return;
  }
  cleanups.push(watchScroll(el, group, scroll));
}

/** The first value is applied without animating. Later changes play forward or back from the current progress. */
function bindSource(source: Source, group: Group, once: boolean, cleanups: Cleanup[]): void {
  let started = false;
  let played = false;
  const applyLater = (on: boolean): void => {
    if (on) {
      if (once && played) return;
      played = true;
      void group.forward();
    } else if (!once) {
      void group.backward();
    }
  };
  const stop = watch(() => {
    const on = Boolean(unwrap(source));
    untrack(() => {
      if (!started) {
        played = on;
        group.show(on ? 1 : 0);
      } else {
        applyLater(on);
      }
    });
  });
  started = true;
  cleanups.push(stop);
}

function bindView(
  el: HTMLElement,
  view: ViewSettings,
  group: Group,
  once: boolean,
  cleanups: Cleanup[],
): void {
  const stop = watchView(el, view, (inView, unwatch) => {
    if (inView) {
      if (once) unwatch();
      void group.forward();
    } else if (!once) {
      void group.backward();
    }
  });
  cleanups.push(stop);
}
