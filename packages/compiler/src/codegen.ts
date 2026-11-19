export interface ComponentParts {
  script: string;
  markup: string;
  css: string;
  scope: string;
}

const RUNTIME_IMPORT = `import { injectStyle as __injectStyle } from "lucia/internal";`;

function templateFactory(markup: string, scope: string): string {
  return `let __template: HTMLTemplateElement | undefined;
function __getTemplate(): HTMLTemplateElement {
  if (__template) return __template;
  __template = document.createElement("template");
  __template.innerHTML = ${JSON.stringify(markup)};
  for (const el of __template.content.querySelectorAll("*")) el.setAttribute(${JSON.stringify(scope)}, "");
  return __template;
}`;
}

function componentFunction(scope: string): string {
  return `export default function component(target: Element) {
  __injectStyle(${JSON.stringify(scope)}, __css);
  const fragment = __getTemplate().content.cloneNode(true) as DocumentFragment;
  const nodes = [...fragment.childNodes];
  target.append(fragment);
  const cleanup = typeof setup === "function" ? setup(target) : undefined;
  return {
    root: target,
    destroy() {
      if (typeof cleanup === "function") cleanup();
      for (const node of nodes) node.remove();
    },
  };
}`;
}

export function generate({ script, markup, css, scope }: ComponentParts): string {
  return [
    script,
    RUNTIME_IMPORT,
    `const __css = ${JSON.stringify(css)};`,
    templateFactory(markup, scope),
    componentFunction(scope),
  ].join("\n");
}
