/** An expression from the markup, with the 1-based position of its first character in the .lusia file. */
export interface Expr {
  code: string;
  line: number;
  column: number;
}
