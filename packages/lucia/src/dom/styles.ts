const injectedStyles = new Set<string>();

export function injectStyle(id: string, css: string): void {
  if (!css || injectedStyles.has(id)) return;
  injectedStyles.add(id);
  const style = document.createElement("style");
  style.dataset.lucia = id;
  style.textContent = css;
  document.head.appendChild(style);
}
