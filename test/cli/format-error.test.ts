import { describe, expect, test } from "bun:test";
import { LuciaError } from "@compiler/errors.ts";
import { formatError } from "@cli/format-error.ts";

const SOURCE = ["<script>", "const a = 1;", "</script>", "<p>{a + }</p>", "<p>ok</p>"].join("\n");
const FILE = `${process.cwd()}/src/Card.lucia`;

function sample(): LuciaError {
  return new LuciaError("empty {}", FILE, 4, 3, {
    code: "L1011",
    hint: "Put an expression between the braces, such as {count}.",
    length: 2,
  });
}

describe("formatError", () => {
  test("prints a tsc-style location, code frame and hint without color", () => {
    expect(formatError(sample(), SOURCE, false)).toBe(
      [
        "src/Card.lucia:4:3 - error L1011: empty {}",
        "",
        "2 | const a = 1;",
        "3 | </script>",
        "4 | <p>{a + }</p>",
        "  |   ^~",
        "5 | <p>ok</p>",
        "",
        "hint: Put an expression between the braces, such as {count}.",
      ].join("\n"),
    );
  });

  test("adds ANSI colors when color is on", () => {
    const colored = formatError(sample(), SOURCE, true);
    expect(colored).toContain("\x1b[31m");
    expect(colored).toContain("\x1b[33m4:3");
    expect(colored.replace(/\x1b\[[0-9;]*m/g, "")).toBe(formatError(sample(), SOURCE, false));
  });

  test("a runtime error with no location prints the code and hint only", () => {
    const error = new LuciaError(
      "animate duration must be a time in ms, got -1",
      undefined,
      undefined,
      undefined,
      {
        code: "L2003",
        hint: "Use a number of milliseconds, such as 300.",
      },
    );
    expect(formatError(error, undefined, false)).toBe(
      "error L2003: animate duration must be a time in ms, got -1\n\nhint: Use a number of milliseconds, such as 300.",
    );
  });
});
