import type { AttrBinding, AttrPart, Binding, Template } from "./template.ts";

export interface ComponentParts {
  script: string;
  template: Template;
  css: string;
  scope: string;
}

const RUNTIME_IMPORT = `import {
  attr as __attr,
  bindText as __bindText,
  createTemplate as __createTemplate,
  injectStyle as __injectStyle,
  instantiate as __instantiate,
  toText as __toText,
  unwrap as __unwrap,
  type Binder as __Binder,
  type Cleanup as __Cleanup,
} from "lucia/internal";`;

function readExpression(expr: string): string {
  return `__unwrap((${expr}))`;
}

function attrValue(parts: AttrPart[]): string {
  const [only] = parts;
  if (parts.length === 1 && typeof only !== "string") return readExpression(only!.expr);
  const pieces = parts.map((part) =>
    typeof part === "string" ? JSON.stringify(part) : `__toText(${readExpression(part.expr)})`,
  );
  return pieces.join(" + ");
}

function attrCall({ name, parts }: AttrBinding): string {
  return `__attr(node as Element, ${JSON.stringify(name)}, () => ${attrValue(parts)}, cleanups);`;
}

function binder(binding: Binding): string {
  if (binding.kind === "text") return `(node, cleanups) => __bindText(node, () => ${readExpression(binding.expr)}, cleanups)`;
  return `(node, cleanups) => {\n    ${binding.attrs.map(attrCall).join("\n    ")}\n  }`;
}

function templateFactory(html: string, scope: string): string {
  return `let __template: ReturnType<typeof __createTemplate> | undefined;
const __getTemplate = () => (__template ??= __createTemplate(${JSON.stringify(html)}, ${JSON.stringify(scope)}));`;
}

function bindersList(bindings: Binding[]): string {
  return `const __binders: __Binder[] = [\n  ${bindings.map(binder).join(",\n  ")}\n];`;
}

function componentFunction(scope: string): string {
  return `export default function component(target: Element) {
  __injectStyle(${JSON.stringify(scope)}, __css);
  const cleanups: __Cleanup[] = [];
  const fragment = __instantiate(__getTemplate(), __binders, cleanups);
  const nodes = [...fragment.childNodes];
  target.append(fragment);
  const setupCleanup = typeof setup === "function" ? setup(target) : undefined;
  if (typeof setupCleanup === "function") cleanups.push(setupCleanup);
  return {
    root: target,
    detach() {
      for (const cleanup of cleanups) cleanup();
      for (const node of nodes) node.remove();
    },
  };
}`;
}

export function generate({ script, template, css, scope }: ComponentParts): string {
  return [
    script,
    RUNTIME_IMPORT,
    `const __css = ${JSON.stringify(css)};`,
    templateFactory(template.html, scope),
    bindersList(template.bindings),
    componentFunction(scope),
  ].join("\n");
}
