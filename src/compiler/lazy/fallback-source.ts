import { parse } from "../parse/sections.ts";

/**
 * The source of a component's fallback module: the file's <style> sections, then its FALLBACK markup.
 * It has no script, and its styles get the same scope as the component.
 */
export function fallbackSource(source: string, file: string): string {
  const parsed = parse(source, file);
  const styles = parsed.styles.map(
    (style) => `<style${attributeText(style.attrs)}>${style.content}</style>`,
  );
  return [...styles, parsed.fallback?.content ?? ""].join("\n");
}

function attributeText(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join("");
}
