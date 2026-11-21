import { COMPONENT_ATTR, ELEMENT_MARKER, TEXT_MARKER } from "../../markers.ts";
import type { Binder, Cleanup } from "./bindings.ts";
import type { Leave } from "../component/leave.ts";

export interface CompiledTemplate {
  template: HTMLTemplateElement;
  /** Child-index path from the fragment root to each binding marker, in document order. */
  paths: number[][];
}

function isMarker(node: Node): boolean {
  if (node.nodeType === Node.COMMENT_NODE) return (node as Comment).data === TEXT_MARKER;
  return node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute(ELEMENT_MARKER);
}

function collectPaths(parent: Node, path: number[], paths: number[][]): void {
  parent.childNodes.forEach((child, index) => {
    const childPath = [...path, index];
    if (isMarker(child)) paths.push(childPath);
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    el.removeAttribute(ELEMENT_MARKER);
    collectPaths(el, childPath, paths);
  });
}

export function createTemplate(html: string, id: string): CompiledTemplate {
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const el of template.content.children) el.setAttribute(COMPONENT_ATTR, id);
  const paths: number[][] = [];
  collectPaths(template.content, [], paths);
  return { template, paths };
}

function resolvePath(root: Node, path: number[]): Node {
  let node = root;
  for (const index of path) node = node.childNodes[index]!;
  return node;
}

export function instantiate(
  { template, paths }: CompiledTemplate,
  binders: Binder[],
  cleanups: Cleanup[],
  leaves: Leave[],
): DocumentFragment {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const nodes = paths.map((path) => resolvePath(fragment, path));
  nodes.forEach((node, index) => binders[index]!(node, cleanups, leaves));
  return fragment;
}

export function lazyTemplate(html: string, id: string): () => CompiledTemplate {
  let compiled: CompiledTemplate | undefined;
  return () => (compiled ??= createTemplate(html, id));
}
