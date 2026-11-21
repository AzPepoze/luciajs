import { BUNDLE_CODES } from "./codes/bundle.ts";
import { COMPILE_CODES } from "./codes/compile.ts";
import { RUNTIME_CODES } from "./codes/runtime.ts";

// L1xxx: compile errors in .lusia files. L2xxx: runtime checks on values the compiled code passes in.
// L3xxx: bundler errors from Bun.build, such as a missing export or an unresolved import.
// Messages and hints may use $name placeholders, filled from the values an error is raised with.
export interface ErrorCode {
  message: string;
  hint: string;
}

export const CODES = {
  ...COMPILE_CODES,
  ...RUNTIME_CODES,
  ...BUNDLE_CODES,
} as const satisfies Record<string, ErrorCode>;

export type ErrorCodeName = keyof typeof CODES;
