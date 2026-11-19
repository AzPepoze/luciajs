/** Show the raw text of a file from this example in `el`. Plain text only, never innerHTML. */
export async function showSource(el: Element, path: string): Promise<void> {
  const response = await fetch(`/source/${path}`);
  el.textContent = response.ok ? await response.text() : `Could not load ${path} (HTTP ${response.status}).`;
}
