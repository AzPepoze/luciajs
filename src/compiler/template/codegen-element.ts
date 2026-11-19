import type { AttrBinding, AttrPart, BindBinding, ElementBinding, EventBinding } from "./types.ts";

export function readExpression(expr: string): string {
  return `__unwrap((${expr}))`;
}

export function attrValue(parts: AttrPart[]): string {
  const [only] = parts;
  if (parts.length === 0) return "true";
  if (parts.length === 1 && typeof only !== "string") return readExpression(only!.expr);
  const pieces = parts.map((part) =>
    typeof part === "string" ? JSON.stringify(part) : `__toText(${readExpression(part.expr)})`,
  );
  return pieces.join(" + ");
}

function attrCall({ name, parts }: AttrBinding): string {
  return `__attr(__node as Element, ${JSON.stringify(name)}, () => ${attrValue(parts)}, __cleanups);`;
}

function eventCall({ type, expr }: EventBinding): string {
  return `__listen(__node as Element, ${JSON.stringify(type)}, (${expr}), __cleanups);`;
}

function bindCall(bind: BindBinding): string {
  if (bind.kind === "input") return `__bindInput(__node as HTMLElement, (${bind.expr}), __cleanups);`;
  if (bind.kind === "prop") {
    return `__bindProp(__node as HTMLElement, ${JSON.stringify(bind.prop)}, (${bind.expr}), __cleanups);`;
  }
  return `__bindElement(__node as Element, (${bind.expr}), __cleanups);`;
}

function animateCall(expr: string): string {
  return `__animate(__node as HTMLElement, () => (${expr}), __cleanups, __leaves);`;
}

/** An object of getters, one per attribute: `{ "title": () => ... }`. */
export function getterObject(attrs: AttrBinding[]): string {
  const entries = attrs.map(({ name, parts }) => `${JSON.stringify(name)}: () => ${attrValue(parts)}`);
  return `{ ${entries.join(", ")} }`;
}

export function elementBinder(binding: ElementBinding): string {
  const calls = [
    ...binding.attrs.map(attrCall),
    ...binding.events.map(eventCall),
    ...binding.binds.map(bindCall),
  ];
  if (binding.animate !== undefined) calls.push(animateCall(binding.animate));
  return `(__node, __cleanups, __leaves) => {\n  ${calls.join("\n  ")}\n}`;
}
