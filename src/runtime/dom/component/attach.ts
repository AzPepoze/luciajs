import type { Component, Instance, Props } from "./component.ts";

export function attach(component: Component, target: Element, props?: Props): Instance {
  return component(target, props);
}
