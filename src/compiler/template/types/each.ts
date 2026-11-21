import type { Expr } from "./expression.ts";
import type { Template } from "./template.ts";

export interface EachBinding {
  kind: "each";
  list: Expr;
  /** Plain names, not expressions: they are declared as parameters. */
  item?: string;
  index?: string;
  key?: Expr;
  body: Template;
}
