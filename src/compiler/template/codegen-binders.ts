import type { GenContext } from "./codegen-context.ts";
import { elementBinder, getterObject, readExpression } from "./codegen-element.ts";
import { eachBinder, forBinder, ifBinder } from "./codegen-blocks.ts";
import type { Binding, ComponentBinding, HtmlBinding, TextBinding } from "./types.ts";

function textBinder({ expr }: TextBinding): string {
  return `(__node, __cleanups) => __bindText(__node, () => ${readExpression(expr)}, __cleanups)`;
}

/** The children, when given, are a slot: a render in the parent's scope that the component places with CONTENT. */
function componentBinder({ name, props, children }: ComponentBinding, ctx: GenContext): string {
  const slot = children === undefined ? "" : `, ${ctx.body(children, "__cleanups, __leaves")}`;
  return `(__node, __cleanups, __leaves) => __bindComponent(__node, ${name}, ${getterObject(props)}, __cleanups, __leaves${slot})`;
}

function contentBinder(): string {
  return "(__node, __cleanups, __leaves) => __bindContent(__node, __host.content, __cleanups, __leaves)";
}

function htmlBinder({ expr }: HtmlBinding): string {
  return `(__node, __cleanups) => __bindHtml(__node, () => ${readExpression(expr)}, __cleanups)`;
}

function binderOf(binding: Binding, ctx: GenContext): string {
  switch (binding.kind) {
    case "text":
      return textBinder(binding);
    case "html":
      return htmlBinder(binding);
    case "element":
      return elementBinder(binding, ctx);
    case "component":
      return componentBinder(binding, ctx);
    case "content":
      return contentBinder();
    case "if":
      return ifBinder(binding, ctx);
    case "each":
      return eachBinder(binding, ctx);
    case "for":
      return forBinder(binding, ctx);
  }
}

/** One binder per binding, in document order, as the body of an array literal. */
export function bindersOf(bindings: Binding[], ctx: GenContext): string {
  return bindings.map((binding) => binderOf(binding, ctx)).join(",\n");
}
