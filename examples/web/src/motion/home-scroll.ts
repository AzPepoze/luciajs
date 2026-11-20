import { WHEN, type AnimateItem, type ComputedVariable, type Style } from "lucia";

// Scroll motion for the Home page. Each item follows a whole section (`follow`), so the
// progress runs while that section moves past the screen. All Home scroll motion lives here.
export type Follow = ComputedVariable<HTMLElement | null>;

// `part` plays only a slice of the page, such as the top fifth, so one section can move in its own time.
export function scrollBetween(
  follow: Follow,
  from: Style,
  to: Style,
  part?: [number, number],
): AnimateItem {
  const more = part ? { follow, part } : { follow };
  return { when: WHEN.SCROLL, more, style: { 0: from, 1: to } };
}
