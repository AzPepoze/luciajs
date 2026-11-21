import { scriptSection } from "./sections.ts";

export interface LusiaImport {
  name: string;
  specifier: string;
  index: number;
}

const LUSIA_DEFAULT_IMPORT =
  /import\s+([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\}\s*)?from\s*["']([^"'\n]+\.lusia)["']/g;

export function parseLusiaImports(script: string): LusiaImport[] {
  return [...script.matchAll(LUSIA_DEFAULT_IMPORT)].map((match) => ({
    name: match[1] ?? "",
    specifier: match[2] ?? "",
    index: match.index,
  }));
}

export function scriptImports(text: string): LusiaImport[] {
  const script = scriptSection(text);
  return script ? parseLusiaImports(text.slice(script.contentStart, script.contentEnd)) : [];
}

export function findComponentImport(text: string, name: string): LusiaImport | undefined {
  return scriptImports(text).find((item) => item.name === name);
}
