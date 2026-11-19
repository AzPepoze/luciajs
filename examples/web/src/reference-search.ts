// Filters the Reference rows with the topbar search. Groups with no matching row are hidden too.
export function initReferenceSearch(root: ParentNode, signal: AbortSignal): void {
  const input = document.querySelector<HTMLInputElement>("#search")!;
  const rows = [...root.querySelectorAll<HTMLElement>("[data-ref-row]")];
  const groups = [...root.querySelectorAll<HTMLElement>("[data-ref-group]")];
  const apply = (): void => {
    const query = input.value.trim().toLowerCase();
    for (const row of rows) row.hidden = !(row.textContent ?? "").toLowerCase().includes(query);
    for (const group of groups) group.hidden = !group.querySelector("[data-ref-row]:not([hidden])");
  };
  input.addEventListener("input", apply, { signal });
  apply();
}
