import { ELEMENT_MARKER, TEXT_MARKER } from "./markers.ts";
import { watch } from "./signal.ts";

export interface Instance {
  root: Element;
  detach(): void;
}

export type Component = (target: Element) => Instance;

export type Cleanup = () => void;

export type Binder = (node: Node, cleanups: Cleanup[]) => void;

export interface CompiledTemplate {
  template: HTMLTemplateElement;
  /** Child-index path from the fragment root to each binding marker, in document order. */
  paths: number[][];
}

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

export function attach(component: Component, target: Element): Instance {
  return component(target);
}

function isMarker(node: Node): boolean {
  if (node.nodeType === Node.COMMENT_NODE) return (node as Comment).data === TEXT_MARKER;
  return node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute(ELEMENT_MARKER);
}

function collectPaths(parent: Node, scope: string, path: number[], paths: number[][]): void {
  parent.childNodes.forEach((child, index) => {
    const childPath = [...path, index];
    if (isMarker(child)) paths.push(childPath);
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    el.setAttribute(scope, "");
    el.removeAttribute(ELEMENT_MARKER);
    collectPaths(el, scope, childPath, paths);
  });
}

/** Parse markup once, scope its elements and record where the bindings go. */
export function createTemplate(html: string, scope: string): CompiledTemplate {
  const template = document.createElement("template");
  template.innerHTML = html;
  const paths: number[][] = [];
  collectPaths(template.content, scope, [], paths);
  return { template, paths };
}

function resolvePath(root: Node, path: number[]): Node {
  let node = root;
  for (const index of path) node = node.childNodes[index]!;
  return node;
}

/** Clone the template and run each binder on its node. */
export function instantiate({ template, paths }: CompiledTemplate, binders: Binder[], cleanups: Cleanup[]): DocumentFragment {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const nodes = paths.map((path) => resolvePath(fragment, path));
  nodes.forEach((node, index) => binders[index]!(node, cleanups));
  return fragment;
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
