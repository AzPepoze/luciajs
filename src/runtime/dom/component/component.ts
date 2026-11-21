import type { Variable } from "../../variable/variable.ts";
import type { Cleanup } from "../template/bindings.ts";
import { leaveThen, type Leave } from "./leave.ts";
import { injectStyle } from "./styles.ts";
import { runtimeError } from "../../errors.ts";

export type Props = Record<string, () => unknown>;

/** The children a parent gave a component. `<CONTENT />` places them; they render in the parent's scope. */
export type Slot = (cleanups: Cleanup[], leaves: Leave[]) => DocumentFragment;

export type Bound = Record<string, Variable<unknown>>;

export interface Host {
  props: Props;
  bound: Bound;
  content?: Slot;
}

export type SetupHook = (root: ParentNode) => unknown;

export interface Rendered {
  fragment: DocumentFragment;
  setup?: SetupHook;
}

export type Render = (cleanups: Cleanup[], leaves: Leave[], host: Host) => Rendered;

export interface Instance {
  root: Element;
  /** Resolves once the leave animations have finished and the nodes are removed. */
  detach(): Promise<void>;
}

export interface Component {
  (target: Element, props?: Props): Instance;
  readonly place: (parent: Node, anchor: Node | null, host: Host, leaves: Leave[]) => Cleanup;
}

let currentHost: Host | null = null;
let currentCleanups: Cleanup[] | null = null;

export function currentComponentHost(): Host {
  if (!currentHost) throw runtimeError("L2040");
  return currentHost;
}

/** The cleanups of the component being rendered, or null outside a component's script. */
export function currentComponentCleanups(): Cleanup[] | null {
  return currentCleanups;
}

export function renderWith(
  render: Render,
  host: Host,
  cleanups: Cleanup[],
  leaves: Leave[],
): Rendered {
  const previousHost = currentHost;
  const previousCleanups = currentCleanups;
  currentHost = host;
  currentCleanups = cleanups;
  try {
    return render(cleanups, leaves, host);
  } finally {
    currentHost = previousHost;
    currentCleanups = previousCleanups;
  }
}

export function runSetup(setup: SetupHook | undefined, root: Node, cleanups: Cleanup[]): void {
  const cleanup = setup?.(root as ParentNode);
  if (typeof cleanup === "function") cleanups.push(cleanup as Cleanup);
}

export type Place = Component["place"];

/** Builds the callable form of a component from its `place`. Used by compiled components and by lazy. */
export function componentFrom(place: Place): Component {
  const component = (target: Element, props: Props = {}): Instance => {
    const leaves: Leave[] = [];
    const remove = place(target, null, { props, bound: {} }, leaves);
    return { root: target, detach: () => leaveThen(leaves, remove) };
  };
  return Object.assign(component, { place });
}

export function defineComponent(id: string, css: string, render: Render): Component {
  return componentFrom((parent, anchor, host, leaves) => {
    injectStyle(id, css);
    const cleanups: Cleanup[] = [];
    const { fragment, setup } = renderWith(render, host, cleanups, leaves);
    const nodes = [...fragment.childNodes];
    parent.insertBefore(fragment, anchor);
    runSetup(setup, parent, cleanups);
    return () => {
      for (const cleanup of cleanups) cleanup();
      for (const node of nodes) node.remove();
    };
  });
}

/** A child's leave animations join the parent's list, so the parent waits for them too. */
export function bindComponent(
  marker: Node,
  component: Component,
  props: Props,
  bound: Bound,
  cleanups: Cleanup[],
  leaves: Leave[],
  content?: Slot,
): void {
  cleanups.push(component.place(marker.parentNode!, marker, { props, bound, content }, leaves));
  (marker as ChildNode).remove();
}
