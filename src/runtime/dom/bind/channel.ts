import { watch } from "../../store/graph.ts";
import { isReactive, type Store } from "../../store/store.ts";
import { listen, type Cleanup } from "../bindings.ts";
import { runtimeError } from "../../errors.ts";

/** How one DOM property maps to a store: the value in each direction, and the events that report changes. */
export interface Channel {
  prop: string;
  events: string[];
  toDom(value: unknown): unknown;
  fromDom(el: HTMLElement): unknown;
}

export function assertWritable(target: unknown, attr: string): asserts target is Store<unknown> {
  const writable = isReactive(target) && Object.getOwnPropertyDescriptor(target, "value")?.set !== undefined;
  if (!writable) throw runtimeError("L2043", { attr });
}

function readProp(el: HTMLElement, prop: string): unknown {
  return (el as unknown as Record<string, unknown>)[prop];
}

function writeProp(el: HTMLElement, prop: string, value: unknown): void {
  (el as unknown as Record<string, unknown>)[prop] = value;
}

/** Store to DOM in a watch, DOM to store on the channel's events. Equal values are never written twice. */
export function bindChannel(el: HTMLElement, target: unknown, channel: Channel, attr: string, cleanups: Cleanup[]): void {
  assertWritable(target, attr);
  const store = target;
  cleanups.push(
    watch(() => {
      const next = channel.toDom(store.value);
      if (!Object.is(readProp(el, channel.prop), next)) writeProp(el, channel.prop, next);
    }),
  );
  const pull = (): void => {
    const next = channel.fromDom(el);
    if (!Object.is(next, store.peek())) store.value = next;
  };
  for (const type of channel.events) listen(el, type, pull, cleanups);
}
