export const RENAMED_EXPORTS: ReadonlyMap<string, string> = new Map([
  [
    "ACTIVE",
    "ACTIVE was renamed to WHEN. ACTIVE.IN is now WHEN.ATTACH, and ACTIVE.OUT is now WHEN.DETACH.",
  ],
  ["CURVE", "CURVE was renamed to EASE.STYLE."],
  ["TRANSITION", "TRANSITION was renamed to EASE.STYLE."],
  [
    "store",
    "store was renamed to variable. Use variable.compute() for store.from() and variable.autoRun() for store.onUpdate().",
  ],
  ["signal", "signal was renamed to variable."],
  ["computed", "computed was renamed to variable.compute."],
  ["effect", "effect was renamed to variable.autoRun."],
  ["batch", "batch was removed. Use .peek() to read a variable without tracking it."],
  ["untrack", "untrack was removed. Use .peek() to read a variable without tracking it."],
]);
