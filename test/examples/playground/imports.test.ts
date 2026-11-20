import { describe, expect, test } from "bun:test";
import { findBrokenImports, linkImports } from "../../../examples/web/src/playground/imports.ts";

const names = new Set(["App.lucia", "Card.lucia", "util.ts"]);

describe("linkImports", () => {
  test("points imports between playground files at their module names", () => {
    const code = `import Card from "./Card.lucia";\nconst util = await import('./util.ts');`;
    expect(linkImports(code, names)).toBe(
      `import Card from "@playground/Card.lucia";\nconst util = await import('@playground/util.ts');`,
    );
  });

  test("keeps imports of other modules, such as lucia", () => {
    const code = `import { store } from "lucia";\nimport Missing from "./Missing.lucia";`;
    expect(linkImports(code, names)).toBe(code);
  });
});

describe("findBrokenImports", () => {
  test("lists imports that name no file, with their line", () => {
    const source = `const x = 1;\nimport Missing from "./Missing.lucia";\nimport Card from "./Card.lucia";`;
    expect(findBrokenImports(source, names)).toEqual([{ specifier: "./Missing.lucia", line: 2 }]);
  });
});
