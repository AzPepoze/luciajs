import type { BindBinding } from "./types.ts";

export const BIND_NAME = /^bind(-[a-z][a-z-]*)?$/;

/** Form tags where a plain `bind` knows which property to use. */
export const FORM_TAGS: ReadonlySet<string> = new Set(["input", "textarea", "select"]);

export function isBindName(name: string): boolean {
  return name === "bind" || name.startsWith("bind-");
}

export function bindBinding(name: string, expr: string): BindBinding {
  if (name === "bind") return { kind: "input", expr };
  const suffix = name.slice("bind-".length);
  if (suffix === "element") return { kind: "element", expr };
  return { kind: "prop", prop: toCamel(suffix), expr };
}

function toCamel(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
