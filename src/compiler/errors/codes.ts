// L1xxx: compile errors in .lucia files. L2xxx: runtime checks on values the compiled code passes in.
// L3xxx: bundler errors from Bun.build, such as a missing export or an unresolved import.
// Messages and hints may use $name placeholders, filled from the values an error is raised with.
export interface ErrorCode {
  message: string;
  hint: string;
}

export const CODES = {
  L1001: {
    message: "unclosed <$tag>",
    hint: "Add the closing tag, such as </$tag>, after the content.",
  },
  L1002: {
    message: "only one <script> is allowed",
    hint: "Move the code into one <script> section.",
  },
  L1003: {
    message: "a component's <script> cannot export",
    hint: "Move shared values into a .ts file and import them.",
  },
  L1004: {
    message: "$name is a reserved tag name and cannot be a component",
    hint: "Rename the component. IF, ELSEIF, ELSE, EACH, FOR, CONTENT and HTML are built in.",
  },
  L1005: { message: "$message", hint: "Check the Sass syntax in this <style> section." },
  L1006: { message: "unclosed <!-- comment", hint: "Add --> to close the comment." },
  L1007: {
    message: "unclosed <$name>",
    hint: "Add > to close the tag, or /> if it has no content.",
  },
  L1008: { message: "unclosed closing tag", hint: "Add > after the closing tag name." },
  L1009: {
    message: "<$name> needs a closing </$name>",
    hint: "Add </$name> after its content, or write <$name /> with no content.",
  },
  L1010: { message: "unclosed {", hint: "Add } to close the expression." },
  L1011: { message: "empty {}", hint: "Put an expression between the braces, such as {count}." },
  L1012: {
    message: "expected an attribute name",
    hint: "Remove the stray character, or add a name.",
  },
  L1013: { message: "unclosed attribute value", hint: "Add the closing quote after the value." },
  L1014: {
    message: "bind-<property> needs a property name",
    hint: "Write the property after the dash, such as bind-value.",
  },
  L1015: {
    message: "$attr needs {variable}",
    hint: "Put a variable in braces, such as $attr={name}.",
  },
  L1016: {
    message: "$attr needs one {handler}",
    hint: "Put one function in braces, such as onclick={increment}.",
  },
  L1017: {
    message: "an element can have only one animate",
    hint: "Put several animations in one array inside animate.",
  },
  L1018: {
    message: "animate needs {keyframes}",
    hint: "Put the keyframes in braces, such as animate={fadeIn}.",
  },
  L1019: { message: "$tag takes no attributes", hint: "Remove the attributes from $tag." },
  L1020: {
    message: "$tag has no $attr attribute",
    hint: "Check the spelling. Only the attributes listed in the docs are allowed.",
  },
  L1021: { message: "$attr is given twice", hint: "Keep one $attr attribute." },
  L1022: {
    message: "$attr needs {expression}",
    hint: "Put a value in braces, such as $attr={value}.",
  },
  L1023: {
    message: "bind-element works on elements only",
    hint: "Use bind-element on an element inside the component, not on its tag.",
  },
  L1024: {
    message: "bind works on input, textarea and select",
    hint: "Use bind-value, bind-checked and so on for other elements.",
  },
  L1025: {
    message: "$attr needs a name in {}, like $attr={item}",
    hint: "Use one plain name, with no dots or symbols.",
  },
  L1026: {
    message: "<$name> needs a closing </$name>",
    hint: "Write <$name> ... </$name> instead of <$name />.",
  },
  L1027: { message: "expected </$name>", hint: "Close the block with </$name> after its content." },
  L1028: {
    message: "expected </$name>, found </$found>",
    hint: "Close the block with </$name> before the other closing tag.",
  },
  L1029: {
    message: "$name needs {condition}",
    hint: "Put the condition in braces first, such as <IF {loggedIn}>.",
  },
  L1030: {
    message: "EACH needs {list}",
    hint: "Put the list in braces first, such as <EACH {items} as={item}>.",
  },
  L1031: {
    message: "FOR needs a name in {}, like {i}",
    hint: "Put the loop name in braces first, such as <FOR {i} to={10}>.",
  },
  L1032: { message: "FOR needs to={end}", hint: "Add the end value, such as to={10}." },
  L1033: { message: "unexpected </$tag>", hint: "Remove it, or open the block it closes." },
  L1034: {
    message: "<$tag> must directly follow </IF> or </ELSEIF>",
    hint: "Put ELSEIF or ELSE right after the branch before it.",
  },
  L1035: {
    message: "<CONTENT /> is used more than once",
    hint: "Keep one <CONTENT /> in the component's markup.",
  },
  L1036: {
    message: "<CONTENT> needs />",
    hint: "Write <CONTENT /> with no children. The children go between the component's tags.",
  },
  L1037: {
    message: "<HTML> needs one {expression}",
    hint: "Put one expression in braces between the tags, such as <HTML>{html}</HTML>.",
  },
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
    message: "animate more start and end cannot be used with follow",
    hint: "Remove start and end. follow sets the progress.",
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
  L2037: { message: "animate keyframe $at is listed twice", hint: "Keep one entry for each key." },
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
    hint: "Call props() at the top level of a .lucia <script>.",
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
  L2046: { message: "active was renamed to when", hint: "Write when: instead of active:." },
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
  L3001: {
    message: '"$name" is not exported by "$module"',
    hint: "Check the name, or see reference/api.ts.",
  },
  L3002: {
    message: 'cannot resolve "$name"',
    hint: "Check the spelling of the path or package name, and that the file exists.",
  },
  L3003: { message: "$message", hint: "Fix the code on this line, then build again." },
} as const satisfies Record<string, ErrorCode>;

export type ErrorCodeName = keyof typeof CODES;
