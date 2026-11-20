import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseLusiaImports } from "@language/imports.ts";
import { parsePropDefs, type PropDef } from "@language/props.ts";
import { scriptSection } from "@language/sections.ts";

/** The props a component declares, or undefined when its file cannot be read. */
export function declaredProps(
  documentPath: string,
  text: string,
  name: string,
): PropDef[] | undefined {
  const section = scriptSection(text);
  if (!section) return undefined;
  const script = text.slice(section.contentStart, section.contentEnd);
  const found = parseLusiaImports(script).find((item) => item.name === name);
  if (!found) return undefined;
  const path = resolve(dirname(documentPath), found.specifier);
  if (!existsSync(path)) return undefined;
  return parsePropDefs(readFileSync(path, "utf8"));
}

/** A lookup that reads each imported component once. */
export function childPropsLookup(
  documentPath: string,
  text: string,
): (name: string) => PropDef[] | undefined {
  const cache = new Map<string, PropDef[] | undefined>();
  return (name) => {
    if (!cache.has(name)) cache.set(name, declaredProps(documentPath, text, name));
    return cache.get(name);
  };
}
