/** Old export names and the hint shown when a build imports one of them. */
export const RENAMED_EXPORTS: ReadonlyMap<string, string> = new Map([
  [
    "ACTIVE",
    "ACTIVE was renamed to WHEN. ACTIVE.IN is now WHEN.ATTACH, and ACTIVE.OUT is now WHEN.DETACH.",
  ],
  ["CURVE", "CURVE was renamed to EASE.STYLE."],
  ["TRANSITION", "TRANSITION was renamed to EASE.STYLE."],
  ["signal", "signal was renamed to store."],
  ["computed", "computed was renamed to store.from."],
  ["effect", "effect was renamed to store.onUpdate."],
  ["batch", "batch was removed. Use .peek() to read a store without tracking it."],
  ["untrack", "untrack was removed. Use .peek() to read a store without tracking it."],
]);
