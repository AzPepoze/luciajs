import { describe, expect, test } from "bun:test";
import { compile } from "@compiler/index.ts";

const FILE = `${process.cwd()}/test/compiler/template/SetupHook.lusia`;

describe("setup hook", () => {
  test("emits the setup(...) callback, balanced across nested brackets and strings", () => {
    const callback = `(root) => {
  const pairs = [[1, 2], { value: ")" }];
  return () => pairs.forEach(([a, b]) => log(a + b));
}`;
    const source = `<script>
import { setup } from "lusia";

setup(${callback});
</script>
<p>Hi</p>`;

    const { code } = compile(source, FILE);

    expect(code).toContain(`setup: ${callback}`);
    expect(code).not.toContain('typeof setup === "function"');
  });

  test("keeps function setup(root) when there is no setup(...) call", () => {
    const source = `<script>
function setup(root: Element) {
  root.addEventListener("click", () => {});
}
</script>
<p>Hi</p>`;

    const { code } = compile(source, FILE);

    expect(code).toContain("function setup(root: Element)");
    expect(code).toContain('setup: typeof setup === "function" ? setup : undefined');
  });
});
