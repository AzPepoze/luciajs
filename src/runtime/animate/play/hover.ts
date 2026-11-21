import { listen, type Cleanup } from "../../dom/bindings.ts";
import { prepareTimeline } from "../options/keyframes.ts";
import type { Group } from "./group.ts";
import type { HoverRead } from "../options/hover-options.ts";
import type { Timing } from "../options/options.ts";
import { DEFAULT_MIDWAY } from "../options/midway-options.ts";
import { Player } from "./player.ts";

interface HoverState {
  /** True between enter and leave. Touch toggles it, so it is the single source of truth. */
  inside: boolean;
  /** True once the item has been entered at least once. `once` uses it. */
  entered: boolean;
  /** A play waiting for its delay: "in" after enter, "out" after leave. */
  pending: "in" | "out" | undefined;
  timer: ReturnType<typeof setTimeout> | undefined;
}

/** Mouse, keyboard and touch on WHEN.HOVER. Touch and keyboard use their own events. */
export function bindHover(
  el: HTMLElement,
  group: Group,
  once: boolean,
  hover: HoverRead,
  cleanups: Cleanup[],
): void {
  const state: HoverState = { inside: false, entered: false, pending: undefined, timer: undefined };
  const outPlayer = hover.out ? outPlayerFor(el, hover.out) : undefined;
  const cancel = (): void => cancelPending(state);
  const playIn = (): void => {
    if (outPlayer) {
      outPlayer.cancel();
      void group.forwardFromCurrent();
    } else {
      void group.forward();
    }
  };
  const playOut = (): void => {
    if (outPlayer) {
      group.cancel();
      outPlayer.startFromCurrent();
      void outPlayer.forward();
    } else {
      void group.backward();
    }
  };
  const enter = (): void => {
    cancel();
    if (once && state.entered) return;
    state.inside = true;
    state.entered = true;
    after(state, hover.inDelay, "in", playIn);
  };
  const leave = (): void => {
    if (!state.inside) return;
    state.inside = false;
    const playedIn = state.pending !== "in";
    cancel();
    if (playedIn && !once) after(state, hover.outDelay, "out", playOut);
  };

  listen(
    el,
    "pointerenter",
    (event) => {
      if (!isTouch(event)) enter();
    },
    cleanups,
  );
  listen(
    el,
    "pointerleave",
    (event) => {
      if (!isTouch(event)) leave();
    },
    cleanups,
  );
  listen(
    el,
    "pointerdown",
    (event) => {
      if (!isTouch(event)) return;
      if (state.inside) leave();
      else enter();
    },
    cleanups,
  );
  listen(
    document,
    "pointerdown",
    (event) => {
      if (isTouch(event) && state.inside && !el.contains(event.target as Node)) leave();
    },
    cleanups,
  );
  listen(el, "focusin", enter, cleanups);
  listen(el, "focusout", leave, cleanups);
  cleanups.push(() => {
    cancel();
    outPlayer?.cancel();
  });
}

/** A delay of 0 plays at once, so the play is synchronous unless the item asks to wait. */
function after(state: HoverState, delay: number, kind: "in" | "out", play: () => void): void {
  if (delay <= 0) return play();
  state.pending = kind;
  state.timer = setTimeout(() => {
    state.pending = undefined;
    play();
  }, delay);
}

function cancelPending(state: HoverState): void {
  clearTimeout(state.timer);
  state.timer = undefined;
  state.pending = undefined;
}

function isTouch(event: Event): boolean {
  return (event as PointerEvent).pointerType === "touch";
}

function outPlayerFor(el: HTMLElement, out: NonNullable<HoverRead["out"]>): Player {
  const timing: Timing = {
    duration: out.duration,
    delay: 0,
    loop: undefined,
    keep: true,
    midway: DEFAULT_MIDWAY,
  };
  const player = new Player(el.style);
  player.load(prepareTimeline(out.keyframes, el), timing);
  return player;
}
