import type { Section } from "@compiler/parse/sections.ts";

/** Where the script section's text sits in the source. */
export interface ScriptRange {
  from: number;
  to: number;
}

/** The source range of a script section. An absent script has an empty range. */
export function scriptRange(script: Section | null): ScriptRange {
  if (!script) return { from: 0, to: 0 };
  return { from: script.from, to: script.from + script.content.length };
}
