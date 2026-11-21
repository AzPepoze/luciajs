import { runtimeError } from "../../errors.ts";
import { variable } from "../../variable/variable.ts";
import type { Variable } from "../../variable/variable.ts";
import { REACTIVE } from "../../variable/reactive.ts";
import { currentComponentHost } from "./component.ts";

/** A prop as the component sees it. Writing it sets the parent's variable when the parent bound it. */
export interface Prop<T> {
  value: T;
  get(): T;
  set(next: T): void;
  peek(): T;
  readonly [REACTIVE]: true;
}

export type PropVariables<D> = { readonly [K in keyof D]: Prop<D[K]> };

function readOnlyProp<T>(key: string, read: (() => unknown) | undefined, fallback: T): Prop<T> {
  const computed = variable.compute(() => read?.() ?? fallback);
  const reject = (): never => {
    throw runtimeError("L2058", { prop: key });
  };
  return {
    get value() {
      return computed.value as T;
    },
    set value(_next: T) {
      reject();
    },
    get: () => computed.get() as T,
    set: reject,
    peek: () => computed.peek() as T,
    [REACTIVE]: true,
  };
}

function boundProp<T>(target: Variable<unknown>, fallback: T): Prop<T> {
  const current = (): T => (target.value ?? fallback) as T;
  const write = (next: T): void => {
    target.value = next;
  };
  return {
    get value() {
      return current();
    },
    set value(next: T) {
      write(next);
    },
    get: current,
    set: write,
    peek: () => (target.peek() ?? fallback) as T,
    [REACTIVE]: true,
  };
}

// A passed value is read-only unless the parent binds it with bind-<prop>.
export function props<D extends Record<string, unknown>>(defaults: D): PropVariables<D> {
  const host = currentComponentHost();
  const variables = {} as Record<string, Prop<unknown>>;
  for (const key in defaults) {
    const target = host.bound[key];
    const fallback = defaults[key];
    variables[key] = target
      ? boundProp(target, fallback)
      : readOnlyProp(key, host.props[key], fallback);
  }
  return variables as PropVariables<D>;
}
