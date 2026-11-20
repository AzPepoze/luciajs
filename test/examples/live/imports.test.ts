import { describe, expect, test } from "bun:test";
import {
  findBrokenImports,
  linkImports,
  rootNames,
} from "../../../docs/src/live/imports.ts";

const names = new Set(["App.lucia", "Card.lucia", "util.ts", "src/demos/x/Badge.lucia"]);

describe("linkImports", () => {
  test("points imports between files at their module names", () => {
    const code = `import Card from "./Card.lucia";\nconst util = await import('./util.ts');`;
    expect(linkImports(code, "App.lucia", names)).toBe(
      `import Card from "@live/Card.lucia";\nconst util = await import('@live/util.ts');`,
    );
  });

  test("resolves a parent folder against the importing file", () => {
    const code = `import Badge from "../x/Badge.lucia";`;
    expect(linkImports(code, "src/demos/y/Props.lucia", names)).toBe(
      `import Badge from "@live/src/demos/x/Badge.lucia";`,
    );
  });

  test("keeps imports of other modules, such as lucia", () => {
    const code = `import { variable } from "lucia";\nimport Missing from "./Missing.lucia";`;
    expect(linkImports(code, "App.lucia", names)).toBe(code);
  });
});

describe("findBrokenImports", () => {
  test("lists imports that name no file, with their line", () => {
    const source = `const x = 1;\nimport Missing from "./Missing.lucia";\nimport Card from "./Card.lucia";`;
    expect(findBrokenImports(source, "App.lucia", names)).toEqual([
      { specifier: "./Missing.lucia", line: 2 },
    ]);
  });
});

describe("rootNames", () => {
  test("lists the .lucia files that nothing imports", () => {
    const files = [
      { name: "src/A.lucia", code: `import B from "./B.lucia";` },
      { name: "src/B.lucia", code: "" },
      { name: "src/C.lucia", code: "" },
      { name: "src/util.ts", code: "" },
    ];
    expect(rootNames(files)).toEqual(["src/A.lucia", "src/C.lucia"]);
  });

  test("a file that imports itself is still a root", () => {
    const files = [
      { name: "src/Folder.lucia", code: `import Folder from "./Folder.lucia";` },
      { name: "src/App.lucia", code: `import Folder from "./Folder.lucia";` },
    ];
    expect(rootNames(files)).toEqual(["src/App.lucia"]);
    const alone = [{ name: "src/Folder.lucia", code: `import Folder from "./Folder.lucia";` }];
    expect(rootNames(alone)).toEqual(["src/Folder.lucia"]);
  });
});
