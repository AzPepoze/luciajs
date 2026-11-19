import { expressionOf, formatStaticAttr, hasExpression } from "./attributes.ts";
import { bindBinding, isBindName } from "./bind.ts";
import { eventType, isEventAttr } from "./events.ts";
import type { AttrBinding, ElementBinding } from "./types.ts";

const ANIMATE = "animate";

export interface CompiledElement {
  /** Static attributes as HTML, each with a leading space. */
  statics: string;
  /** Present only when the element has something to wire at attach. */
  binding?: ElementBinding;
}

/** Splits an element's attributes into static HTML and one binding for everything dynamic. */
export function compileElement(attrs: AttrBinding[]): CompiledElement {
  const binding: ElementBinding = { kind: "element", attrs: [], events: [], binds: [] };
  let statics = "";
  for (const attr of attrs) {
    if (hasExpression(attr.parts)) addDynamic(binding, attr);
    else statics += ` ${formatStaticAttr(attr)}`;
  }
  const dynamic = binding.attrs.length + binding.events.length + binding.binds.length;
  const hasAnimate = binding.animate !== undefined;
  return dynamic > 0 || hasAnimate ? { statics, binding } : { statics };
}

function addDynamic(binding: ElementBinding, attr: AttrBinding): void {
  const expr = expressionOf(attr);
  if (attr.name === ANIMATE) binding.animate = expr;
  else if (isEventAttr(attr)) binding.events.push({ type: eventType(attr.name), expr: expr! });
  else if (isBindName(attr.name)) binding.binds.push(bindBinding(attr.name, expr!));
  else binding.attrs.push(attr);
}
