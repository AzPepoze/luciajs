const sized = new Map<Element, number>();
let sizes: ResizeObserver | undefined;

export function startSizes(onResize: () => void): void {
  sizes = new ResizeObserver(onResize);
}

export function stopSizes(): void {
  sizes?.disconnect();
  sizes = undefined;
}

/** The element and its parent: a change in the parent's size can move the element. */
export function observeSize(el: HTMLElement): void {
  observeOne(el);
  if (el.parentElement) observeOne(el.parentElement);
}

export function unobserveSize(el: HTMLElement): void {
  unobserveOne(el);
  if (el.parentElement) unobserveOne(el.parentElement);
}

function observeOne(target: Element): void {
  const count = sized.get(target) ?? 0;
  sized.set(target, count + 1);
  if (count === 0) sizes?.observe(target);
}

function unobserveOne(target: Element): void {
  const count = (sized.get(target) ?? 0) - 1;
  if (count > 0) {
    sized.set(target, count);
    return;
  }
  sized.delete(target);
  sizes?.unobserve(target);
}
