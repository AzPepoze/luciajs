import type { Cleanup } from "../dom/bindings.ts";
import type { Leave } from "../dom/leave.ts";
import { itemsOf, type Animate } from "./animation.ts";
import { prepareTimeline } from "./keyframes.ts";
import { readItem } from "./options.ts";
import { Player } from "./player.ts";
import { ownTimelines } from "./timeline.ts";
import { WHEN } from "./trigger.ts";
import { bindTrigger, groupSlots, type Slot } from "./triggers.ts";
import { runtimeError, withWhere, type KeyWheres } from "../errors.ts";

/** Compiled `animate={...}`. The value is read again at every play, so keyframes can come from variables. */
export function animate(
  el: HTMLElement,
  readValue: () => Animate,
  cleanups: Cleanup[],
  leaves: Leave[],
  where?: string,
  keys?: KeyWheres,
): void {
  const first = withWhere(where, () => itemsOf(readValue()).map(readItem), keys);
  const players = first.map(() => new Player(el.style));
  const reload = (): void => withWhere(where, () => loadTimelines(el, readValue, players), keys);
  reload();
  const slots = groupSlots(first, players, reload);
  for (const slot of startOrder(slots)) slot.group.show(0);
  cleanups.push(() => slots.forEach((slot) => slot.group.cancel()));
  for (const slot of slots) {
    if (slot.control) cleanups.push(slot.control.attach(slot.group));
    bindTrigger(el, slot, cleanups, leaves);
  }
}

function loadTimelines(el: HTMLElement, readValue: () => Animate, players: Player[]): void {
  const items = itemsOf(readValue()).map(readItem);
  if (items.length !== players.length) throw runtimeError("L2039");
  const timelines = ownTimelines(
    items.map((item) => ({
      timeline: prepareTimeline(item.keyframes, el),
      detach: item.when === WHEN.DETACH,
    })),
  );
  players.forEach((player, i) => player.load(timelines[i]!, items[i]!.timing));
}

/** DETACH slots write their start first, so an enter item's start values win on a shared property. */
function startOrder(slots: Slot[]): Slot[] {
  const detach = slots.filter((slot) => slot.when === WHEN.DETACH);
  return [...detach, ...slots.filter((slot) => slot.when !== WHEN.DETACH)];
}
