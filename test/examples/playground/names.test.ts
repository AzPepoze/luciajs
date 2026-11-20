import { describe, expect, test } from "bun:test";
import { nameProblem } from "../../../examples/web/src/playground/names.ts";

const files = [
  { name: "App.lucia", code: "" },
  { name: "Card.lucia", code: "" },
];

describe("nameProblem", () => {
  test("accepts a new .lucia or .ts name", () => {
    expect(nameProblem("Badge.lucia", files)).toBeUndefined();
    expect(nameProblem("variable-utils.ts", files)).toBeUndefined();
  });

  test("rejects other extensions, folders and odd characters", () => {
    expect(nameProblem("style.css", files)).toBeDefined();
    expect(nameProblem("ui/Badge.lucia", files)).toBeDefined();
    expect(nameProblem("1st.lucia", files)).toBeDefined();
  });

  test("rejects a name that another file has", () => {
    expect(nameProblem("Card.lucia", files)).toBeDefined();
  });

  test("allows a file to keep its own name when renamed", () => {
    expect(nameProblem("Card.lucia", files, "Card.lucia")).toBeUndefined();
  });
});
