import { store, type ReadStore } from "lucia";
import type { EditorFile } from "../editor/files.ts";
import type { LiveBundle, LiveError, LiveRun } from "./types.ts";

const EDIT_DELAY_MS = 300;

export interface DemoSessionOptions {
  /** Shows a built bundle in the preview. */
  show(bundle: LiveBundle): Promise<LiveRun>;
  /** Shows the original demo again. */
  restore(): void;
}

export interface DemoSession {
  files: ReadStore<EditorFile[]>;
  edited: ReadStore<boolean>;
  error: ReadStore<LiveError | null>;
  edit(name: string, code: string): void;
  reset(): void;
  /** Shows an error that happened after a build mounted. */
  report(error: LiveError): void;
}

// Holds the edited files of one demo. Each edit waits 300 ms, then builds and runs the files.
export function createDemoSession(
  originals: EditorFile[],
  options: DemoSessionOptions,
): DemoSession {
  const files = store(originals);
  const edited = store(false);
  const error = store<LiveError | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Each run takes a number. A run that finishes after a newer one has started is dropped.
  let latest = 0;

  function edit(name: string, code: string): void {
    files.value = files.peek().map((file) => (file.name === name ? { ...file, code } : file));
    edited.value = files.peek().some((file, i) => file.code !== originals[i]?.code);
    clearTimeout(timer);
    timer = setTimeout(rebuild, EDIT_DELAY_MS);
  }

  async function rebuild(): Promise<void> {
    const run = ++latest;
    if (!edited.peek()) {
      error.value = null;
      options.restore();
      return;
    }
    const { buildDemo } = await import("./demo-build.ts");
    if (run !== latest) return;
    const build = buildDemo(files.peek());
    if (!build.bundle) {
      error.value = build.errors[0] ?? null;
      return;
    }
    const result = await options.show(build.bundle);
    if (run !== latest) return;
    error.value = result.ok ? null : result.error;
  }

  function reset(): void {
    clearTimeout(timer);
    latest++;
    files.value = originals;
    edited.value = false;
    error.value = null;
    options.restore();
  }

  function report(next: LiveError): void {
    error.value = next;
  }

  return { files, edited, error, edit, reset, report };
}
