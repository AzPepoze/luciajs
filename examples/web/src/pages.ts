import { renderNav } from "./render.ts";
import { initCopy } from "./copy.ts";
import { initDrawer } from "./drawer.ts";
import { initFeatures } from "./features.ts";
import { initGroupToggles } from "./nav-group.ts";
import { initReferenceSearch } from "./reference-search.ts";
import { initScrollSpy } from "./scroll-spy.ts";
import { initSearch } from "./search.ts";
import { initSidebarFollow } from "./sidebar-follow.ts";
import type { PageSpec } from "./router.ts";
import Guide from "./pages/Guide.lucia";
import Home from "./pages/Home.lucia";
import Reference from "./pages/Reference.lucia";

// The Guide's wiring starts when the page attaches and stops when the signal aborts.
function mountGuide(root: HTMLElement, signal: AbortSignal): void {
  renderNav(root.querySelector<HTMLElement>("#nav-groups")!);
  initSearch(signal);
  initGroupToggles(signal);
  initSidebarFollow(signal);
  initScrollSpy(signal);
  initDrawer(signal);
  initCopy(root, signal);
}

function mountHome(root: HTMLElement, signal: AbortSignal): void {
  initFeatures(root);
  initCopy(root, signal);
}

function mountReference(root: HTMLElement, signal: AbortSignal): void {
  initReferenceSearch(root, signal);
}

export const pageSpecs: PageSpec[] = [
  { path: "/", route: "home", title: "LuciaJS", component: Home, mount: mountHome },
  { path: "/guide", route: "guide", title: "Guide · LuciaJS", component: Guide, mount: mountGuide },
  {
    path: "/reference",
    route: "reference",
    title: "Reference · LuciaJS",
    component: Reference,
    mount: mountReference,
  },
];
