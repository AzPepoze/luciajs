import { describe, expect, test } from "bun:test";
import { splitImports } from "@compiler/parse/imports.ts";
import { parse } from "@compiler/parse/sections.ts";
import { catchError } from "../catch-error.ts";

const FILE = "Card.lucia";

function split(script: string) {
  return splitImports(parse(`<script>${script}</script>`, FILE).script, FILE);
}

describe("splitImports", () => {
  test("hoists import statements and keeps the rest in the body", () => {
    const { imports, body } = split(
      '\nimport { store } from "lucia";\nconst count = store(0);\nimport a from "./a.ts";\n',
    );
    expect(imports).toBe('import { store } from "lucia";\nimport a from "./a.ts";');
    expect(body).toContain("const count = store(0);");
    expect(body).not.toContain("import");
  });

  test("a multi-line import is hoisted whole", () => {
    const { imports, body } = split(
      '\nimport {\n  store,\n  attach,\n} from "lucia";\nconst a = 1;\n',
    );
    expect(imports).toBe('import {\n  store,\n  attach,\n} from "lucia";');
    expect(body).toContain("const a = 1;");
  });

  test("default imports of .lucia files become component names", () => {
    const { components } = split(
      '\nimport Card from "./card.lucia";\nimport badge from "./badge.lucia";\n',
    );
    expect([...components]).toEqual(["Card", "badge"]);
  });

  test("a default import alongside named imports is a component", () => {
    const { components } = split('\nimport a, { b } from "./a.lucia";\n');
    expect([...components]).toEqual(["a"]);
  });

  test("default imports of other files are not components", () => {
    const { components } = split(
      '\nimport store from "./store.ts";\nimport * as ns from "./ns.lucia";\n',
    );
    expect(components.size).toBe(0);
  });

  test("named and side-effect imports of .lucia files are not components", () => {
    const { components } = split(
      '\nimport { card } from "./card.lucia";\nimport "./side.lucia";\n',
    );
    expect(components.size).toBe(0);
  });

  test("import type is ignored for components", () => {
    const { components } = split(
      '\nimport type Props from "./props.lucia";\nimport type { Shape } from "./shape.lucia";\n',
    );
    expect(components.size).toBe(0);
  });

  test("an export in the script is an error with its line and column", () => {
    const error = catchError(() => split("\nconst a = 1;\nexport const b = 2;\n"));
    expect(error.code).toBe("L1003");
    expect(error.message).toBe("a component's <script> cannot export");
    expect(error.file).toBe(FILE);
    expect(error.line).toBe(3);
    expect(error.column).toBe(1);
  });

  test("an indented export reports the column of the keyword", () => {
    const error = catchError(() => split("\n  export const b = 2;\n"));
    expect(error.line).toBe(2);
    expect(error.column).toBe(3);
  });

  test("a missing script gives empty parts", () => {
    expect(splitImports(null, FILE)).toEqual({ imports: "", body: "", components: new Set() });
  });
});
