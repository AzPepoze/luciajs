import type { Expr } from "./expression.ts";

/** `<HTML>{expr}</HTML>`: the value is inserted as HTML, not as text. */
export interface HtmlBinding {
  kind: "html";
  expr: Expr;
}
