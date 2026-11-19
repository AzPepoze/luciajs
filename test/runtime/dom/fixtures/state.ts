import { store } from "lucia";

export interface Item {
  id: number;
  title: string;
}

/** Shared by the block and bind fixtures. Tests reset it in beforeEach. */
export const state = {
  count: store(0),
  text: store("hi"),
  checked: store(false),
  number: store<number | null>(3),
  choice: store("a"),
  disabled: store(false),
  ref: store<Element | null>(null),
  mode: store("a"),
  items: store<Item[]>([]),
  picked: store<number | null>(null),
  from: store(0),
  to: store(3),
  step: store(1),
  groups: store<{ name: string; open: boolean; items: string[] }[]>([]),
};

export function resetStore(): void {
  state.count.value = 0;
  state.text.value = "hi";
  state.checked.value = false;
  state.number.value = 3;
  state.choice.value = "a";
  state.disabled.value = false;
  state.ref.value = null;
  state.mode.value = "a";
  state.items.value = [];
  state.picked.value = null;
  state.from.value = 0;
  state.to.value = 3;
  state.step.value = 1;
  state.groups.value = [];
}
