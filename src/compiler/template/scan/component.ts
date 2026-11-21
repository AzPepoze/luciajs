import { componentBindsOf, isBindName } from "../bind.ts";
import type { AttrBinding } from "../types/attribute.ts";
import type { ComponentBinding } from "../types/component.ts";

export function componentBinding(name: string, props: AttrBinding[]): ComponentBinding {
  return {
    kind: "component",
    name,
    props: props.filter((attr) => !isBindName(attr.name)),
    binds: componentBindsOf(props),
  };
}
