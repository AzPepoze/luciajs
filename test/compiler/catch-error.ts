import { LuciaError } from "@compiler/errors.ts";

/** Runs `run` and returns the LuciaError it throws. Fails the test if it throws anything else or nothing. */
export function catchError(run: () => unknown): LuciaError {
  try {
    run();
  } catch (error) {
    if (error instanceof LuciaError) return error;
    throw error;
  }
  throw new Error("expected a LuciaError");
}
