import type { Expr } from "./expression.ts";

export interface TextBinding {
  kind: "text";
  expr: Expr;
}
