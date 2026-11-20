export interface PlayFile {
  name: string;
  code: string;
}

/** A problem to show under the preview. Compile errors have a file and a position. Runtime errors have neither. */
export interface PlayError {
  message: string;
  code?: string;
  hint?: string;
  file?: string;
  line?: number;
  column?: number;
}
