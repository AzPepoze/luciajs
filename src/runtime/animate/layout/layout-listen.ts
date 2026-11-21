import { startSizes, stopSizes } from "./layout-sizes.ts";

const LISTEN_OPTIONS = { passive: true, capture: true };
const LAYOUT_ATTRIBUTES = ["class", "hidden"];
let mutations: MutationObserver | undefined;

export function startListening(onChange: () => void): void {
  document.addEventListener("scroll", onChange, LISTEN_OPTIONS);
  window.addEventListener("resize", onChange, LISTEN_OPTIONS);
  mutations = new MutationObserver(onChange);
  // Inline styles are not watched: the engine writes them every frame, and each write would read the layout.
  mutations.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: LAYOUT_ATTRIBUTES,
  });
  startSizes(onChange);
}

export function stopListening(onChange: () => void): void {
  document.removeEventListener("scroll", onChange, LISTEN_OPTIONS);
  window.removeEventListener("resize", onChange, LISTEN_OPTIONS);
  mutations?.disconnect();
  mutations = undefined;
  stopSizes();
}
