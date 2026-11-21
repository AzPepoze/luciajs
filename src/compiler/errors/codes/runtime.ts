import type { ErrorCode } from "../codes.ts";

export const RUNTIME_CODES = {
  L2001: {
    message: "animate item needs a style",
    hint: "Add style to the item, such as { style: fadeIn }.",
  },
  L2002: {
    message:
      "animate when must be WHEN.ATTACH, DETACH, VIEW, HOVER, SCROLL, MOVE, RESIZE, MOVE_OR_RESIZE or MANUAL, or a variable",
    hint: "Pass one of the WHEN values, or a variable.",
  },
  L2003: {
    message: "animate $name must be a time in ms, got $value",
    hint: "Use a number of milliseconds, such as 300.",
  },
  L2004: {
    message: "animate loop must be true or a count, got $value",
    hint: "Use true, or a number of times such as 3.",
  },
  L2005: {
    message: "ease moved into the keyframes: default: [...]",
    hint: "Write default: [EASE.STYLE.QUART, EASE.INOUT] inside the keyframes.",
  },
  L2006: {
    message: "curve/transition moved into the keyframes: default: [EASE.STYLE.X, EASE.Y]",
    hint: "Write default: [EASE.STYLE.X, EASE.Y] inside the keyframes.",
  },
  L2007: {
    message: "alternate was renamed to backAndForth",
    hint: "Write backAndForth: true instead.",
  },
  L2008: {
    message: "reverse moved into more: { reverse: true }",
    hint: "Write more: { reverse: true } instead.",
  },
  L2009: {
    message: "loop does not work with WHEN.SCROLL",
    hint: "Remove loop, or use another WHEN value.",
  },
  L2010: {
    message: "more is not used with $when",
    hint: "Remove more, or use a WHEN value that takes it.",
  },
  L2011: {
    message: "animate more must be an object with $keys, got $value",
    hint: "Pass an object with the keys listed.",
  },
  L2012: {
    message: 'more has an unknown key "$key", use $keys',
    hint: "$tip",
  },
  L2013: {
    message: "animate more outDuration needs out",
    hint: "Add out with the keyframes for leaving, or remove outDuration.",
  },
  L2014: {
    message: "animate more out must be keyframes, such as { 0: { opacity: 1 }, 1: { opacity: 0 } }",
    hint: "Give out an object of keyframes.",
  },
  L2015: {
    message: "animate more part cannot be used with start and end",
    hint: "Use part alone, or start and end alone.",
  },
  L2016: {
    message:
      "animate more follow must be a variable that holds an element, such as one set by bind-element",
    hint: "Use a variable that bind-element writes to.",
  },
  L2017: {
    message: "animate more $name must be SCROLL_AT or { element, window }, got $value",
    hint: "Use a SCROLL_AT member, such as SCROLL_AT.ENTER, or { element: EDGE.TOP, window: EDGE.BOTTOM }.",
  },
  L2018: {
    message: "animate more start and end must be different moments",
    hint: "Use two different SCROLL_AT members, or two different points.",
  },
  L2019: {
    message: "animate more part must be [from, to] with 0 <= from < to <= 1, got $value",
    hint: "Use a pair such as [0, 0.5].",
  },
  L2020: {
    message: "animate more reverse must be true or false, got $value",
    hint: "Use true or false.",
  },
  L2021: {
    message: 'animate more margin must be a number of px or a CSS length such as "10%", got $value',
    hint: 'Use a number of px, such as 40, or a string such as "10%".',
  },
  L2022: {
    message: "animate more amount must be a number from 0 to 1, got $value",
    hint: "Use a number from 0 to 1, such as 0.5.",
  },
  L2023: {
    message:
      "animate midway must be a MIDWAY member or an object such as { play: MIDWAY.FINISH }, got $value",
    hint: "Use a MIDWAY member, or an object with play.",
  },
  L2024: {
    message:
      'midway has an unknown key "$key", use play, turn, turnDuration, turnStyle or turnEase',
    hint: "Check the spelling of the key.",
  },
  L2025: {
    message: "animate midway.play must be a MIDWAY member such as MIDWAY.FINISH, got $value",
    hint: "Use a member of MIDWAY, such as MIDWAY.FINISH.",
  },
  L2026: {
    message:
      "animate midway.turn must be a TURN member such as TURN.SMOOTH, or a function, got $value",
    hint: "Use a member of TURN, such as TURN.SMOOTH, or a function.",
  },
  L2027: {
    message: "animate midway.turnDuration must be a time in ms, got $value",
    hint: "Use a number of milliseconds, such as 200.",
  },
  L2028: {
    message: "animate midway.turnStyle must be an EASE.STYLE member, got $value",
    hint: "Use a member of EASE.STYLE, such as EASE.STYLE.CUBIC.",
  },
  L2029: {
    message: "animate midway.turnEase must be an EASE member such as EASE.INOUT, got $value",
    hint: "Use a member of EASE, such as EASE.INOUT.",
  },
  L2030: {
    message: 'setAnimateDefault has an unknown key "$key", use ease or duration',
    hint: "Check the spelling of the key.",
  },
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
