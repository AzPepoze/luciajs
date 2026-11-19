import type { GenContext } from "./codegen-context.ts";
import { elementBinder, getterObject, readExpression } from "./codegen-element.ts";
import { eachBinder, forBinder, ifBinder } from "./codegen-blocks.ts";
import type { Binding, ComponentBinding, TextBinding } from "./types.ts";

function textBinder({ expr }: TextBinding): string {
  return `(__node, __cleanups) => __bindText(__node, () => ${readExpression(expr)}, __cleanups)`;
}

function componentBinder({ name, props }: ComponentBinding): string {
  return `(__node, __cleanups, __leaves) => __bindComponent(__node, ${name}, ${getterObject(props)}, __cleanups, __leaves)`;
}

function binderOf(binding: Binding, ctx: GenContext): string {
  switch (binding.kind) {
    case "text":
      return textBinder(binding);
    case "element":
      return elementBinder(binding);
    case "component":
      return componentBinder(binding);
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
