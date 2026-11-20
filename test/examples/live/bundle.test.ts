import { describe, expect, test } from "bun:test";
import { buildLive } from "../../../docs/src/live/build.ts";

const CARD = `<script>\nconst label: string = "card";\n</script>\n<p>{label}</p>\n`;
const APP = `<script>\nimport Card from "./Card.lucia";\n</script>\n<main>\n  <Card />\n</main>\n`;

describe("buildLive", () => {
  test("compiles every file and links the imports between them", () => {
    const result = buildLive(
      [
        { name: "App.lucia", code: APP },
        { name: "Card.lucia", code: CARD },
      ],
      { entries: ["App.lucia"] },
    );
    expect(result.errors).toEqual([]);
    expect(result.bundle?.entries).toEqual(["App.lucia"]);
    expect(result.bundle?.modules["App.lucia"]).toContain('"@live/Card.lucia"');
    expect(result.bundle?.modules["Card.lucia"]).not.toContain(": string");
  });

  test("reports an import of a missing file with its line", () => {
    const app = `<script>\nimport Card from "./Missing.lucia";\n</script>\n<main>\n  <Card />\n</main>\n`;
    const result = buildLive([{ name: "App.lucia", code: app }], { entries: ["App.lucia"] });
    expect(result.bundle).toBeUndefined();
    expect(result.errors[0]).toMatchObject({
      message: "Cannot find ./Missing.lucia.",
      file: "App.lucia",
      line: 2,
    });
  });

  test("reports a syntax error in a .ts file with its position", () => {
    const result = buildLive(
      [
        { name: "App.lucia", code: APP },
        { name: "Card.lucia", code: CARD },
        { name: "util.ts", code: "export const a = 1;\nexport const b = ;\n" },
      ],
      { entries: ["App.lucia"] },
    );
    expect(result.bundle).toBeUndefined();
    expect(result.errors).toContainEqual(expect.objectContaining({ file: "util.ts", line: 2 }));
  });

  test("needs the entry file", () => {
    const result = buildLive([{ name: "Card.lucia", code: CARD }], { entries: ["App.lucia"] });
    expect(result.bundle).toBeUndefined();
    expect(result.errors[0]?.message).toBe("App.lucia is missing.");
  });

  test("mounts the files that no other file imports", () => {
    const result = buildLive([
      { name: "App.lucia", code: APP },
      { name: "Card.lucia", code: CARD },
    ]);
    expect(result.bundle?.entries).toEqual(["App.lucia"]);
  });

  test("a Sass import resolves inside the files", () => {
    const result = buildLive(
      [
        {
          name: "Card.lucia",
          code: `<script>\nconst a = 1;\n</script>\n<p class="c">x</p>\n<style>\n@use "tone" as tone;\n.c { color: tone.$fg; }\n</style>`,
        },
        { name: "_tone.scss", code: "$fg: red;" },
      ],
      { entries: ["Card.lucia"] },
    );
    if (!result.bundle) throw new Error(result.errors[0]?.message);
    expect(result.bundle.modules["Card.lucia"]).toContain("color: red");
  });
});
