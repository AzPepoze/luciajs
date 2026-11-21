import { runtimeError } from "../../errors.ts";
import { animateConfig } from "./config-store.ts";

/** The `more` options of WHEN.ATTACH and WHEN.DETACH. `animateSpace` slides the siblings into the space the element takes or frees. */
export interface SpaceMore {
  animateSpace?: boolean;
}

export interface SpaceRead {
  animateSpace: boolean;
}

const LIBRARY_ANIMATE_SPACE = true;

export function readSpace({ animateSpace }: SpaceMore): SpaceRead {
  if (animateSpace === undefined) {
    return { animateSpace: animateConfig().space?.animateSpace ?? LIBRARY_ANIMATE_SPACE };
  }
  if (typeof animateSpace !== "boolean") {
    throw runtimeError("L2056", { value: String(animateSpace) });
  }
  return { animateSpace };
}
