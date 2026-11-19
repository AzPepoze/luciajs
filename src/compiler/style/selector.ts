const COMBINATORS = new Set([" ", ">", "+", "~"]);
const LEGACY_PSEUDO_ELEMENT = /^:(before|after|first-line|first-letter)\b/;

export function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

// The scope goes on the subject compound, before any pseudo-element, which must stay last.
function subjectInsertPoint(selector: string): number {
  let depth = 0;
  let point = selector.length;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]!;
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (depth > 0) continue;
    else if (COMBINATORS.has(ch)) point = selector.length;
    else if (ch === ":" && point === selector.length) {
      const isPseudoElement =
        selector[i + 1] === ":" || LEGACY_PSEUDO_ELEMENT.test(selector.slice(i));
      if (isPseudoElement) point = i;
    }
  }
  return point;
}

export function scopeSelector(selector: string, filter: string): string {
  const point = subjectInsertPoint(selector);
  return `${selector.slice(0, point)}${filter}${selector.slice(point)}`;
}

export function subjectStart(selector: string): number {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]!;
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (depth === 0 && COMBINATORS.has(ch)) start = i + 1;
  }
  return start;
}

export function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) return i;
  }
  return text.length;
}
