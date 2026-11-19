export class LuciaError extends Error {
  constructor(message: string, readonly file: string, readonly line: number, readonly column: number) {
    super(`${file}:${line}:${column}: ${message}`);
  }
}
