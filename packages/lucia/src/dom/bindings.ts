import { watch } from "../signal/graph.ts";

export type Cleanup = () => void;

export type Binder = (node: Node, cleanups: Cleanup[]) => void;

export function toText(value: unknown): string {
  return value == null || value === false ? "" : String(value);
}

export function bindText(marker: Node, read: () => unknown, cleanups: Cleanup[]): void {
  const node = document.createTextNode("");
  (marker as ChildNode).replaceWith(node);
  cleanups.push(watch(() => (node.data = toText(read()))));
}

/** Keep an attribute in sync with `read()`; null/false removes it. */
export function attr(el: Element, name: string, read: () => unknown, cleanups: Cleanup[]): void {
  cleanups.push(
    watch(() => {
      const value = read();
      if (value == null || value === false) el.removeAttribute(name);
      else el.setAttribute(name, value === true ? "" : String(value));
    }),
  );
}

export function listen(el: EventTarget, type: string, handler: EventListener, cleanups: Cleanup[]): void {
  el.addEventListener(type, handler);
  cleanups.push(() => el.removeEventListener(type, handler));
}

export function insert(parent: Node, node: Node, anchor: Node | null = null): void {
  parent.insertBefore(node, anchor);
}
