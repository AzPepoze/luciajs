import { formatWhere } from "../errors/where.ts";
import { bindersOf } from "./codegen-binders.ts";
import type { Expr, Template } from "./types.ts";

export interface GenOptions {
  /** The path shown in runtime errors. */
  file: string;
  /** Dev builds pass each runtime check its location. */
  dev: boolean;
}

/** Module-level declarations and names for one generated module. */
export class GenContext {
  readonly declarations: string[] = [];
  private count = 0;

  constructor(
    readonly id: string,
    private readonly options: GenOptions,
  ) {}

  /** The location of an expression as a string literal, or undefined outside dev builds. */
  whereOf(expr: Expr | undefined): string | undefined {
    if (!this.options.dev || !expr) return undefined;
    return JSON.stringify(formatWhere(this.options.file, expr.line, expr.column));
  }

  /** Declares a lazily parsed template for `html` and returns its name. */
  template(html: string): string {
    const name = `__tpl${this.count++}`;
    const args = `${JSON.stringify(html)}, ${JSON.stringify(this.id)}`;
    this.declarations.push(`const ${name} = __lazyTemplate(${args});`);
    return name;
  }

  /** Expression that clones one template and runs its binders. Needs `__cleanups` and `__leaves` in scope. */
  fragment(template: Template): string {
    const name = this.template(template.html);
    return `__instantiate(${name}(), [\n${bindersOf(template.bindings, this)}\n], __cleanups, __leaves)`;
  }

  /** A render function for a block body. `params` is the parameter list, ending with the cleanups and leaves. */
  body(template: Template, params: string): string {
    return `(${params}) => ${this.fragment(template)}`;
  }
}

/** `, arg` when there is a location argument, otherwise nothing. */
export function trailingArg(arg: string | undefined): string {
  return arg === undefined ? "" : `, ${arg}`;
}
