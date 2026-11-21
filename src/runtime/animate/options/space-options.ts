import { runtimeError } from "../../errors.ts";

/** The `more` options of WHEN.ATTACH and WHEN.DETACH. `animateSpace` slides the siblings into the space the element takes or frees. */
export interface SpaceMore {
  animateSpace?: boolean;
}

export interface SpaceRead {
  animateSpace: boolean;
}

export const DEFAULT_SPACE: SpaceRead = { animateSpace: false };

export function readSpace({ animateSpace }: SpaceMore): SpaceRead {
  if (animateSpace === undefined) return DEFAULT_SPACE;
  if (typeof animateSpace !== "boolean") {
    throw runtimeError("L2056", { value: String(animateSpace) });
  }
  return { animateSpace };
}
