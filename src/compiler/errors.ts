import type { ErrorCodeName } from "./errors/codes.ts";

export interface LuciaErrorDetails {
  code?: ErrorCodeName;
  hint?: string;
  length?: number;
}

/** A compile or runtime error. Runtime errors have no file, line or column unless the dev build passes one. */
export class LuciaError extends Error {
  readonly code: ErrorCodeName | undefined;
  readonly hint: string | undefined;
  readonly file: string | undefined;
  readonly line: number | undefined;
  readonly column: number | undefined;
  readonly length: number | undefined;

  constructor(message: string, file?: string, line?: number, column?: number, details: LuciaErrorDetails = {}) {
    super(message);
    this.name = "LuciaError";
    this.code = details.code;
    this.hint = details.hint;
    this.file = file;
    this.line = line;
    this.column = column;
    this.length = details.length;
  }
}
