import type { PropDef } from "./props.ts";
import { buildContext } from "./lint/context.ts";
import { isLintDisabled, parseLintDirectives, type LintDirective } from "./lint/comments.ts";
import { lintLevel, severityOf } from "./lint/options.ts";
import { animateAttributes } from "./lint/rules/animate-attributes.ts";
import { animateKeys } from "./lint/rules/animate-keys.ts";
import { bindTargets } from "./lint/rules/bind-targets.ts";
import { emptyExpression } from "./lint/rules/empty-expression.ts";
import { flowChain } from "./lint/rules/flow-chain.ts";
import { propsTwice } from "./lint/rules/props-twice.ts";
import { scrollLines } from "./lint/rules/scroll-lines.ts";
import { styleAttribute } from "./lint/rules/style-attribute.ts";
import { unknownProp } from "./lint/rules/unknown-prop.ts";
import { unusedImport } from "./lint/rules/unused-import.ts";
import type { LintFinding, LintIssue, LintOptions, LintRule } from "./lint/types.ts";

export { LINT_LEVELS, LINT_RULE_CODES } from "./lint/types.ts";
export type {
  LintFix,
  LintIssue,
  LintLevel,
  LintOptions,
  LintRuleCode,
  LintRuleSettings,
  Severity,
} from "./lint/types.ts";

const RULES: LintRule[] = [
  unusedImport,
  propsTwice,
  unknownProp,
  emptyExpression,
  styleAttribute,
  animateAttributes,
  animateKeys,
  scrollLines,
  flowChain,
  bindTargets,
];

/** Lint findings for a .lusia source. `childProps` gives the props of an imported component. */
export function lintLusia(
  source: string,
  childProps: (name: string) => PropDef[] | undefined,
  options: LintOptions = {},
): LintIssue[] {
  const context = buildContext(source, childProps);
  const directives = options.disableComments === false ? [] : parseLintDirectives(source);
  return RULES.flatMap((rule) => rule(context))
    .sort((a, b) => a.offset - b.offset)
    .flatMap((finding) => {
      const issue = toIssue(source, finding, options, directives);
      return issue ? [issue] : [];
    });
}

function toIssue(
  source: string,
  finding: LintFinding,
  options: LintOptions,
  directives: LintDirective[],
): LintIssue | undefined {
  const level = lintLevel(finding.code, finding.severity, options.rules);
  if (level === "off") return undefined;
  const { line, column } = positionOf(source, finding.offset);
  if (isLintDisabled(directives, line, finding.code)) return undefined;
  const issue: LintIssue = {
    line,
    column,
    message: finding.message,
    severity: severityOf(level),
    code: finding.code,
  };
  return finding.fix ? { ...issue, fix: finding.fix } : issue;
}

function positionOf(source: string, offset: number): { line: number; column: number } {
  const before = source.slice(0, offset);
  return { line: before.split("\n").length, column: offset - before.lastIndexOf("\n") };
}
