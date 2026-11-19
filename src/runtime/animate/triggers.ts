import { listen, type Cleanup } from "../dom/bindings.ts";
import type { Leave } from "../dom/leave.ts";
import { untrack, watch } from "../store/graph.ts";
import { isReactive, unwrap } from "../store/store.ts";
import type { Controller } from "./controller.ts";
import { Group } from "./group.ts";
import type { ItemOptions } from "./options.ts";
import { prefersReducedMotion, type Player } from "./player.ts";
import { sameMore, type ReadMore, type ScrollRead } from "./more.ts";
import { WHEN, type When, type Source } from "./trigger.ts";
import { type ViewSettings } from "./view-options.ts";
import { watchScroll } from "./scroll.ts";
import { watchView } from "./view.ts";
import { bindHover } from "./hover.ts";

/** The players that share one trigger, `once`, controller and more. A group is driven together. */
export interface Slot {
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  group: Group;
}

interface Bucket {
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  players: Player[];
}

export function groupSlots(items: ItemOptions[], players: Player[], refresh: () => void): Slot[] {
  const buckets: Bucket[] = [];
  items.forEach((item, i) => bucketFor(buckets, item).players.push(players[i]!));
  return buckets.map(({ when, once, control, more, players: members }) => ({
    when,
    once,
    control,
    more,
    group: new Group(members, refresh),
  }));
}

function bucketFor(buckets: Bucket[], { when, once, control, more }: ItemOptions): Bucket {
  const found = buckets.find(
    (b) => b.when === when && b.once === once && b.control === control && sameMore(b.more, more),
  );
  if (found) return found;
  const bucket: Bucket = { when, once, control, more, players: [] };
  buckets.push(bucket);
  return bucket;
}

/** Starts what the slot's trigger asks for. MANUAL slots only move through a controller. */
export function bindTrigger(
  el: HTMLElement,
  { when, once, more, group }: Slot,
  cleanups: Cleanup[],
  leaves: Leave[],
): void {
  if (isReactive(when)) bindSource(when, group, once, cleanups);
  else if (when === WHEN.ATTACH) void group.forward();
  else if (when === WHEN.DETACH) leaves.push(() => group.forward());
  else if (when === WHEN.VIEW) bindView(el, more.view, group, once, cleanups);
  else if (when === WHEN.HOVER) bindHover(el, group, once, more.hover, cleanups);
  else if (when === WHEN.SCROLL) bindScroll(el, more.scroll, group, cleanups);
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
