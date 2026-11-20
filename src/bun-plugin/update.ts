import type { CachedModule } from "./cache.ts";

export type ModuleUpdate =
  { path: string; kind: "code" } | { path: string; kind: "style"; id: string; css: string };

/** Compares a fresh compile with the previous one. Null when the output is the same. */
export function moduleUpdate(
  path: string,
  previous: CachedModule | undefined,
  next: CachedModule,
): ModuleUpdate | null {
  if (!previous || previous.scriptAndMarkup !== next.scriptAndMarkup) return { path, kind: "code" };
  if (previous.css === next.css) return null;
  return { path, kind: "style", id: next.id, css: next.css };
}
