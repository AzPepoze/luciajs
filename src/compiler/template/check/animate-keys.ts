import { KeyScan, type UnknownKey } from "./key-scan.ts";
import type { ScriptRange } from "./script-range.ts";

/** Finds the keys the runtime rejects. A name is followed into the script's `const`. */
export function unknownKeysAt(source: string, start: number, script: ScriptRange): UnknownKey[] {
  return new KeyScan(source, script).value(start, 0);
}
