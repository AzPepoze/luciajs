import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SETTING = /\bindentScriptAndStyle\s*:\s*(true|false)\b/;

/** Reads only `format.indentScriptAndStyle` from a folder's lusia.config, so the editor never has to run the config file. */
export function readIndentSetting(folder: string): boolean {
  const json = join(folder, "lusia.config.json");
  const ts = join(folder, "lusia.config.ts");
  if (existsSync(ts)) return fromTypeScript(readFileSync(ts, "utf8"));
  if (existsSync(json)) return fromJson(readFileSync(json, "utf8"));
  return true;
}

function fromTypeScript(text: string): boolean {
  return SETTING.exec(text)?.[1] !== "false";
}

function fromJson(text: string): boolean {
  try {
    return JSON.parse(text)?.format?.indentScriptAndStyle !== false;
  } catch {
    return true;
  }
}
