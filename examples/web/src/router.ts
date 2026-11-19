import { attach, type Component, type Instance } from "lucia";
import { refreshTopbar } from "./topbar.ts";

// A page: its path, its name for the topbar and the CSS route, its title, and the wiring that runs while it is attached.
export interface PageSpec {
  path: string;
  route: string;
  title: string;
  component: Component;
  mount: (root: HTMLElement, signal: AbortSignal) => void;
}

interface Current {
  spec: PageSpec;
  instance: Instance;
  controller: AbortController;
}

let outlet: HTMLElement;
let pages: PageSpec[] = [];
let current: Current | undefined;
let navigation = 0;

export function startRouter(outletElement: HTMLElement, specs: PageSpec[]): Promise<void> {
  outlet = outletElement;
  pages = specs;
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => void show(location.pathname, location.hash, false));
  return show(location.pathname, location.hash, false);
}

function specFor(path: string): PageSpec {
  const spec = pages.find((page) => page.path === normalize(path)) ?? pages[0];
  if (!spec) throw new Error("the router needs at least one page");
  return spec;
}

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

// Same-origin links to a known page go through the router. Other links keep their normal behaviour.
function onClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
  if (!link || link.origin !== location.origin || link.target) return;
  const path = normalize(link.pathname);
  if (!pages.some((page) => page.path === path)) return;
  if (path === normalize(location.pathname) && link.hash) return;
  event.preventDefault();
  void show(path, link.hash, true);
}

async function show(path: string, hash: string, push: boolean): Promise<void> {
  const spec = specFor(path);
  const id = ++navigation;
  if (push) history.pushState(null, "", spec.path + hash);
  if (current?.spec === spec) {
    scrollTo(hash);
    return;
  }
  if (current) {
    current.controller.abort();
    await current.instance.detach();
  }
  if (id !== navigation) return;
  const controller = new AbortController();
  const instance = attach(spec.component, outlet);
  current = { spec, instance, controller };
  spec.mount(outlet, controller.signal);
  document.title = spec.title;
  document.documentElement.dataset.route = spec.route;
  markActiveLink(spec.path);
  refreshTopbar();
  scrollTo(hash);
}

function markActiveLink(path: string): void {
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".main-menu a")) {
    if (normalize(link.pathname) === path) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

// Scrolls to the hash target, or to the top of the page when there is no hash.
function scrollTo(hash: string): void {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
  else window.scrollTo({ top: 0, behavior: "instant" });
}
