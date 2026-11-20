import { describe, expect, test } from "bun:test";
import { hotStores } from "@compiler/hot/stores.ts";

describe("hotStores", () => {
  test("wraps a top-level store declaration with its name", () => {
    expect(hotStores("const count = store(0);")).toBe(
      'const count = __hotStore("count", store(0));',
    );
  });

  test("keeps type arguments inside the wrapped call", () => {
    expect(hotStores("let total = store<number>(0);")).toBe(
      'let total = __hotStore("total", store<number>(0));',
    );
  });

  test("wraps each declaration of the script", () => {
    const script = "const a = store(1);\nconst b = store({ x: [1, 2] });\n";
    expect(hotStores(script)).toBe(
      'const a = __hotStore("a", store(1));\nconst b = __hotStore("b", store({ x: [1, 2] }));\n',
    );
  });

  test("leaves stores inside functions and derived stores alone", () => {
    const script =
      "function make() { const inner = store(1); return inner; }\nconst d = store.from(() => 1);";
    expect(hotStores(script)).toBe(script);
  });

  test("ignores store calls inside strings and comments", () => {
    const script = 'const text = ")store(";\n// const fake = store(2);\nconst real = store(3);';
    expect(hotStores(script)).toBe(
      'const text = ")store(";\n// const fake = store(2);\nconst real = __hotStore("real", store(3));',
    );
  });
});
