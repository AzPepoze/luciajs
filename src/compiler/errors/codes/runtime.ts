import type { ErrorCode } from "../codes.ts";
import { RUNTIME_ANIMATE_CODES } from "./runtime-animate.ts";
import { RUNTIME_ANIMATE_AND_DOM_CODES } from "./runtime-animate-and-dom.ts";

export const RUNTIME_CODES = {
  ...RUNTIME_ANIMATE_CODES,
  ...RUNTIME_ANIMATE_AND_DOM_CODES,
} as const satisfies Record<string, ErrorCode>;
