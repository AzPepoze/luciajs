import type { AttrBinding, BindBinding, EventBinding } from "./attribute.ts";
import type { Expr } from "./expression.ts";

export interface ElementBinding {
  kind: "element";
  attrs: AttrBinding[];
  events: EventBinding[];
  binds: BindBinding[];
  animate?: Expr;
}
