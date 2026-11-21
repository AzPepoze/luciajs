import { runtimeError } from "../../errors.ts";

/** The `more` options of WHEN.DETACH. `keepSpace` keeps the space the element holds until it is removed. */
export interface DetachMore {
  keepSpace?: boolean;
}

export interface DetachRead {
  keepSpace: boolean;
}

export const DEFAULT_DETACH: DetachRead = { keepSpace: false };

export function readDetach({ keepSpace }: DetachMore): DetachRead {
  if (keepSpace === undefined) return DEFAULT_DETACH;
  if (typeof keepSpace !== "boolean") throw runtimeError("L2056", { value: String(keepSpace) });
  return { keepSpace };
}
