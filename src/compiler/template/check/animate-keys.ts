import { KeyScan, type UnknownKey } from "./key-scan.ts";
import type { ScriptRange } from "./script-range.ts";

/**
 * Finds the keys of an animate value that the runtime would reject. The value starts at `start`
 * in `source`. A name is followed into the script's `const`, so keyframes kept in a variable are checked too.
 */
export function unknownKeysAt(source: string, start: number, script: ScriptRange): UnknownKey[] {
  return new KeyScan(source, script).value(start, 0);
}
