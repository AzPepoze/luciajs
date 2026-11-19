function findBlockEnd(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  return css.length - 1;
}

/** Calls `rule(prelude, body)` for each top-level rule; text between rules is kept as is. */
export function mapRules(css: string, rule: (prelude: string, body: string) => string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) return out + css.slice(i);
    const close = findBlockEnd(css, open);
    out += rule(css.slice(i, open).trim(), css.slice(open + 1, close));
    i = close + 1;
  }
  return out;
}
