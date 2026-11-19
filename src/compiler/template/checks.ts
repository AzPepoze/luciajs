import { checkAnimateAttribute } from "./animate.ts";
import { expressionOf, hasExpression, type AttrCheck, type Fail } from "./attributes.ts";
import { BIND_NAME, FORM_TAGS, isBindName } from "./bind.ts";
import { isEventName } from "./events.ts";
import type { AttrBinding } from "./types.ts";

export type AttrKind = "expression" | "identifier";

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function checkBind(tag: string, attr: AttrBinding, fail: Fail): void {
  if (!BIND_NAME.test(attr.name)) fail("bind-<property> needs a property name, like bind-value");
  if (expressionOf(attr) === undefined) fail(`${attr.name} needs {store}`);
  if (attr.name === "bind" && !FORM_TAGS.has(tag)) fail("bind works on input, textarea and select; use bind-<property>");
}

/** Elements: `bind`, `animate` and dynamic events each need exactly one {expression}. */
export function elementCheck(tag: string): AttrCheck {
  return (attr, previous, fail) => {
    checkAnimateAttribute(attr, previous, fail);
    if (isBindName(attr.name)) checkBind(tag, attr, fail);
    else if (isEventName(attr.name) && hasExpression(attr.parts) && expressionOf(attr) === undefined) {
      fail(`${attr.name} needs one {handler}`);
    }
  };
}

/** Components pass `onX={fn}` as a prop, so only `bind` is refused. */
export const componentCheck: AttrCheck = (attr, _previous, fail) => {
  if (isBindName(attr.name)) fail("bind works on elements only");
};

/** Control-flow tags accept only the attributes in `kinds`, each in the form its kind names. */
export function blockCheck(tag: string, kinds: ReadonlyMap<string, AttrKind>): AttrCheck {
  return (attr, previous, fail) => {
    const kind = kinds.get(attr.name);
    if (!kind) fail(kinds.size === 0 ? `${tag} takes no attributes` : `${tag} has no ${attr.name} attribute`);
    if (previous.some((other) => other.name === attr.name)) fail(`${attr.name} is given twice`);
    if (kind === "identifier") checkIdentifier(attr, fail);
    else if (expressionOf(attr) === undefined) fail(`${attr.name} needs {expression}`);
  };
}

function checkIdentifier(attr: AttrBinding, fail: Fail): void {
  const expr = expressionOf(attr);
  if (expr === undefined || !IDENTIFIER.test(expr)) fail(`${attr.name} needs a name in {}, like ${attr.name}={item}`);
}
