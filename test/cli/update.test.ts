import { describe, expect, test } from "bun:test";
import type { ModuleChange } from "@bun-plugin/change.ts";
import { chooseUpdate, describeUpdate, RELOAD } from "@cli/update.ts";

const STYLE: ModuleChange = { path: "/app/src/Card.lucia", kind: "style", id: "abc", css: ".a{}" };
const CODE: ModuleChange = { path: "/app/src/Card.lucia", kind: "code" };

describe("chooseUpdate", () => {
  test("a style-only change of .lucia or .scss files swaps css", () => {
    expect(chooseUpdate(["src/Card.lucia"], [STYLE])).toEqual({
      kind: "styles",
      styles: [{ id: "abc", css: ".a{}" }],
    });
    expect(chooseUpdate(["src/_tokens.scss"], [STYLE])).toEqual({
      kind: "styles",
      styles: [{ id: "abc", css: ".a{}" }],
    });
  });

  test("a script or markup change reloads", () => {
    expect(chooseUpdate(["src/Card.lucia"], [CODE])).toBe(RELOAD);
    expect(chooseUpdate(["src/Card.lucia"], [STYLE, CODE])).toBe(RELOAD);
  });

  test("a changed .ts or other file reloads, even when only styles changed in the build", () => {
    expect(chooseUpdate(["src/topbar.ts"], [STYLE])).toBe(RELOAD);
    expect(chooseUpdate(["src/Card.lucia", "src/topbar.ts"], [STYLE])).toBe(RELOAD);
    expect(chooseUpdate(["index.html"], [])).toBe(RELOAD);
  });

  test("no changed files reloads", () => {
    expect(chooseUpdate([], [])).toBe(RELOAD);
  });

  test("labels the update for the log", () => {
    expect(describeUpdate(RELOAD)).toBe("reload");
    expect(describeUpdate({ kind: "styles", styles: [] })).toBe("css swap");
  });
});
