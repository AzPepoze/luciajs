import type { LayoutKey } from "../modes/layout-mode.ts";
import type { Box } from "./layout-box.ts";

/** Reads the layout box once. The offsets ignore transforms, so only a real layout change moves the key. */
export function measureBox(el: HTMLElement, key: LayoutKey, rect: Box): void {
  const box = el.getBoundingClientRect();
  key.x = el.offsetLeft;
  key.y = el.offsetTop;
  key.width = el.offsetWidth;
  key.height = el.offsetHeight;
  rect.left = box.left;
  rect.top = box.top;
  rect.width = box.width;
  rect.height = box.height;
}

export function copyKey(to: LayoutKey, from: LayoutKey): void {
  to.x = from.x;
  to.y = from.y;
  to.width = from.width;
  to.height = from.height;
}
