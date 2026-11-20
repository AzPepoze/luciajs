import { api, type ApiEntry } from "../../../reference/api.ts";
import { catalog, entryIcon, groupTitles, type Demo } from "./catalog.ts";
import { guidePath, pageLink } from "./page-link.ts";

const groupOrder: ApiEntry["group"][] = [
  "basics",
  "reactivity",
  "flow",
  "components",
  "styling",
  "motion",
];

// Type-only entries are left out: they are noise for beginners. Their facts are bullets on the other entries.
// The sidebar and the sections both follow this list, so their order always matches.
export const orderedEntries: ApiEntry[] = groupOrder.flatMap((group) =>
  api.filter((entry) => entry.group === group && entry.kind !== "type"),
);

export function renderNav(nav: HTMLElement): void {
  for (const group of groupOrder) {
    const entries = orderedEntries.filter((entry) => entry.group === group);
    if (entries.length > 0) nav.append(navGroup(group, entries));
  }
}

function navGroup(group: ApiEntry["group"], entries: ApiEntry[]): HTMLElement {
  const { label, icon } = groupTitles[group];
  const wrapper = element("div", "nav-group");
  wrapper.dataset.group = group;
  wrapper.style.setProperty("--group", groupTitles[group].color);
  const title = element("button", "nav-title");
  title.type = "button";
  title.setAttribute("aria-expanded", "true");
  const name = element("span", "group-name");
  name.append(glyph(icon), label);
  title.append(name, glyph("expand_more", "chevron"));

  const links = element("nav", "nav-links");
  links.setAttribute("aria-label", label);
  for (const entry of entries) links.append(navEntry(entry));
  const inner = element("div");
  inner.append(links);
  const items = element("div", "nav-items");
  items.append(inner);
  wrapper.append(title, items);
  return wrapper;
}

// An entry with two or more demos gets one nested link per demo. The sub-list opens while the entry is active.
function navEntry(entry: ApiEntry): HTMLElement {
  const wrapper = element("div", "nav-entry");
  const demos = catalog[entry.id]?.demos ?? [];
  wrapper.append(entryLink(entry));
  if (demos.length > 1) wrapper.append(subNav(demos));
  return wrapper;
}

function entryLink(entry: ApiEntry): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = pageLink(guidePath, entry.id);
  link.append(glyph(entryIcon(entry.id)), codeOrText(entry.name, "nav-label"));
  return link;
}

function subNav(demos: Demo[]): HTMLElement {
  const wrapper = element("div", "nav-sub");
  const inner = element("div", "nav-sub-inner");
  for (const demo of demos) inner.append(subLink(demo));
  wrapper.append(inner);
  return wrapper;
}

function subLink(demo: Demo): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = pageLink(guidePath, demo.id);
  link.textContent = demo.title;
  return link;
}

function codeOrText(text: string, className: string): HTMLElement {
  const node = element("code", className);
  node.textContent = text;
  return node;
}

function glyph(name: string, className?: string): HTMLElement {
  const node = element("span", "material-symbols-rounded");
  if (className) node.classList.add(className);
  node.setAttribute("aria-hidden", "true");
  node.textContent = name;
  return node;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
