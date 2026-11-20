import { store } from "lucia";
import type { Bundle } from "./bundle.ts";
import { Preview } from "./preview.ts";
import { loadRuntime } from "./runtime-source.ts";
import { saveFiles } from "./storage.ts";
import { autoRun, compileErrors, files, hasSass, runtimeErrors } from "./state.ts";

const DEBOUNCE_MS = 300;

let preview: Preview | undefined;
let timer = 0;
let runNumber = 0;

/** Starts the live preview for the page. Stops when the signal aborts. */
export function mountPlayground(stage: HTMLElement, signal: AbortSignal): void {
  if (signal.aborted) return;
  preview = new Preview(stage, (message) => {
    runtimeErrors.value = [{ message }];
  });
  const stop = store.onUpdate(() => {
    saveFiles(files.value);
    if (autoRun.value) scheduleRun();
  });
  if (!autoRun.peek()) void runNow();
  signal.addEventListener(
    "abort",
    () => {
      stop();
      window.clearTimeout(timer);
      preview?.destroy();
      preview = undefined;
    },
    { once: true },
  );
}

/** Runs the files now. A newer run makes an older one stop early. */
export async function runNow(): Promise<void> {
  window.clearTimeout(timer);
  const id = ++runNumber;
  const { buildBundle } = await import("./bundle.ts");
  const result = buildBundle(files.peek());
  if (id !== runNumber) return;
  compileErrors.value = result.errors;
  hasSass.value = result.hasSass;
  if (result.bundle && preview) await showBundle(id, result.bundle, preview);
}

function scheduleRun(): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => void runNow(), DEBOUNCE_MS);
}

// On failure the last good preview stays, and the error is listed under it.
async function showBundle(id: number, bundle: Bundle, target: Preview): Promise<void> {
  try {
    const runtime = await loadRuntime();
    if (id !== runNumber) return;
    await target.show({ ...bundle, runtime });
    if (id === runNumber) runtimeErrors.value = [];
  } catch (error) {
    if (id === runNumber) runtimeErrors.value = [{ message: messageOf(error) }];
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
