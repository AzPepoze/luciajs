import { describe, expect, test } from "bun:test";
import { docsElement } from "../../../examples/web/src/editor/docs-dom.ts";

describe("docsElement", () => {
  test("renders a bold title, a code fence, bullets and inline code", () => {
    const root = docsElement(
      [
        "**store()**",
        "",
        "```ts",
        "store<T>(initial: T)",
        "```",
        "- Use `.value`.",
        "- Second.",
      ].join("\n"),
    );
    expect(root.querySelector("strong")?.textContent).toBe("store()");
    expect(root.querySelector("pre code")?.textContent).toBe("store<T>(initial: T)");
    expect(root.querySelectorAll("li").length).toBe(2);
    expect(root.querySelector("li code")?.textContent).toBe(".value");
  });

  test("keeps markup in the text as text, never as elements", () => {
    const root = docsElement("<img src=x onerror=alert(1)>");
    expect(root.querySelector("img")).toBeNull();
    expect(root.textContent).toContain("<img");
  });
});
