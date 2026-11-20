import { readTags, VOID_TAGS, type Tag } from "../parse/tags.ts";

const FLOW_TAGS: ReadonlySet<string> = new Set(["IF", "ELSEIF", "ELSE", "EACH", "FOR"]);

/** True when every tag use of `name` in the markup sits inside a flow tag (IF, ELSEIF, ELSE, EACH or FOR). */
export function onlyInFlow(markup: string, name: string): boolean {
  const open: string[] = [];
  for (const tag of readTags(markup, [])) {
    if (tag.closing) closeTag(open, tag.name);
    else if (tag.name === name && !open.some((item) => FLOW_TAGS.has(item))) return false;
    else if (opensElement(tag)) open.push(tag.name);
  }
  return true;
}

/** True when the script text names `name` as a whole word, such as in `attach(Name, el)`. */
export function usedInScript(script: string, name: string): boolean {
  const word = new RegExp(`(?<![\\w$])${escapeRegExp(name)}(?![\\w$])`);
  return word.test(script);
}

function opensElement(tag: Tag): boolean {
  return !tag.selfClosing && !VOID_TAGS.has(tag.name.toLowerCase());
}

/** Removes the most recent open element with this name, and the ones opened after it. */
function closeTag(open: string[], name: string): void {
  const index = open.lastIndexOf(name);
  if (index !== -1) open.length = index;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
