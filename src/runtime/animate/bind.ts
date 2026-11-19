import type { Cleanup } from "../dom/bindings.ts";
import type { Leave } from "../dom/leave.ts";
import { itemsOf, type Animate } from "./animation.ts";
import { prepareTimeline } from "./keyframes.ts";
import { readItem } from "./options.ts";
import { Player } from "./player.ts";
import { ownTimelines } from "./timeline.ts";
import { bindTrigger, groupSlots } from "./triggers.ts";

/** Compiled `animate={...}`. The value is read again at every play, so keyframes can come from stores. */
export function animate(el: HTMLElement, readValue: () => Animate, cleanups: Cleanup[], leaves: Leave[]): void {
  const first = itemsOf(readValue()).map(readItem);
  const players = first.map(() => new Player(el.style));
  const reload = (): void => loadTimelines(el, readValue, players);
  reload();
  const slots = groupSlots(first, players, reload);
  for (const slot of slots) slot.group.show(0);
  cleanups.push(() => slots.forEach((slot) => slot.group.cancel()));
  for (const slot of slots) {
    if (slot.control) cleanups.push(slot.control.attach(slot.group));
    bindTrigger(el, slot, cleanups, leaves);
  }
}

function loadTimelines(el: HTMLElement, readValue: () => Animate, players: Player[]): void {
  const items = itemsOf(readValue()).map(readItem);
  if (items.length !== players.length) throw new Error("animate list changed length after it was attached");
  const timelines = ownTimelines(items.map((item) => prepareTimeline(item.keyframes, item.curve, el)));
  players.forEach((player, i) => player.load(timelines[i]!, items[i]!.timing));
}
