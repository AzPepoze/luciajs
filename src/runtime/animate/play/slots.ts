import type { Controller } from "./controller.ts";
import { Group } from "./group.ts";
import type { ItemOptions } from "../options/options.ts";
import type { Player } from "./player.ts";
import type { ReadMore } from "../options/trigger-options.ts";
import { sameMore } from "../options/trigger-options.ts";
import { isLayoutWhen, type When, type Source } from "../modes/trigger.ts";
import { layoutModeOf } from "../modes/layout-mode.ts";
import type { GlideSpec } from "../layout/layout-glide.ts";
import type { SpaceSpec } from "../layout/space/space-closer.ts";

/** The players that share one trigger, `once`, controller and more. A group is driven together. */
export interface Slot {
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  /** Set for the layout triggers, which glide the element. Each layout item has its own slot. */
  glide: GlideSpec | undefined;
  /** Set for an item that moves its siblings with `animateSpace`. Each such item has its own slot. */
  space: SpaceSpec | undefined;
  loops: boolean;
  group: Group;
}

interface Bucket {
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  glide: GlideSpec | undefined;
  space: SpaceSpec | undefined;
  loops: boolean;
  players: Player[];
}

export function groupSlots(items: ItemOptions[], players: Player[], refresh: () => void): Slot[] {
  const buckets: Bucket[] = [];
  items.forEach((item, i) => addToBucket(buckets, item, players[i]!));
  return buckets.map(({ when, once, control, more, glide, space, loops, players: members }) => ({
    when,
    once,
    control,
    more,
    glide,
    space,
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
  const { when, once, control, more, space } = item;
  const glide = glideSpecOf(item);
  const found =
    glide || space
      ? undefined
      : buckets.find(
          (b) =>
            b.when === when && b.once === once && b.control === control && sameMore(b.more, more),
        );
  if (found) return found;
  const bucket: Bucket = { when, once, control, more, glide, space, loops: false, players: [] };
  buckets.push(bucket);
  return bucket;
}

function glideSpecOf(item: ItemOptions): GlideSpec | undefined {
  if (!isLayoutWhen(item.when)) return undefined;
  return {
    mode: layoutModeOf(item.when),
    duration: item.timing.duration,
    delay: item.timing.delay,
    easing: item.keyframes.default,
  };
}
