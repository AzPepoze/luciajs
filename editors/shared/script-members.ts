import type { CompletionItemData } from "./completion-data.ts";
import { receiverAt, variableKinds } from "./locals.ts";
import { memberItems, namespaceMemberItems } from "./members.ts";

/**
 * The members of `variable.` or of a known variable name before a `.`, if the receiver is one.
 * `text` is where the receiver sits; `script` is where its declaration is.
 */
export function scriptMemberItems(
  script: string,
  offset: number,
  text = script,
): CompletionItemData[] | undefined {
  const receiver = receiverAt(text, offset);
  if (receiver === undefined) return undefined;
  if (receiver === "variable") return namespaceMemberItems("variable");
  const kind = variableKinds(script).get(receiver);
  return kind ? memberItems(kind) : undefined;
}
