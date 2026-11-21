import { expressionOf } from "./scan/attributes.ts";
import type { AttrBinding, BindBinding } from "./types/attribute.ts";
import type { ComponentBind } from "./types/component.ts";
import type { Expr } from "./types/expression.ts";

export const BIND_NAME = /^bind-[a-z][a-z-]*$/;

/** Form tags where `bind-value` knows which property to use. */
export const FORM_TAGS: ReadonlySet<string> = new Set(["input", "textarea", "select"]);

export function isBindName(name: string): boolean {
  return name.startsWith("bind-");
}

export function bindBinding(name: string, expr: Expr): BindBinding {
  if (name === "bind-value") return { kind: "input", expr };
  const suffix = name.slice("bind-".length);
  if (suffix === "element") return { kind: "element", expr };
  return { kind: "prop", prop: toCamel(suffix), expr };
}

/** The prop a component attribute sets. `bind-value` sets `value`, as on a form field. `bind-<prop>` sets `<prop>`. */
export function componentPropName(name: string): string {
  if (name === "bind-value") return "value";
  if (name.startsWith("bind-")) return toCamel(name.slice("bind-".length));
  return name;
}

export function componentBindOf(name: string, expr: Expr): ComponentBind {
  return { prop: componentPropName(name), attr: name, expr };
}

/** The bind attributes of a component tag. Each one must already be checked as `{expr}`. */
export function componentBindsOf(attrs: AttrBinding[]): ComponentBind[] {
  return attrs
    .filter((attr) => isBindName(attr.name))
    .map((attr) => componentBindOf(attr.name, expressionOf(attr)!));
}

function toCamel(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
