/** An expression from the markup, with the 1-based position of its first character in the .lucia file. */
export interface Expr {
  code: string;
  line: number;
  column: number;
}

export type AttrPart = string | Expr;

export interface AttrBinding {
  name: string;
  parts: AttrPart[];
}

export interface EventBinding {
  type: string;
  expr: Expr;
}

/** `bind={sig}` picks the property by element type; the other two name it explicitly. */
export type BindBinding =
  | { kind: "input"; expr: Expr }
  | { kind: "prop"; prop: string; expr: Expr }
  | { kind: "element"; expr: Expr };

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

export interface TextBinding {
  kind: "text";
  expr: Expr;
}

export interface ElementBinding {
  kind: "element";
  attrs: AttrBinding[];
  events: EventBinding[];
  binds: BindBinding[];
  animate?: Expr;
}

/** `bind-<prop>={variable}` on a component: the prop reads the variable and writes back to it. */
export interface ComponentBind {
  /** The prop name the child declares, such as `value`. */
  prop: string;
  /** The attribute as written, for errors: `bind` or `bind-value`. */
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

/** `<CONTENT />`: where a component renders the children its parent gave it. */
export interface ContentBinding {
  kind: "content";
}

/** `<HTML>{expr}</HTML>`: the value is inserted as HTML, not as text. */
export interface HtmlBinding {
  kind: "html";
  expr: Expr;
}

export interface IfBinding {
  kind: "if";
  branches: Branch[];
}

export interface EachBinding {
  kind: "each";
  list: Expr;
  /** Plain names, not expressions: they are declared as parameters. */
  item?: string;
  index?: string;
  key?: Expr;
  body: Template;
}

export interface ForBinding {
  kind: "for";
  name: string;
  from?: Expr;
  to: Expr;
  step?: Expr;
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
