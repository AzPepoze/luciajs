import { parseLusiaImports } from "../../imports.ts";
import type { LintFinding, LintFix, LintRule } from "../types.ts";

export const unusedImport: LintRule = ({ script, scriptOffset, markup }) =>
  parseLusiaImports(script)
    .filter((item) => !isUsedAsTag(markup, item.name))
    .map((item): LintFinding => ({
      ...unusedFinding(item.name, scriptOffset + item.index),
      fix: removalFix(script, scriptOffset, item.index),
    }));

function unusedFinding(name: string, offset: number): LintFinding {
  return {
    offset,
    code: "unused-import",
    message: `"${name}" is imported but never used as a tag`,
    severity: "warning",
  };
}

/** Removes the whole line the import sits on, when it sits alone on that line. */
function removalFix(script: string, scriptOffset: number, index: number): LintFix | undefined {
  const start = script.lastIndexOf("\n", index - 1) + 1;
  const end = script.indexOf("\n", index);
  const line = script.slice(start, end === -1 ? script.length : end);
  if (!line.trimStart().startsWith("import")) return undefined;
  return {
    start: scriptOffset + start,
    end: scriptOffset + (end === -1 ? script.length : end + 1),
    text: "",
  };
}

function isUsedAsTag(markup: string, name: string): boolean {
  return new RegExp(`<${name}(?=[\\s/>])`).test(markup);
}
