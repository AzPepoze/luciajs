import { store } from "lucia";
import type { EditorJump } from "../editor/files.ts";
import type { LiveError } from "../live/types.ts";
import { ENTRY_FILE } from "./names.ts";
import { loadFiles } from "./storage.ts";
import type { PlayFile } from "./types.ts";

export const files = store<PlayFile[]>(loadFiles());
export const active = store(ENTRY_FILE);
export const autoRun = store(true);
export const compileErrors = store<LiveError[]>([]);
export const runtimeErrors = store<LiveError[]>([]);
export const jump = store<EditorJump | null>(null);
export const notice = store("");
export const errors = store.from(() => [...compileErrors.value, ...runtimeErrors.value]);
