export type AttrPart = string | { expr: string };

export interface AttrBinding {
  name: string;
  parts: AttrPart[];
}

export interface EventBinding {
  type: string;
  expr: string;
}

/** `bind={sig}` picks the property by element type; the other two name it explicitly. */
export type BindBinding =
  | { kind: "input"; expr: string }
  | { kind: "prop"; prop: string; expr: string }
  | { kind: "element"; expr: string };

export interface Template {
  html: string;
  /** In document order, matching the markers in `html`. */
  bindings: Binding[];
}

export interface Branch {
  /** Missing for ELSE. */
  test?: string;
  body: Template;
}

export interface TextBinding {
  kind: "text";
  expr: string;
}

export interface ElementBinding {
  kind: "element";
  attrs: AttrBinding[];
  events: EventBinding[];
  binds: BindBinding[];
  animate?: string;
}

export interface ComponentBinding {
  kind: "component";
  name: string;
  props: AttrBinding[];
}

export interface IfBinding {
  kind: "if";
  branches: Branch[];
}

export interface EachBinding {
  kind: "each";
  list: string;
  item?: string;
  index?: string;
  key?: string;
  body: Template;
}

export interface ForBinding {
  kind: "for";
  name: string;
  from: string;
  to: string;
  step: string;
  body: Template;
}

export type Binding = TextBinding | ElementBinding | ComponentBinding | IfBinding | EachBinding | ForBinding;
