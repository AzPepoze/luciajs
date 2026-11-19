import { LuciaError } from "../errors.ts";
import { skipExpression } from "../utils/braces.ts";
import { columnAt, lineAt } from "../utils/position.ts";

const WHITESPACE = /\s/;

/** Reads markup one character at a time and reports errors with file positions. */
export class Cursor {
  pos = 0;

  constructor(
    readonly src: string,
    private readonly file: string,
    private readonly startLine: number,
  ) {}

  peek(offset = 0): string {
    return this.src[this.pos + offset] ?? "";
  }

  startsWith(text: string): boolean {
    return this.src.startsWith(text, this.pos);
  }

  /** Matches a sticky (`y`) pattern at the cursor, without moving it. */
  match(pattern: RegExp): RegExpExecArray | null {
    pattern.lastIndex = this.pos;
    return pattern.exec(this.src);
  }

  readUntil(end: RegExp): string {
    const start = this.pos;
    while (this.peek() && !end.test(this.peek())) this.pos++;
    return this.src.slice(start, this.pos);
  }

  skipWhitespace(): void {
    while (WHITESPACE.test(this.peek())) this.pos++;
  }

  /** Reads a `{...}` expression and returns its source without the braces. */
  readExpression(): string {
    const start = this.pos;
    const end = skipExpression(this.src, start);
    if (end === -1) this.fail("unclosed {", start);
    this.pos = end;
    const expr = this.src.slice(start + 1, end - 1).trim();
    if (!expr) this.fail("empty {}", start);
    return expr;
  }

  fail(message: string, at = this.pos): never {
    const line = this.startLine - 1 + lineAt(this.src, at);
    throw new LuciaError(message, this.file, line, columnAt(this.src, at));
  }
}
