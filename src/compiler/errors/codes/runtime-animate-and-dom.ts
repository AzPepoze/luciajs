import type { ErrorCode } from "../codes.ts";

export const RUNTIME_ANIMATE_AND_DOM_CODES = {
  L2031: {
    message: "setAnimateDefault duration must be a time in ms, got $value",
    hint: "Use a number of milliseconds, such as 300.",
  },
  L2032: {
    message: "animate default must be [EASE.STYLE.x, EASE.y], [EASE.STYLE.x] or [EASE.y]",
    hint: "Use one of the three listed forms.",
  },
  L2033: {
    message:
      "animate key must be a style object, [EASE.STYLE.x, EASE.y, style], [EASE.STYLE.x, style] or [EASE.y, style]",
    hint: "Use a style object, or one of the listed forms with it.",
  },
  L2034: {
    message: "animate easing style must be a function of t, such as EASE.STYLE.QUART",
    hint: "Use a member of EASE.STYLE, such as EASE.STYLE.QUART.",
  },
  L2035: {
    message: "animate ease must be EASE.IN, EASE.OUT or EASE.INOUT",
    hint: "Use a member of EASE, such as EASE.INOUT.",
  },
  L2036: {
    message: "animate keyframe $at is outside 0..1",
    hint: "Keyframe keys are fractions of the animation, from 0 to 1.",
  },
  L2037: {
    message: "animate keyframe $at is listed twice",
    hint: "Keep one entry for each key.",
  },
  L2038: {
    message: "animate keyframes must include the keys 0 and 1",
    hint: "Add a key 0 for the start and a key 1 for the end.",
  },
  L2039: {
    message: "animate list changed length after it was attached",
    hint: "Keep the number of animate items fixed. Only their values can change.",
  },
  L2040: {
    message: "props() can only be called in a component's <script>",
    hint: "Call props() at the top level of a .lusia <script>.",
  },
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
  L2051: {
    message: "loop does not work with WHEN.MOVE, RESIZE or MOVE_OR_RESIZE",
    hint: "Remove loop. A glide plays once for each change.",
  },
  L2052: {
    message: "$name is set by the glide and cannot be in style",
    hint: "Remove $name from style. Use transform for other moves.",
  },
  L2053: {
    message: "a computed variable cannot be set",
    hint: "Set the variables it reads, or use variable(...) for a value you can set.",
  },
  L2054: {
    message: "unknown keyframes key '$key'. Keys are numbers from 0 to 1 or 'default'",
    hint: "$tip",
  },
  L2055: {
    message: "unknown animate key '$key'",
    hint: "$tip",
  },
  L2056: {
    message: "animate more keepSpace must be true or false, got $value",
    hint: "Use true to keep the space, or false to let it close.",
  },
  L2057: {
    message: "lazy component failed to load: $message",
    hint: "Check the import path, and that the file builds. The fallback stays on the page.",
  },
  L2058: {
    message: "$prop is read-only in this component",
    hint: "The parent can let it write back: pass it with bind-$prop={variable}.",
  },
  L2059: {
    message: "lazy() was removed",
    hint: "Import the component normally. It loads later by itself. Put its loading view in a <FALLBACK> block in that file.",
  },
} as const satisfies Record<string, ErrorCode>;
