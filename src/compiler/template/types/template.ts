import type { ComponentBinding } from "./component.ts";
import type { ContentBinding } from "./content.ts";
import type { EachBinding } from "./each.ts";
import type { ElementBinding } from "./element.ts";
import type { Expr } from "./expression.ts";
import type { ForBinding } from "./for.ts";
import type { HtmlBinding } from "./html.ts";
import type { IfBinding } from "./if.ts";
import type { TextBinding } from "./text.ts";

export interface Template {
  html: string;
  /** In document order, matching the markers in `html`. */
  bindings: Binding[];
}

export interface Branch {
  /** Missing for ELSE. */
  test?: Expr;
  body: Template;
}

export type Binding =
  | TextBinding
  | ElementBinding
  | ComponentBinding
  | ContentBinding
  | HtmlBinding
  | IfBinding
  | EachBinding
  | ForBinding;
