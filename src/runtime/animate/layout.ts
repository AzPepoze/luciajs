import { copyBox, layoutPlace, newBox, type Box } from "./layout-box.ts";
import { layoutChanged, type LayoutKey } from "./layout-mode.ts";
import {
  clearGlide,
  newGlide,
  readOrigin,
  startGlide,
  stepGlide,
  type Glide,
  type GlideSpec,
} from "./layout-glide.ts";
import { prefersReducedMotion } from "./player.ts";

/** One element that glides when its layout box changes. */
interface Watched {
  el: HTMLElement;
  glide: Glide;
  /** The layout place and size as the last frame measured them. */
  key: LayoutKey;
  rect: Box;
  /** A change was seen this frame and the glide starts in the write phase. */
  pending: boolean;
  once: boolean;
  /** `once` after the first change: no more changes are read. */
  spent: boolean;
  onChange: () => void;
}

const watched = new Set<Watched>();
/** How many watched elements observe each element's size. An element is observed while the count is above 0. */
const sized = new Map<Element, number>();
const probe: LayoutKey = { x: 0, y: 0, width: 0, height: 0 };
const LISTEN_OPTIONS = { passive: true, capture: true };
const LAYOUT_ATTRIBUTES = ["class", "hidden"];
let scheduled = false;
let mutations: MutationObserver | undefined;
let sizes: ResizeObserver | undefined;

/** Glides el whenever its layout box changes. `onChange` runs at each change, in the write phase. Returns the stop function. */
export function watchLayout(
  el: HTMLElement,
  spec: GlideSpec,
  once: boolean,
  onChange: () => void,
): () => void {
  const item: Watched = {
    el,
    glide: newGlide(spec),
    key: { x: 0, y: 0, width: 0, height: 0 },
    rect: newBox(),
    pending: false,
    once,
    spent: false,
    onChange,
  };
  measureKey(el, item.key);
  measureRect(el, item.rect);
  copyBox(item.glide.view, item.rect);
  watched.add(item);
  observeSize(item);
  if (watched.size === 1) startListening();
  return () => forget(item);
}

/** Reads every layout box first, then writes the glides that started or still run. */
function frame(): void {
  scheduled = false;
  for (const item of watched) readItem(item);
  const now = performance.now();
  for (const item of watched) writeItem(item, now);
  for (const item of watched) {
    if (item.glide.active) {
      request();
      break;
    }
  }
}

function readItem(item: Watched): void {
  const { el, glide, rect } = item;
  measureRect(el, rect);
  measureKey(el, probe);
  const changed = !item.spent && layoutChanged(glide.spec.mode, item.key, probe);
  copyKey(item.key, probe);
  if (changed) item.pending = true;
  if (!changed && !glide.active) return;
  readOrigin(el, probe.width, probe.height, glide.origin);
  layoutPlace(rect, glide.current, glide.origin, glide.to);
  glide.to.width = probe.width;
  glide.to.height = probe.height;
}

function writeItem(item: Watched, now: number): void {
  const { el, glide } = item;
  if (item.pending) {
    item.pending = false;
    if (prefersReducedMotion()) clearGlide(glide, el);
    else startGlide(glide, now);
    if (item.once) item.spent = true;
    item.onChange();
  }
  if (glide.active) stepGlide(glide, el, now);
  copyBox(glide.view, glide.active ? glide.visual : item.rect);
  if (item.spent && !glide.active) forget(item);
}

function request(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(frame);
}

function forget(item: Watched): void {
  if (!watched.has(item)) return;
  watched.delete(item);
  clearGlide(item.glide, item.el);
  unobserveSize(item);
  if (watched.size === 0) stopListening();
}

function startListening(): void {
  document.addEventListener("scroll", request, LISTEN_OPTIONS);
  window.addEventListener("resize", request, LISTEN_OPTIONS);
  mutations = new MutationObserver(request);
  // Inline styles are not watched: the engine writes them every frame, and each write would read the layout.
  mutations.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: LAYOUT_ATTRIBUTES,
  });
  sizes = new ResizeObserver(request);
}

function stopListening(): void {
  document.removeEventListener("scroll", request, LISTEN_OPTIONS);
  window.removeEventListener("resize", request, LISTEN_OPTIONS);
  mutations?.disconnect();
  sizes?.disconnect();
  mutations = undefined;
  sizes = undefined;
}

/** The element and its parent: a change in the parent's size can move the element. */
function observeSize(item: Watched): void {
  observeOne(item.el);
  if (item.el.parentElement) observeOne(item.el.parentElement);
}

function unobserveSize(item: Watched): void {
  unobserveOne(item.el);
  if (item.el.parentElement) unobserveOne(item.el.parentElement);
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

function measureRect(el: HTMLElement, out: Box): void {
  const rect = el.getBoundingClientRect();
  out.left = rect.left;
  out.top = rect.top;
  out.width = rect.width;
  out.height = rect.height;
}

/** The offsets ignore transforms and scrolling, so only a real change in the layout moves them. */
function measureKey(el: HTMLElement, out: LayoutKey): void {
  out.x = el.offsetLeft;
  out.y = el.offsetTop;
  out.width = el.offsetWidth;
  out.height = el.offsetHeight;
}

function copyKey(to: LayoutKey, from: LayoutKey): void {
  to.x = from.x;
  to.y = from.y;
  to.width = from.width;
  to.height = from.height;
}
