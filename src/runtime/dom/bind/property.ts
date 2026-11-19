import type { Cleanup } from "../bindings.ts";
import { bindChannel, type Channel } from "./channel.ts";
import { withWhere } from "../../errors.ts";

const identity = (value: unknown): unknown => value;

/** `bind-<prop>={sig}`: any DOM property, read on input and change. */
export function bindProp(el: HTMLElement, prop: string, target: unknown, cleanups: Cleanup[], where?: string): void {
  const channel: Channel = {
    prop,
    events: ["input", "change"],
    toDom: identity,
    fromDom: (node) => (node as unknown as Record<string, unknown>)[prop],
  };
  withWhere(where, () => bindChannel(el, target, channel, `bind-${prop}`, cleanups));
}
