import type { ErrorCode } from "../../codes.ts";

export const RUNTIME_ANIMATE_MORE_CODES = {
  L2047: {
    message: "animate more $name is a number, which is no longer used",
    hint: "Write $name: SCROLL_AT.ENTER, or $name: { element: EDGE.TOP, window: EDGE.BOTTOM }.",
  },
  L2048: {
    message:
      "animate more $name must be EDGE.TOP, EDGE.CENTER, EDGE.BOTTOM or a number from 0 to 1, got $value",
    hint: "Use an EDGE member, such as EDGE.CENTER, or a number from 0 to 1.",
  },
  L2049: {
    message: 'animate more $name has an unknown key "$key", use element or window',
    hint: "Check the spelling of the key.",
  },
  L2050: {
    message: "animate more $name needs both element and window",
    hint: "Write { element: EDGE.TOP, window: EDGE.BOTTOM }.",
  },
  L2056: {
    message: "animate more keepSpace must be true or false, got $value",
    hint: "Use true to keep the space, or false to let it close.",
  },
} as const satisfies Record<string, ErrorCode>;
