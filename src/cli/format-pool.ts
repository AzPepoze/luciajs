import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import { formatFailure, formatFile, type FormatResult } from "./format-file.ts";

const WORKER = new URL("./format-worker.ts", import.meta.url);
const MAX_WORKERS = 4;
const MIN_PARALLEL = 200;
const FILES_PER_WORKER = 200;

/** Formats the files on a worker pool when there are enough of them, else one by one. */
export async function formatFiles(
  files: readonly string[],
  workers = workerCount(files.length),
): Promise<FormatResult[]> {
  return workers < 2 ? serial(files) : pool(files, workers);
}

async function serial(files: readonly string[]): Promise<FormatResult[]> {
  const results: FormatResult[] = [];
  for (const file of files) results.push(await one(file));
  return results;
}

async function one(file: string): Promise<FormatResult> {
  try {
    return await formatFile(file);
  } catch (error) {
    return formatFailure(file, error);
  }
}

function workerCount(files: number): number {
  if (files < MIN_PARALLEL) return 1;
  const cpus = availableParallelism();
  if (cpus < 2) return 1;
  const byFiles = Math.ceil(files / FILES_PER_WORKER);
  return Math.max(2, Math.min(MAX_WORKERS, cpus, byFiles));
}

function pool(
  files: readonly string[],
  count: number,
): Promise<FormatResult[]> {
  const results: Array<FormatResult | undefined> = new Array(files.length);
  const current = new Map<Worker, number>();
  const workers: Worker[] = [];
  let next = 0;
  let finished = 0;
  let closed = false;

  return new Promise((resolve) => {
    const collect = (): void => {
      closed = true;
      void Promise.all(workers.map((worker) => worker.terminate())).then(() =>
        resolve(results as FormatResult[]),
      );
    };
    const finish = (): void => {
      if (finished === files.length) collect();
    };
    const dispatch = (worker: Worker): void => {
      if (closed || next >= files.length) return;
      const index = next++;
      current.set(worker, index);
      worker.postMessage(files[index]);
    };
    // A crashed worker falls back to the files that have no result yet, so no file is skipped.
    const fallback = (): void => {
      if (closed) return;
      closed = true;
      void Promise.all(workers.map((worker) => worker.terminate())).then(() =>
        serialMissing(files, results).then(resolve),
      );
    };
    const spawn = (): void => {
      const worker = new Worker(WORKER);
      workers.push(worker);
      worker.on("message", (result: FormatResult) => {
        const index = current.get(worker);
        if (index === undefined || closed) return;
        current.delete(worker);
        results[index] = result;
        finished++;
        finish();
        dispatch(worker);
      });
      worker.on("error", fallback);
      worker.on("exit", () => {
        if (!closed && finished < files.length) fallback();
      });
      dispatch(worker);
    };
    for (let index = 0; index < count; index++) spawn();
    if (files.length === 0) collect();
  });
}

/** Fills every result the pool did not get, one file at a time. */
async function serialMissing(
  files: readonly string[],
  results: readonly (FormatResult | undefined)[],
): Promise<FormatResult[]> {
  const filled: FormatResult[] = [];
  for (let index = 0; index < files.length; index++) {
    filled.push(results[index] ?? (await one(files[index]!)));
  }
  return filled;
}
