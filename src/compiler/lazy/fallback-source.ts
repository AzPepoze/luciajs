import { parse } from "../parse/sections.ts";

/** The fallback module's source: the component's styles, then its FALLBACK markup. No script. */
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
