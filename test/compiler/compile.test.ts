import { describe, expect, test } from "bun:test";
import { relative } from "node:path";
import { compile } from "@compiler/index.ts";

const FILE = `${process.cwd()}/test/compiler/Dim.lucia`;
const WHERE = relative(process.cwd(), FILE);

describe("compile dev option", () => {
  test("dev keeps a source map that points at the .lucia file", () => {
    const { code, map } = compile("<script>\nlet a = 1;\n</script>\n<p>{a}</p>", FILE, {
      dev: true,
    });
    expect(JSON.parse(map).sources).toEqual([FILE]);
    expect(code).toContain("__unwrap((a))");
    expect(code).not.toContain("/*@");
  });

  test("without dev the code has no location strings", () => {
    const { code } = compile("<script>\nlet a = 1;\n</script>\n<p>{a}</p>", FILE);
    expect(code).toContain("__unwrap((a))");
    expect(code).not.toContain("Dim.lucia:");
  });

  test("dev registers the component and wraps its stores for hot swap", () => {
    const { code } = compile("<script>\nconst count = store(0);\n</script>\n<p>{count}</p>", FILE, {
      dev: true,
    });
    expect(code).toContain('__hotStore("count", store(0))');
    expect(code).toContain(`export default __hotComponent("`);
    expect(code).toContain('} from "lucia/internal";');
  });

  test("prod output has no hot code", () => {
    const { code } = compile("<script>\nconst count = store(0);\n</script>\n<p>{count}</p>", FILE);
    expect(code).not.toContain("__hot");
    expect(code).not.toContain("hotComponent");
    expect(code).not.toContain("hotStore");
    expect(code).toContain("const count = store(0);");
    expect(code).toContain(`export default __defineComponent("`);
  });

  test("dev passes the animate location as the last argument of __animate", () => {
    const { code } = compile(
      "<script>\nconst fade = 1;\n</script>\n<div animate={fade}>x</div>",
      FILE,
      { dev: true },
    );
    const call = /__animate\(.*, "([^"]+)"\);/.exec(code);
    expect(call?.[1]).toBe(`${WHERE}:4:15`);
  });
});
