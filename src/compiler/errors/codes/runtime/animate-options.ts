import type { ErrorCode } from "../../codes.ts";

export const RUNTIME_ANIMATE_OPTIONS_CODES = {
  L2039: {
    message: "animate list changed length after it was attached",
    hint: "Keep the number of animate items fixed. Only their values can change.",
  },
  L2044: {
    message: "ACTIVE.IN and ACTIVE.OUT were renamed to ACTIVE.ATTACH and ACTIVE.DETACH",
    hint: "Replace IN with ATTACH and OUT with DETACH.",
  },
  L2045: {
    message: "animation was renamed to style",
    hint: "Write style: keyframes instead of animation: keyframes.",
  },
  L2046: {
    message: "active was renamed to when",
    hint: "Write when: instead of active:.",
  },
  L2051: {
    message: "loop does not work with WHEN.MOVE, RESIZE or MOVE_OR_RESIZE",
    hint: "Remove loop. A glide plays once for each change.",
  },
  L2052: {
    message: "$name is set by the glide and cannot be in style",
    hint: "Remove $name from style. Use transform for other moves.",
  },
} as const satisfies Record<string, ErrorCode>;
