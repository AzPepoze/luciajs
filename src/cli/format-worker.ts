import { parentPort } from "node:worker_threads";
import { formatFailure, formatFile, type FormatResult } from "./format-file.ts";

/** One formatting worker: formats the files the pool sends, one at a time. */
parentPort?.on("message", (file: string) => {
  formatFile(file)
    .then((result: FormatResult) => parentPort?.postMessage(result))
    .catch((error: unknown) =>
      parentPort?.postMessage(formatFailure(file, error)),
    );
});
