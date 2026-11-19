export function setGroupCollapsed(group: HTMLElement, collapsed: boolean): void {
  group.classList.toggle("is-collapsed", collapsed);
  group.querySelector(".nav-title")?.setAttribute("aria-expanded", String(!collapsed));
}

export function initGroupToggles(signal: AbortSignal): void {
  for (const title of document.querySelectorAll<HTMLButtonElement>(".nav-title")) {
    title.addEventListener(
      "click",
      () => {
        const group = title.closest<HTMLElement>(".nav-group")!;
        setGroupCollapsed(group, !group.classList.contains("is-collapsed"));
      },
      { signal },
    );
  }
}
