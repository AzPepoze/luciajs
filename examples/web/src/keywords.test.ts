import { describe, expect, test } from "bun:test";
import type { ApiEntry } from "../../../reference/api.ts";
import { buildKeywordIndex, tokenize } from "./keywords.ts";

const entries: ApiEntry[] = [
  {
    id: "store",
    name: "store()",
    kind: "function",
    group: "reactivity",
    signature: "",
    summary: "A value.",
    bullets: [],
    example: "",
  },
  {
    id: "store-from",
    name: "store.from()",
    kind: "function",
    group: "reactivity",
    signature: "",
    summary: "Derived.",
    bullets: [],
    example: "",
  },
  {
    id: "active",
    name: "WHEN",
    kind: "value",
    group: "motion",
    signature: "",
    summary: "What plays an animation.",
    bullets: [],
    example: "",
    members: [{ name: "VIEW", summary: "When in view." }],
  },
];

const index = buildKeywordIndex(entries, [
  { id: "animate-reveal", title: "Reveal on scroll", caption: "Each line plays once." },
]);

function chips(parts: ReturnType<typeof tokenize>) {
  return parts.filter((part) => part.chip).map((part) => [part.text, part.target?.id ?? null]);
}

describe("keyword tokenizer", () => {
  test("links an API name to its section", () => {
    expect(chips(tokenize("Call store() first.", index, "props"))).toEqual([["store()", "store"]]);
  });

  test("prefers the longest name", () => {
    expect(chips(tokenize("Use store.from() here.", index, "props"))).toEqual([
      ["store.from()", "store-from"],
    ]);
  });

  test("matches whole words only", () => {
    expect(chips(tokenize("restore() is not store().", index, "props"))).toEqual([
      ["store()", "store"],
    ]);
  });

  test("links an enum member to its parent section", () => {
    expect(chips(tokenize("Pick WHEN.VIEW.", index, "props"))).toEqual([["WHEN.VIEW", "active"]]);
  });

  test("does not link a section to itself", () => {
    expect(chips(tokenize("Call store() first.", index, "store"))).toEqual([["store()", null]]);
  });

  test("backticked text is always a chip, even when unknown", () => {
    expect(chips(tokenize("Set `width` to 3.", index, "props"))).toEqual([["width", null]]);
  });

  test("backticked text links when it names a section", () => {
    expect(chips(tokenize("See `store()`.", index, "props"))).toEqual([["store()", "store"]]);
  });

  test("a demo title links only inside backticks", () => {
    expect(chips(tokenize("See `Reveal on scroll`.", index, "props"))).toEqual([
      ["Reveal on scroll", "animate-reveal"],
    ]);
    expect(chips(tokenize("Reveal on scroll is a word.", index, "props"))).toEqual([]);
  });

  test("curly braces are an expression chip", () => {
    const [, expression] = tokenize("Write {count.value} here.", index, "props");
    expect(expression).toEqual({ text: "{count.value}", chip: true, kind: "expression" });
  });

  test("keeps plain text between chips in order", () => {
    const text = tokenize("A store() and WHEN.VIEW.", index, "props").map((part) => part.text);
    expect(text.join("")).toBe("A store() and WHEN.VIEW.");
  });

  test("text without keywords is one plain part", () => {
    expect(tokenize("Nothing here.", index, "props")).toEqual([
      { text: "Nothing here.", chip: false, kind: "text" },
    ]);
  });
});
