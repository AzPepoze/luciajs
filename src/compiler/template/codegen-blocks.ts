import type { EachBinding, ForBinding, IfBinding } from "./types.ts";
import type { GenContext } from "./codegen-context.ts";
import { readExpression } from "./codegen-element.ts";

const DEFAULT_ITEM = "__item";
const DEFAULT_INDEX = "__index";

function branchLiteral(test: string | undefined, render: string): string {
  if (test === undefined) return `{ render: ${render} }`;
  return `{ test: () => ${readExpression(test)}, render: ${render} }`;
}

export function ifBinder(binding: IfBinding, ctx: GenContext): string {
  const branches = binding.branches.map((branch) =>
    branchLiteral(branch.test, ctx.body(branch.body, "__cleanups, __leaves")),
  );
  return `(__node, __cleanups, __leaves) => __bindIf(__node, [\n  ${branches.join(",\n  ")}\n], __cleanups, __leaves)`;
}

export function eachBinder(binding: EachBinding, ctx: GenContext): string {
  const item = binding.item ?? DEFAULT_ITEM;
  const index = binding.index ?? DEFAULT_INDEX;
  const render = ctx.body(binding.body, `${item}, ${index}, __cleanups, __leaves`);
  const key = binding.key === undefined ? "" : `key: (${item}, ${index}) => (${binding.key}), `;
  const indexed = binding.index !== undefined;
  return `(__node, __cleanups, __leaves) => __bindEach(__node, {\n  read: () => ${readExpression(binding.list)},\n  render: ${render},\n  ${key}indexed: ${indexed},\n}, __cleanups, __leaves)`;
}

export function forBinder(binding: ForBinding, ctx: GenContext): string {
  const render = ctx.body(binding.body, `${binding.name}, ${DEFAULT_INDEX}, __cleanups, __leaves`);
  const bounds = [
    `from: ${readExpression(binding.from)}`,
    `to: ${readExpression(binding.to)}`,
    `step: ${readExpression(binding.step)}`,
  ];
  return `(__node, __cleanups, __leaves) => __bindFor(__node, () => ({ ${bounds.join(", ")} }), ${render}, __cleanups, __leaves)`;
}
