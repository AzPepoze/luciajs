import { attach, type Instance } from "lucia";
import Cell from "./attach/Cell.lucia";

export function createTarget(tag: string): HTMLElement {
  const target = document.createElement(tag);
  document.body.append(target);
  return target;
}

export function attachCells(target: Element, total: number): Instance[] {
  const instances: Instance[] = [];
  for (let i = 0; i < total; i++) instances.push(attach(Cell, target));
  return instances;
}

export function detachCells(instances: Instance[]): void {
  for (const instance of instances) instance.detach();
}
