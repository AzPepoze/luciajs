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

  test("finds setup(...) after a comment that ends with a period", () => {
    const source = `<script>
import { setup } from "lusia";

// The editor loads on first mount, so the page stays small.
setup(() => {
  log("ready");
});
</script>
<p>Hi</p>`;

    const { code } = compile(source, FILE);

    expect(code).toContain(`setup: () => {
  log("ready");
}`);
    expect(code).not.toContain('typeof setup === "function"');
  });

  test("finds setup(...) after a block comment", () => {
    const source = `<script>
import { setup } from "lusia";

/* Load it once. */ setup((root) => root);
</script>
<p>Hi</p>`;

    const { code } = compile(source, FILE);

    expect(code).toContain("setup: (root) => root");
    expect(code).not.toContain('typeof setup === "function"');
  });

  test("ignores a member call that is called setup", () => {
    const source = `<script>
const options = { setup: (hook: unknown) => hook };
options.setup(() => {});
</script>
<p>Hi</p>`;

    const { code } = compile(source, FILE);

    expect(code).toContain('setup: typeof setup === "function" ? setup : undefined');
  });

  test("ignores an identifier that ends with setup", () => {
    const source = `<script>
const mysetup = (hook: unknown) => hook;
mysetup(() => {});
</script>
<p>Hi</p>`;

    const { code } = compile(source, FILE);

    expect(code).toContain('setup: typeof setup === "function" ? setup : undefined');
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
