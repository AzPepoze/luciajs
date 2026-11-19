/** Control-flow tags. They cannot be used as component names. */
export const RESERVED_TAGS: ReadonlySet<string> = new Set(["IF", "ELSEIF", "ELSE", "EACH", "FOR"]);
