import { describe, expect, test } from "bun:test";
import { buildBundle } from "../../../examples/web/src/playground/bundle.ts";

const CARD = `<script>\nconst label: string = "card";\n</script>\n<p>{label}</p>\n`;
const APP = `<script>\nimport Card from "./Card.lucia";\n</script>\n<main>\n  <Card />\n</main>\n`;

describe("buildBundle", () => {
  test("compiles every file and links the imports between them", () => {
    const result = buildBundle([
      { name: "App.lucia", code: APP },
      { name: "Card.lucia", code: CARD },
    ]);
    expect(result.errors).toEqual([]);
    expect(result.bundle?.entry).toBe("App.lucia");
    expect(result.bundle?.modules["App.lucia"]).toContain('"@playground/Card.lucia"');
    expect(result.bundle?.modules["Card.lucia"]).not.toContain(": string");
  });

  test("reports an import of a missing file with its line", () => {
    const app = `<script>\nimport Card from "./Missing.lucia";\n</script>\n<main>\n  <Card />\n</main>\n`;
    const result = buildBundle([{ name: "App.lucia", code: app }]);
    expect(result.bundle).toBeUndefined();
    expect(result.errors[0]).toMatchObject({
      message: "Cannot find ./Missing.lucia.",
      file: "App.lucia",
      line: 2,
    });
  });

  test("reports a syntax error in a .ts file with its position", () => {
    const result = buildBundle([
      { name: "App.lucia", code: APP },
      { name: "Card.lucia", code: CARD },
      { name: "util.ts", code: "export const a = 1;\nexport const b = ;\n" },
    ]);
    expect(result.bundle).toBeUndefined();
    expect(result.errors).toContainEqual(expect.objectContaining({ file: "util.ts", line: 2 }));
  });

  test("needs the entry file", () => {
    const result = buildBundle([{ name: "Card.lucia", code: CARD }]);
    expect(result.bundle).toBeUndefined();
    expect(result.errors[0]?.message).toBe("App.lucia is missing.");
  });
});
