const ATTR = /([\w-]+)(?:="([^"]*)")?/g;

export function parseAttrs(raw: string | undefined): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, name, value] of (raw ?? "").matchAll(ATTR)) attrs[name!] = value ?? "";
  return attrs;
}
