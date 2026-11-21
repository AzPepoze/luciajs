import type { PropDef } from "../parse/props.ts";

export const LINT_RULE_CODES = [
  "unused-import",
  "props-twice",
  "unknown-prop",
  "empty-expression",
  "style-attribute",
  "animate-keyframes",
  "animate-key",
  "scroll-numeric-line",
  "flow-chain",
  "bind-target",
] as const;

export type LintRuleCode = (typeof LINT_RULE_CODES)[number];

export const LINT_LEVELS = ["off", "warn", "error"] as const;

export type LintLevel = (typeof LINT_LEVELS)[number];

/** The configured level of each rule. A rule that is left out keeps its own severity. */
export type LintRuleSettings = Partial<Record<LintRuleCode, LintLevel>>;

export interface LintOptions {
  rules?: LintRuleSettings;
  /** Read `<!-- lusia-lint-disable ... -->` comments. Default true. */
  disableComments?: boolean;
}

export type Severity = "warning" | "error";

/** A text edit on the source. Offsets are absolute. */
export interface LintFix {
  start: number;
  end: number;
  text: string;
}

/** A rule's result. `offset` points into the source. */
export interface LintFinding {
  offset: number;
  code: LintRuleCode;
  message: string;
  severity: Severity;
  fix?: LintFix;
}

/** What the editor and the CLI show. `line` and `column` are 1-based. */
export interface LintIssue {
  line: number;
  column: number;
  message: string;
  severity: Severity;
  code: LintRuleCode;
  fix?: LintFix;
}

export interface LintContext {
  source: string;
  /** Script text, and where it starts in the source. */
  script: string;
  scriptOffset: number;
  /** The source with script and style content blanked, so offsets still match. */
  markup: string;
  childProps(name: string): PropDef[] | undefined;
}

export type LintRule = (context: LintContext) => LintFinding[];
