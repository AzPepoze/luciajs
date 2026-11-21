import type { ErrorCode } from "../../codes.ts";

export const RUNTIME_VARIABLE_CODES = {
  L2053: {
    message: "a computed variable cannot be set",
    hint: "Set the variables it reads, or use variable(...) for a value you can set.",
  },
} as const satisfies Record<string, ErrorCode>;
