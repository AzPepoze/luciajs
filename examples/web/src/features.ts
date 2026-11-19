import { highlightInto } from "./highlight/highlight.ts";

// Snippets are highlighted once Features.lucia is attached. Motion is handled by animate.
export function initFeatures(): void {
  const section = document.querySelector<HTMLElement>("#features")!;
  for (const code of section.querySelectorAll<HTMLElement>("code[data-lang]")) {
    highlightInto(code, code.textContent ?? "", code.dataset.lang ?? "none");
  }
}
