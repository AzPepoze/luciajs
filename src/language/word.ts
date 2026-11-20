const WORD_CHAR = /[\w$]/;
const ATTRIBUTE_CHAR = /[\w-]/;
const IDENTIFIER_CHAR = /[A-Za-z0-9_$]/;

export interface DottedName {
  name: string;
  start: number;
  end: number;
}

/** The identifier that covers `offset`, or an empty string. */
export function wordAt(text: string, offset: number): string {
  return spanAt(text, offset, WORD_CHAR);
}

/** The attribute name that covers `offset`, such as `bind-value`, or an empty string. */
export function attributeNameAt(text: string, offset: number): string {
  return spanAt(text, offset, ATTRIBUTE_CHAR);
}

/** The dotted name under `offset`, such as `EASE.STYLE.QUART` on any of its segments. */
export function dottedNameAt(text: string, offset: number): DottedName | undefined {
  let start = offset;
  while (start > 0 && dottedLeft(text, start)) start--;
  let end = offset;
  while (end < text.length && dottedRight(text, end)) end++;
  while (start < end && text.charAt(start) === ".") start++;
  while (end > start && text.charAt(end - 1) === ".") end--;
  if (start === end) return undefined;
  return { name: text.slice(start, end), start, end };
}

function spanAt(text: string, offset: number, charPattern: RegExp): string {
  let start = offset;
  while (start > 0 && charPattern.test(text.charAt(start - 1))) start--;
  let end = offset;
  while (end < text.length && charPattern.test(text.charAt(end))) end++;
  return text.slice(start, end);
}

/** Whether the char at `index` continues the dotted name from the right, such as the `.` in `a.b`. */
function dottedLeft(text: string, index: number): boolean {
  const char = text.charAt(index - 1);
  if (IDENTIFIER_CHAR.test(char)) return true;
  return char === "." && IDENTIFIER_CHAR.test(text.charAt(index - 2));
}

/** Whether the char at `index` continues the dotted name from the left, such as the `.` in `a.b`. */
function dottedRight(text: string, index: number): boolean {
  const char = text.charAt(index);
  if (IDENTIFIER_CHAR.test(char)) return true;
  return char === "." && IDENTIFIER_CHAR.test(text.charAt(index + 1));
}
