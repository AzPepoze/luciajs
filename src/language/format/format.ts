import { findSections, type Section } from "../parse/sections.ts";

/** The formatter for one embedded language. The editor and CLI supply Prettier. */
export interface FormatParts {
  script(code: string): Promise<string>;
  style(code: string, plainCss: boolean): Promise<string>;
  markup(markup: string): Promise<string>;
}

/** Formats a .lusia file: script as TypeScript, styles as SCSS or CSS, markup as HTML. Sections keep their order. */
export async function formatLusia(source: string, parts: FormatParts): Promise<string> {
  const blocks: string[] = [];
  let last = 0;
  for (const section of findSections(source)) {
    blocks.push(await formatMarkupBlock(source.slice(last, section.openStart), parts));
    blocks.push(await formatSectionBlock(source, section, parts));
    last = section.end;
  }
  blocks.push(await formatMarkupBlock(source.slice(last), parts));
  return blocks.filter((block) => block !== "").join("\n\n") + "\n";
}

async function formatMarkupBlock(markup: string, parts: FormatParts): Promise<string> {
  return markup.trim() === "" ? "" : parts.markup(markup);
}

async function formatSectionBlock(
  source: string,
  section: Section,
  parts: FormatParts,
): Promise<string> {
  const content = source.slice(section.contentStart, section.contentEnd);
  const code = await formatSectionContent(section, content, parts);
  const open = `<${section.kind}${section.attrs.trimEnd()}>`;
  const close = `</${section.kind}>`;
  return code === "" ? `${open}${close}` : `${open}\n${code}\n${close}`;
}

function formatSectionContent(
  section: Section,
  content: string,
  parts: FormatParts,
): Promise<string> {
  if (section.kind === "script") return parts.script(content);
  return parts.style(content, /\blang\s*=\s*"css"/.test(section.attrs));
}
