import { keepInView } from "./sidebar-follow.ts";

// Px from the top of the viewport where a section or demo becomes current. Below the scroll margin, so a clicked target is current.
const SPY_LINE_PX = 200;

let indicator: HTMLElement;
let linksById = new Map<string, HTMLAnchorElement[]>();
let activeLinks: HTMLAnchorElement[] = [];
let sections: HTMLElement[] = [];
let demos: HTMLElement[] = [];
let currentKey = "";
let frame = 0;

export function initScrollSpy(): void {
  indicator = document.querySelector<HTMLElement>(".nav-indicator")!;
  const sidebar = document.querySelector<HTMLElement>("#sidebar")!;
  linksById = groupLinksById();
  sections = [...document.querySelectorAll<HTMLElement>(".doc-section")];
  demos = [...document.querySelectorAll<HTMLElement>(".demo-block")];
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  sidebar.addEventListener("transitionend", () => placeIndicator(activeLinks.at(-1)));
  update();
}

function scheduleUpdate(): void {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    update();
  });
}

function update(): void {
  const section = currentTarget(sections);
  const demo = currentTarget(demos);
  activate(section, demo && section?.contains(demo) ? demo : undefined);
}

// The last target whose top is above the line. Targets are in document order, so the scan stops early.
function currentTarget(targets: HTMLElement[]): HTMLElement | undefined {
  if (atPageBottom()) return targets.at(-1);
  let current: HTMLElement | undefined;
  for (const target of targets) {
    if (target.getBoundingClientRect().top > SPY_LINE_PX) break;
    current = target;
  }
  return current;
}

function atPageBottom(): boolean {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
}

function groupLinksById(): Map<string, HTMLAnchorElement[]> {
  const map = new Map<string, HTMLAnchorElement[]>();
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".sidebar a")) {
    const id = link.getAttribute("href")!.slice(1);
    map.set(id, [...(map.get(id) ?? []), link]);
  }
  return map;
}

function activate(section: HTMLElement | undefined, demo: HTMLElement | undefined): void {
  const key = `${section?.id}|${demo?.id}`;
  if (key === currentKey) return;
  currentKey = key;
  const links = [...linksFor(section), ...linksFor(demo)];
  for (const link of activeLinks) link.removeAttribute("aria-current");
  for (const link of links) link.setAttribute("aria-current", "true");
  activeLinks = links;
  placeIndicator(links.at(-1));
  if (links.length > 0) keepInView(links.at(-1)!);
}

function linksFor(target: HTMLElement | undefined): HTMLAnchorElement[] {
  return target ? (linksById.get(target.id) ?? []) : [];
}

// The indicator sits on the guide line of the link's list: the group's, or the sub-list's.
function placeIndicator(link: HTMLAnchorElement | undefined): void {
  if (!link) return;
  const guide = link.closest<HTMLElement>(".nav-links, .nav-sub")!;
  indicator.classList.add("is-ready");
  indicator.style.left = `${guide.offsetLeft - 1}px`;
  indicator.style.transform = `translateY(${link.offsetTop}px)`;
  indicator.style.height = `${link.offsetHeight}px`;
}
