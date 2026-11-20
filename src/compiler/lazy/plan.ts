import type { ImportStatement, LuciaImport } from "../parse/imports.ts";
import type { LazyOptions, LazyPrefetch } from "./options.ts";
import { onlyInFlow, usedInScript } from "./uses.ts";

/** The import statements of a script, with each split `.lucia` import replaced by a lazy component. */
export function importsWithSplits(
  statements: ImportStatement[],
  markup: string,
  script: string,
  lazy: LazyOptions | undefined,
): string {
  if (!lazy) return statements.map((statement) => statement.text).join("\n");
  const imports = statements.flatMap((statement) => (statement.lucia ? [statement.lucia] : []));
  const split = namesToSplit(lazy, imports, markup, script);
  return statements
    .map((statement) => {
      const item = statement.lucia;
      if (!item || !split.has(item.name)) return statement.text;
      const hasFallback = lazy.childOf(item.specifier).fallback;
      return splitImportCode(item, hasFallback, lazy.prefetch);
    })
    .join("\n");
}

/** The names of the imports to split, under the mode's rule. `<NOLAZY />` files are never split. */
export function namesToSplit(
  lazy: LazyOptions,
  imports: LuciaImport[],
  markup: string,
  script: string,
): Set<string> {
  const names = new Set<string>();
  if (lazy.mode === "off") return names;
  for (const item of imports) {
    if (lazy.childOf(item.specifier).nolazy) continue;
    const flowOnly = onlyInFlow(markup, item.name) && !usedInScript(script, item.name);
    if (lazy.mode === "all" || flowOnly) names.add(item.name);
  }
  return names;
}

/** The code that replaces `import Name from "./Name.lucia"`: a lazy component, with its fallback when the file has one. */
export function splitImportCode(
  item: LuciaImport,
  hasFallback: boolean,
  prefetch: LazyPrefetch,
): string {
  const load = `() => import(${JSON.stringify(item.specifier)})`;
  const mode = JSON.stringify(prefetch);
  if (!hasFallback)
    return `const ${item.name} = __lazyComponent(${load}, undefined, ${mode});`;
  const fallback = `__${item.name}Fallback`;
  const fallbackImport = `import ${fallback} from ${JSON.stringify(`${item.specifier}?fallback`)};`;
  return `${fallbackImport}\nconst ${item.name} = __lazyComponent(${load}, ${fallback}, ${mode});`;
}
