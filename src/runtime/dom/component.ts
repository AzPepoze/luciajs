import type { Cleanup } from "./bindings.ts";
import { leaveThen, type Leave } from "./leave.ts";
import { injectStyle } from "./styles.ts";
import { runtimeError } from "../errors.ts";

export type Props = Record<string, () => unknown>;

export type SetupHook = (root: ParentNode) => unknown;

export interface Rendered {
  fragment: DocumentFragment;
  setup?: SetupHook;
}

export type Render = (cleanups: Cleanup[], leaves: Leave[]) => Rendered;

export interface Instance {
  root: Element;
  /** Resolves once the leave animations have finished and the nodes are removed. */
  detach(): Promise<void>;
}

export interface Component {
  (target: Element, props?: Props): Instance;
  readonly place: (parent: Node, anchor: Node | null, props: Props, leaves: Leave[]) => Cleanup;
}

let currentProps: Props | null = null;
let currentCleanups: Cleanup[] | null = null;

export function currentComponentProps(): Props {
  if (!currentProps) throw runtimeError("L2040");
  return currentProps;
}

/** The cleanups of the component being rendered, or null outside a component's script. */
export function currentComponentCleanups(): Cleanup[] | null {
  return currentCleanups;
}

function renderWith(render: Render, props: Props, cleanups: Cleanup[], leaves: Leave[]): Rendered {
  const previousProps = currentProps;
  const previousCleanups = currentCleanups;
  currentProps = props;
  currentCleanups = cleanups;
  try {
    return render(cleanups, leaves);
  } finally {
    currentProps = previousProps;
    currentCleanups = previousCleanups;
  }
}

function runSetup(setup: SetupHook | undefined, root: Node, cleanups: Cleanup[]): void {
  const cleanup = setup?.(root as ParentNode);
  if (typeof cleanup === "function") cleanups.push(cleanup as Cleanup);
}

export function defineComponent(id: string, css: string, render: Render): Component {
  function place(parent: Node, anchor: Node | null, props: Props, leaves: Leave[]): Cleanup {
    injectStyle(id, css);
    const cleanups: Cleanup[] = [];
    const { fragment, setup } = renderWith(render, props, cleanups, leaves);
    const nodes = [...fragment.childNodes];
    parent.insertBefore(fragment, anchor);
    runSetup(setup, parent, cleanups);
    return () => {
      for (const cleanup of cleanups) cleanup();
      for (const node of nodes) node.remove();
    };
  }
  const component = (target: Element, props: Props = {}): Instance => {
    const leaves: Leave[] = [];
    const remove = place(target, null, props, leaves);
    return { root: target, detach: () => leaveThen(leaves, remove) };
  };
  return Object.assign(component, { place });
}

/** A child's leave animations join the parent's list, so the parent waits for them too. */
export function bindComponent(
  marker: Node,
  component: Component,
  props: Props,
  cleanups: Cleanup[],
  leaves: Leave[],
): void {
  cleanups.push(component.place(marker.parentNode!, marker, props, leaves));
  (marker as ChildNode).remove();
}
