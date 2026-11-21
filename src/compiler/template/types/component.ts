import type { AttrBinding } from "./attribute.ts";
import type { Expr } from "./expression.ts";
import type { Template } from "./template.ts";

/** `bind-<prop>={variable}` on a component: the prop reads the variable and writes back to it. */
export interface ComponentBind {
  /** The prop name the child declares, such as `value`. */
  prop: string;
  /** The attribute as written, for errors: `bind-value` or `bind-<prop>`. */
  attr: string;
  expr: Expr;
}

export interface ComponentBinding {
  kind: "component";
  name: string;
  props: AttrBinding[];
  binds: ComponentBind[];
  /** The markup between the component's tags, compiled in the parent's scope. Missing when blank. */
  children?: Template;
}
