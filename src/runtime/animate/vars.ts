const PROBE_PROPERTY = "--lucia-probe";

/** Resolves var() references on the element itself, so scoped variables are seen. Without a probe the text is kept. */
export function resolveVars(probe: HTMLElement | undefined, text: string): string {
  if (!probe || !text.includes("var(")) return text;
  const previous = probe.style.getPropertyValue(PROBE_PROPERTY);
  probe.style.setProperty(PROBE_PROPERTY, text);
  const resolved = getComputedStyle(probe).getPropertyValue(PROBE_PROPERTY).trim();
  if (previous) probe.style.setProperty(PROBE_PROPERTY, previous);
  else probe.style.removeProperty(PROBE_PROPERTY);
  return resolved;
}
