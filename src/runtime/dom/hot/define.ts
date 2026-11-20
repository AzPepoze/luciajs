import type { Cleanup } from "../bindings.ts";
import type { Component, Host, Instance, Props, Render } from "../component.ts";
import { leaveThen, type Leave } from "../leave.ts";
import {
  createInstance,
  mountInstance,
  unmountInstance,
  type Definition,
  type HotInstance,
} from "./instance.ts";
import { definitionOf, setDefinition } from "./registry.ts";

export interface HotComponent extends Component {
  readonly id: string;
  readonly definition: Definition;
}

/**
 * The dev build's component. Instances look up the latest definition by file id, so a module that
 * was imported before a hot swap still renders the new code.
 */
export function hotComponent(id: string, css: string, render: Render): HotComponent {
  const definition: Definition = { css, render };
  if (!definitionOf(id)) setDefinition(id, definition);

  const place = (parent: Node, anchor: Node | null, host: Host, leaves: Leave[]): Cleanup => {
    const instance = mountComponent(id, host, leaves, parent, anchor);
    return () => unmountInstance(instance);
  };

  const component = (target: Element, props: Props = {}): Instance => {
    const leaves: Leave[] = [];
    const instance = mountComponent(id, { props }, leaves, target, null);
    return { root: target, detach: () => leaveThen(leaves, () => unmountInstance(instance)) };
  };

  return Object.assign(component, { id, definition, place });
}

function mountComponent(
  id: string,
  host: Host,
  parentLeaves: Leave[],
  parent: Node,
  anchor: Node | null,
): HotInstance {
  const instance = createInstance(id, host, parentLeaves);
  mountInstance(instance, definitionOf(id)!, parent, anchor);
  return instance;
}
