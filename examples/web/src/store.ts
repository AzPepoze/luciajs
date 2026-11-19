import { signal } from "lucia";

export type Theme = "light" | "dark";

export const theme = signal<Theme>("light");
export const clicks = signal(0);
