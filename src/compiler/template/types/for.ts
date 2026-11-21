import type { Expr } from "./expression.ts";
import type { Template } from "./template.ts";

export interface ForBinding {
  kind: "for";
  name: string;
  from?: Expr;
  to: Expr;
  step?: Expr;
  body: Template;
}
