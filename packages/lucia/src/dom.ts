import { watch } from "./signal.ts";

export interface Instance {
  root: Element;
  destroy(): void;
}

export type Component = (target: Element) => Instance;

type Cleanup = () => void;

export function text(read: () => unknown, cleanups: Cleanup[]): Text {
  const node = document.createTextNode("");
  cleanups.push(watch(() => (node.data = String(read() ?? ""))));
  return node;
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

export function mount(component: Component, target: Element): Instance {
  return component(target);
}

const injectedStyles = new Set<string>();

export function injectStyle(id: string, css: string): void {
  if (!css || injectedStyles.has(id)) return;
  injectedStyles.add(id);
  const style = document.createElement("style");
  style.dataset.lucia = id;
  style.textContent = css;
  document.head.appendChild(style);
}
