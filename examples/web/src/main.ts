import { attach, type Instance } from "lucia";
import Site from "./components/Site.lucia";
import Docs from "./components/Docs.lucia";
import Features from "./components/Features.lucia";
import Hero from "./components/Hero.lucia";
import Loader from "./components/Loader.lucia";
import ThemeToggle from "./components/ThemeToggle.lucia";
import { initCopy } from "./copy.ts";
import { initFeatures } from "./features.ts";
import { initDrawer } from "./drawer.ts";
import { initGroupToggles } from "./nav-group.ts";
import { renderNav } from "./render.ts";
import { initScrollSpy } from "./scroll-spy.ts";
import { initSidebarFollow } from "./sidebar-follow.ts";
import { initSearch } from "./search.ts";

const LOADER_MAX_MS = 2500;

// The Loader takes over from the static copy in index.html, so the first paint never goes blank.
const loader = attach(Loader, document.body);
document.getElementById("loader")?.remove();

trackTopbarHeight();
renderNav(document.getElementById("nav-groups")!);

attach(Site, document.body);
attach(ThemeToggle, document.getElementById("theme-slot")!);
attach(Features, document.getElementById("features-slot")!);
attach(Docs, document.getElementById("sections")!);

initSearch();
initGroupToggles();
initSidebarFollow();
initScrollSpy();
initCopy();
initFeatures();
initDrawer();
void hideLoader(loader);

// Waits for the fonts, but never longer than LOADER_MAX_MS, so a slow font cannot hold the page.
// The hero attaches after the loader has left, so its entrance plays where it can be seen.
async function hideLoader(instance: Instance): Promise<void> {
  await Promise.race([document.fonts.ready, wait(LOADER_MAX_MS)]);
  await instance.detach();
  document.documentElement.classList.remove("is-loading");
  attach(Hero, document.getElementById("hero-slot")!);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Full screen sections subtract the real topbar height, which changes on narrow screens.
function trackTopbarHeight(): void {
  const topbar = document.querySelector<HTMLElement>(".topbar")!;
  const update = () => document.documentElement.style.setProperty("--topbar-h", `${topbar.offsetHeight}px`);
  new ResizeObserver(update).observe(topbar);
}
