import { watch } from "../variable/graph.ts";
import { toText, type Cleanup } from "./bindings.ts";
import { mountBefore, removeNodes, type Mount } from "./blocks/mount.ts";

/** The value's nodes, parsed from a template so the page's scripts do not run while parsing. */
function parseHtml(html: string): DocumentFragment {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

/**
 * `<HTML>{expr}</HTML>`: the value is parsed as HTML. Each update replaces the previous nodes.
 * The value is trusted: never pass user input, or it can run script (XSS).
 */
export function bindHtml(marker: Node, read: () => unknown, cleanups: Cleanup[]): void {
  let mount: Mount | undefined;
  cleanups.push(
    watch(() => {
      if (mount) removeNodes(mount);
      mount = mountBefore(marker, parseHtml(toText(read())), [], []);
    }),
    () => {
      if (mount) removeNodes(mount);
    },
  );
}
