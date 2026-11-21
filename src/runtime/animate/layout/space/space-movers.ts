export interface Box {
  top: number;
  left: number;
}

/** A moved element. `base` is its transform before, `inline` is the inline value to restore. */
export interface Mover {
  el: HTMLElement;
  dx: number;
  dy: number;
  base: string;
  inline: string;
}

const MIN_SHIFT = 0.5;

/**
 * The elements whose place can change when `el` enters or leaves: each ancestor and each sibling of the element and of its ancestors.
 * Sorted from the top down, so an ancestor is compensated before its children.
 */
export function movingElements(el: HTMLElement): HTMLElement[] {
  const found = new Set<HTMLElement>();
  let node = el;
  let parent = node.parentElement;
  while (parent && parent !== document.documentElement) {
    for (const sibling of parent.children) {
      if (sibling instanceof HTMLElement && sibling !== node) found.add(sibling);
    }
    if (parent !== document.body) found.add(parent);
    node = parent;
    parent = node.parentElement;
  }
  return [...found].sort((a, b) => depthOf(a) - depthOf(b));
}

function depthOf(el: HTMLElement): number {
  let depth = 0;
  for (let node = el.parentElement; node; node = node.parentElement) depth++;
  return depth;
}

/** Undefined for an element with no box, such as `display: none`. */
export function boxesOf(elements: HTMLElement[]): Array<Box | undefined> {
  return elements.map(boxOf);
}

function boxOf(el: HTMLElement): Box | undefined {
  if (el.getClientRects().length === 0) return undefined;
  const rect = el.getBoundingClientRect();
  return { top: rect.top, left: rect.left };
}

/**
 * Moves each element that changed place back to its `before` place. Each one is read after the ones above it moved,
 * so a child of a moved ancestor only gets the shift it still needs. Elements that did not move keep their transform.
 */
export function compensate(elements: HTMLElement[], before: Array<Box | undefined>): Mover[] {
  const movers: Mover[] = [];
  elements.forEach((el, i) => {
    const from = before[i];
    const to = boxOf(el);
    if (!from || !to) return;
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    if (Math.abs(dx) < MIN_SHIFT && Math.abs(dy) < MIN_SHIFT) return;
    const mover: Mover = { el, dx, dy, base: computedTransformOf(el), inline: el.style.transform };
    movers.push(mover);
    writeShift(mover, 1);
  });
  return movers;
}

/** Puts the elements back into flow from where they are now, so they slide back without a jump. */
export function reopenMovers(
  elements: HTMLElement[],
  movers: Mover[],
  enterFlow: () => void,
): Mover[] {
  const before = boxesOf(elements);
  for (const mover of movers) restoreShift(mover);
  enterFlow();
  return compensate(elements, before);
}

/** `remaining` is 1 at the old place and 0 at the new place. */
export function writeShift(mover: Mover, remaining: number): void {
  const { dx, dy, base } = mover;
  mover.el.style.transform = `translate(${dx * remaining}px, ${dy * remaining}px) ${base}`;
}

export function restoreShift(mover: Mover): void {
  mover.el.style.transform = mover.inline;
}

function computedTransformOf(el: HTMLElement): string {
  const transform = getComputedStyle(el).transform;
  return transform === "none" ? "" : transform;
}
