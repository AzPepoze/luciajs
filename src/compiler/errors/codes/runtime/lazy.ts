import type { ErrorCode } from "../../codes.ts";

export const RUNTIME_LAZY_CODES = {
  L2057: {
    message: "lazy component failed to load: $message",
    hint: "Check the import path, and that the file builds. The fallback stays on the page.",
  },
  L2059: {
    message: "lazy() was removed",
    hint: "Import the component normally. It loads later by itself. Put its loading view in a <FALLBACK> block in that file.",
  },
} as const satisfies Record<string, ErrorCode>;
