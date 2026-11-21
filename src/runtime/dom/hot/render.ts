import type { Variable } from "../../variable/variable.ts";
import type { Cleanup } from "../template/bindings.ts";
import { renderWith, runSetup, type Rendered, type SetupHook } from "../component/component.ts";
import type { Leave } from "../component/leave.ts";
import { injectStyle } from "../component/styles.ts";
import type { Definition, HotInstance } from "./instance.ts";
import { removeRegion, runCleanups } from "./teardown.ts";

/** A render that has run but is not in the page yet. */
export interface Rendering {
  readonly fragment: DocumentFragment;
  readonly setup?: SetupHook;
  readonly start: Text;
  readonly end: Text;
  readonly cleanups: Cleanup[];
  readonly leaves: Leave[];
  readonly variables: Map<string, Variable<unknown>>;
}

export interface Frame {
  readonly instance: HotInstance;
  readonly variables: Map<string, Variable<unknown>>;
}

let frame: Frame | null = null;

/** The instance whose script is running, or null outside a component's script. */
export function currentFrame(): Frame | null {
  return frame;
}

function emptyText(): Text {
  return document.createTextNode("");
}

/** Runs the script and markup of one instance. Nothing is inserted; a failed render cleans up after itself. */
export function renderInstance(instance: HotInstance, definition: Definition): Rendering {
  injectStyle(instance.id, definition.css);
  const cleanups: Cleanup[] = [];
  const leaves: Leave[] = [];
  const variables = new Map<string, Variable<unknown>>();
  const previous = frame;
  frame = { instance, variables };
  try {
    const rendered: Rendered = renderWith(definition.render, instance.host, cleanups, leaves);
    const start = emptyText();
    const end = emptyText();
    rendered.fragment.prepend(start);
    rendered.fragment.append(end);
    return {
      fragment: rendered.fragment,
      setup: rendered.setup,
      start,
      end,
      cleanups,
      leaves,
      variables,
    };
  } catch (error) {
    runCleanups(cleanups);
    throw error;
  } finally {
    frame = previous;
  }
}

/** Inserts the nodes, then runs setup. If setup throws, the rendering is discarded and the error passes on. */
export function insertRendering(rendering: Rendering, parent: Node, anchor: Node | null): void {
  parent.insertBefore(rendering.fragment, anchor);
  try {
    runSetup(rendering.setup, parent, rendering.cleanups);
  } catch (error) {
    discardRendering(rendering);
    throw error;
  }
}

export function discardRendering(rendering: Rendering): void {
  runCleanups(rendering.cleanups);
  removeRegion(rendering.start, rendering.end);
}
