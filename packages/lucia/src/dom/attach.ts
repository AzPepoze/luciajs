export interface Instance {
  root: Element;
  detach(): void;
}

export type Component = (target: Element) => Instance;

export function attach(component: Component, target: Element): Instance {
  return component(target);
}
