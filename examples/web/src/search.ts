import { setGroupCollapsed } from "./nav-group.ts";

export function initSearch(): void {
  const input = document.querySelector<HTMLInputElement>("#search")!;
  const groups = [...document.querySelectorAll<HTMLElement>(".nav-group")];
  const empty = document.querySelector<HTMLElement>(".nav-empty")!;
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    for (const group of groups) shown += filterGroup(group, query);
    empty.hidden = shown > 0;
  });
}

function filterGroup(group: HTMLElement, query: string): number {
  let shown = 0;
  for (const link of group.querySelectorAll<HTMLAnchorElement>("a")) {
    const match = labelOf(link).toLowerCase().includes(query);
    link.hidden = !match;
    if (match) shown++;
  }
  setGroupCollapsed(group, shown === 0);
  return shown;
}

function labelOf(link: HTMLAnchorElement): string {
  return link.querySelector(".nav-label")?.textContent ?? "";
}
