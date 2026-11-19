import { markLines } from "../sourcemap/marker.ts";
import { GenContext, type GenOptions } from "./codegen-context.ts";
import type { Template } from "./types.ts";

export interface ComponentParts extends GenOptions {
  imports: string;
  body: string;
  /** The .lucia line where `body` starts. */
  bodyLine: number;
  template: Template;
  css: string;
  id: string;
}

const RUNTIME_IMPORT = `import {
  animate as __animate,
  attr as __attr,
  bindComponent as __bindComponent,
  bindEach as __bindEach,
  bindElement as __bindElement,
  bindFor as __bindFor,
  bindIf as __bindIf,
  bindInput as __bindInput,
  bindProp as __bindProp,
  bindText as __bindText,
  defineComponent as __defineComponent,
  instantiate as __instantiate,
  lazyTemplate as __lazyTemplate,
  listen as __listen,
  toText as __toText,
  unwrap as __unwrap,
  type Cleanup as __Cleanup,
  type Leave as __Leave,
  type Rendered as __Rendered,
} from "lucia/internal";`;

function renderFunction(body: string, bodyLine: number, fragment: string): string {
  return `function __render(__cleanups: __Cleanup[], __leaves: __Leave[]): __Rendered {
${markLines(body, bodyLine)}
  const __fragment = ${fragment};
  return { fragment: __fragment, setup: typeof setup === "function" ? setup : undefined };
}`;
}

/** The generated module, with position markers that `extractSourceMap` removes. */
export function generate({ imports, body, bodyLine, template, css, id, file, dev }: ComponentParts): string {
  const ctx = new GenContext(id, { file, dev });
  const fragment = ctx.fragment(template);
  return [
    imports,
    RUNTIME_IMPORT,
    `const __css = ${JSON.stringify(css)};`,
    ...ctx.declarations,
    renderFunction(body, bodyLine, fragment),
    `export default __defineComponent(${JSON.stringify(id)}, __css, __render);`,
  ].join("\n");
}
