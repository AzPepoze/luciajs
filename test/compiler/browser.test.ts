import { describe, expect, test } from "bun:test";
import { compileForBrowser, LuciaError } from "../../src/compiler/browser.ts";

describe("compileForBrowser", () => {
  test("removes the TypeScript from the script", () => {
    const source = `<script>\nconst count: number = 1;\n</script>\n<p>{count}</p>\n`;
    const { code, hasSass } = compileForBrowser(source, "App.lucia");
    expect(code).not.toContain(": number");
    expect(code).toContain("export default");
    expect(hasSass).toBe(false);
  });

  test("reports a style that needs Sass", () => {
    const source = `<style>\n.card { .title { color: red; } }\n</style>\n<p class="card">Hi</p>\n`;
    expect(compileForBrowser(source, "App.lucia").hasSass).toBe(true);
  });

  test("keeps plain CSS styles out of the Sass note", () => {
    const source = `<style lang="css">\n.card { color: red; }\n</style>\n<p class="card">Hi</p>\n`;
    expect(compileForBrowser(source, "App.lucia").hasSass).toBe(false);
  });

  test("points a script syntax error at its line in the source", () => {
    const source = `<script>\nconst a = 1;\nconst b = ;\n</script>\n<p>{a}</p>\n`;
    let thrown: unknown;
    try {
      compileForBrowser(source, "App.lucia");
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(LuciaError);
    expect((thrown as LuciaError).line).toBe(3);
  });
});
