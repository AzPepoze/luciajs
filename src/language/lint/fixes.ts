import type { LintFix, LintIssue } from "./types.ts";

/** Applies text edits from the last to the first, so every offset stays valid. */
export function applyTextEdits(source: string, edits: readonly LintFix[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = source;
  let covered = source.length + 1;
  for (const edit of sorted) {
    if (edit.end > covered) continue;
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    covered = edit.start;
  }
  return out;
}

export function applyFixes(source: string, issues: readonly LintIssue[]): string {
  return applyTextEdits(
    source,
    issues.flatMap((issue) => (issue.fix ? [issue.fix] : [])),
  );
}
