import { describe, expect, test } from "bun:test";
import { luciaMarkRanges } from "../../../examples/web/src/editor/lang/marks.ts";

const SOURCE = `<script>\nconst n = 1;\n</script>\n<IF {n > 0}>\n  <Badge onclick={go} bind-value={n} />\n</IF>\n<p animate={fade}>x</p>\n`;

/** The text under each mark, with its class, for the markup part of the sample. */
function marked(source: string): Array<[string, string]> {
  return luciaMarkRanges(source).map((range) => {
    const mark = range.value.spec.class as string;
    return [mark, source.slice(range.from, range.to)];
  });
}

describe("luciaMarkRanges", () => {
  const marks = marked(SOURCE);

  test("marks the flow tag names, not the brackets", () => {
    expect(marks).toContainEqual(["lucia-flow", "IF"]);
  });

  test("marks components by their capital name", () => {
    expect(marks).toContainEqual(["lucia-component", "Badge"]);
  });

  test("marks events, bind and animate attributes", () => {
    expect(marks).toContainEqual(["lucia-event", "onclick"]);
    expect(marks).toContainEqual(["lucia-bind", "bind-value"]);
    expect(marks).toContainEqual(["lucia-animate", "animate"]);
  });

  test("highlights TypeScript inside {...}, and not the script", () => {
    expect(marks.some(([, text]) => text === ">")).toBe(true);
    expect(marks.some(([, text]) => text === "const")).toBe(false);
  });

  test("skips flow names that are not component tags", () => {
    expect(
      marks.some(([className, text]) => className === "lucia-component" && text === "IF"),
    ).toBe(false);
  });
});
