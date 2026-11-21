import type { ErrorCode } from "../../codes.ts";

export const RUNTIME_DOM_CODES = {
  L2041: {
    message: "EACH keys must be unique, but $key appears twice",
    hint: "Give each row a key that no other row has.",
  },
  L2042: {
    message: "FOR needs a step that is not 0",
    hint: "Use a step such as 1, or -1 to count down.",
  },
  L2043: {
    message: "$attr needs a writable variable",
    hint: "Bind to a variable made with variable(), not to a computed value.",
  },
} as const satisfies Record<string, ErrorCode>;
