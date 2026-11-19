import { watch } from "node:fs";
import { sep } from "node:path";

const DEBOUNCE_MS = 50;

export interface Watcher {
  close(): void;
}

/** Calls `onChange` with the changed file (relative to `dir`) once changes settle. */
export function watchFolder(dir: string, onChange: (file: string) => void): Watcher {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastFile = "";
  const watcher = watch(dir, { recursive: true }, (_event, file) => {
    if (!file || isIgnored(file)) return;
    lastFile = file;
    clearTimeout(timer);
    timer = setTimeout(() => onChange(lastFile), DEBOUNCE_MS);
  });
  return {
    close() {
      clearTimeout(timer);
      watcher.close();
    },
  };
}

export function isIgnored(file: string): boolean {
  return file.split(sep).some((part) => part === "node_modules" || part.startsWith("."));
}
