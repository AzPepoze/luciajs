import type { ModuleChange } from "@bun-plugin/change.ts";

export interface StyleUpdate {
  id: string;
  css: string;
}

export type Update = { kind: "reload" } | { kind: "styles"; styles: StyleUpdate[] };

export const RELOAD: Update = { kind: "reload" };

const STYLE_FILE = /\.(lucia|scss|sass)$/;

/**
 * A css swap is safe only when every changed file is a style file and no component's
 * script or markup changed. Anything else reloads the page.
 */
export function chooseUpdate(files: string[], changes: ModuleChange[]): Update {
  if (files.length === 0 || !files.every(isStyleFile)) return RELOAD;
  const styles: StyleUpdate[] = [];
  for (const change of changes) {
    if (change.kind === "code") return RELOAD;
    styles.push({ id: change.id, css: change.css });
  }
  return { kind: "styles", styles };
}

export function describeUpdate(update: Update): string {
  return update.kind === "reload" ? "reload" : "css swap";
}

function isStyleFile(file: string): boolean {
  return STYLE_FILE.test(file);
}
