import type { Template } from "../types/template.ts";

/** What one component file's markup shares across all its scanners. */
export interface ScanScope {
  components: ReadonlySet<string>;
  contentUsed: boolean;
}

export function isBlank(template: Template): boolean {
  return template.html.trim() === "" && template.bindings.length === 0;
}
