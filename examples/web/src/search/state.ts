import { store } from "lucia";

// Whether the palette is open. The topbar box, the backdrop and the shortcuts all read this one store.
export const searchOpen = store(false);

export function openSearch(): void {
  searchOpen.value = true;
}

export function closeSearch(): void {
  searchOpen.value = false;
}
