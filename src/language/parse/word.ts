const WORD_CHAR = /[\w$]/;
const ATTRIBUTE_CHAR = /[\w-]/;
const IDENTIFIER_CHAR = /[A-Za-z0-9_$]/;

export interface DottedName {
  name: string;
  start: number;
  end: number;
}

export function wordAt(text: string, offset: number): string {
  return spanAt(text, offset, WORD_CHAR);
}

export function attributeNameAt(text: string, offset: number): string {
  return spanAt(text, offset, ATTRIBUTE_CHAR);
}

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

function dottedLeft(text: string, index: number): boolean {
  const char = text.charAt(index - 1);
  if (IDENTIFIER_CHAR.test(char)) return true;
  return char === "." && IDENTIFIER_CHAR.test(text.charAt(index - 2));
}

function dottedRight(text: string, index: number): boolean {
  const char = text.charAt(index);
  if (IDENTIFIER_CHAR.test(char)) return true;
  return char === "." && IDENTIFIER_CHAR.test(text.charAt(index + 1));
}
