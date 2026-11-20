import { api, type ApiEntry } from "../../../../reference/api.ts";
import { catalog, entryIcon, groupTitles } from "../catalog.ts";
import { orderedEntries } from "../render.ts";
import { guidePath, pageLink, playgroundPath, referencePath } from "../page-link.ts";
import { flattenMembers } from "../reference-model.ts";
import { field, type Field } from "./fuzzy.ts";

// The pages a result can come from, in the order their groups show.
export const searchPages = ["Guide", "Reference", "Playground"] as const;
export type SearchPage = (typeof searchPages)[number];

export interface SearchEntry {
  page: SearchPage;
  section: string;
  href: string;
  icon: string;
  title: Field;
  summary: Field;
  keywords: Field;
}

// Built once when the palette loads. Every page's entries are here, so a search never walks the DOM.
export function buildSearchIndex(): SearchEntry[] {
  return [...guideSections(), ...guideDemos(), ...referenceEntries(), playgroundEntry()];
}

function guideSections(): SearchEntry[] {
  return orderedEntries.map((entry) => ({
    page: "Guide",
    section: groupTitles[entry.group].label,
    href: pageLink(guidePath, entry.id),
    icon: entryIcon(entry.id),
    title: field(entry.name),
    summary: field(entry.summary),
    keywords: field(bulletText(entry)),
  }));
}

function guideDemos(): SearchEntry[] {
  return api.flatMap((entry) =>
    (catalog[entry.id]?.demos ?? []).map((demo) => ({
      page: "Guide" as const,
      section: entry.name,
      href: pageLink(guidePath, demo.id),
      icon: entryIcon(entry.id),
      title: field(demo.title),
      summary: field(demo.caption),
      keywords: field(entry.name),
    })),
  );
}

function referenceEntries(): SearchEntry[] {
  return api.map((entry) => ({
    page: "Reference",
    section: groupTitles[entry.group].label,
    href: pageLink(referencePath, entry.id),
    icon: entryIcon(entry.id),
    title: field(entry.name),
    summary: field(entry.summary),
    keywords: field(referenceKeywords(entry)),
  }));
}

function playgroundEntry(): SearchEntry {
  return {
    page: "Playground",
    section: "Editor",
    href: playgroundPath,
    icon: "terminal",
    title: field("Playground"),
    summary: field("Edit .lucia code and see it run"),
    keywords: field("try run edit code sandbox"),
  };
}

function bulletText(entry: ApiEntry): string {
  return entry.bullets.join(" ");
}

// Signature, bullets and every member name and summary, so a search finds an entry by any of them.
function referenceKeywords(entry: ApiEntry): string {
  const members = flattenMembers(entry.members).flatMap((row) => [row.name, row.summary]);
  return [entry.signature, bulletText(entry), ...members].join(" ");
}
