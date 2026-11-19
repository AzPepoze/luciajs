import { toText, type Cleanup } from "../bindings.ts";
import { bindChannel, type Channel } from "./channel.ts";
import { withWhere } from "../../errors.ts";

const CHECKED: Channel = {
  prop: "checked",
  events: ["change"],
  toDom: (value) => Boolean(value),
  fromDom: (el) => (el as HTMLInputElement).checked,
};

/** An empty number field gives null. */
const NUMBER: Channel = {
  prop: "valueAsNumber",
  events: ["input"],
  toDom: (value) => (value == null ? NaN : Number(value)),
  fromDom: (el) => {
    const number = (el as HTMLInputElement).valueAsNumber;
    return Number.isNaN(number) ? null : number;
  },
};

const TEXT: Channel = { prop: "value", events: ["input"], toDom: toText, fromDom: (el) => (el as HTMLInputElement).value };
const SELECT: Channel = { prop: "value", events: ["change"], toDom: toText, fromDom: (el) => (el as HTMLSelectElement).value };

const CHECKABLE = new Set(["checkbox", "radio"]);
const NUMERIC = new Set(["number", "range"]);

function channelFor(el: HTMLElement): Channel {
  if (el.tagName === "SELECT") return SELECT;
  if (el.tagName !== "INPUT") return TEXT;
  const type = (el as HTMLInputElement).type;
  if (CHECKABLE.has(type)) return CHECKED;
  if (NUMERIC.has(type)) return NUMBER;
  return TEXT;
}

/** `bind={sig}` on a form control: the right property and event for its type. */
export function bindInput(el: HTMLElement, target: unknown, cleanups: Cleanup[], where?: string): void {
  withWhere(where, () => bindChannel(el, target, channelFor(el), "bind", cleanups));
}
