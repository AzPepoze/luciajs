import { parseLusiaImports, type LusiaImport } from "../../parse/imports.ts";
import type { LintFinding, LintFix, LintRule } from "../types.ts";

const STATEMENT = /import\s+[\s\S]*?from\s*["'][^"'\n]+\.lusia["'];?/y;

export const unusedImport: LintRule = ({ script, scriptOffset, markup }) =>
  parseLusiaImports(script)
    .filter((item) => !isUsed(script, markup, item))
    .map((item): LintFinding => ({
      ...unusedFinding(item.name, scriptOffset + item.index),
      fix: removalFix(script, scriptOffset, item.index),
    }));

function unusedFinding(name: string, offset: number): LintFinding {
  return {
    offset,
    code: "unused-import",
    message: `"${name}" is imported but never used`,
    severity: "warning",
  };
}

function isUsed(script: string, markup: string, item: LusiaImport): boolean {
  if (isUsedAsTag(markup, item.name)) return true;
  return isUsedInScript(script, item);
}

function isUsedInScript(script: string, item: LusiaImport): boolean {
  const statement = statementAt(script, item.index);
  const name = new RegExp(`\\b${escapeName(item.name)}\\b`, "g");
  for (const match of script.matchAll(name)) {
    const offset = match.index ?? 0;
    if (offset < item.index || offset >= item.index + statement.length) return true;
  }
  return false;
}

function statementAt(script: string, index: number): string {
  STATEMENT.lastIndex = index;
  return STATEMENT.exec(script)?.[0] ?? "";
}

function escapeName(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
