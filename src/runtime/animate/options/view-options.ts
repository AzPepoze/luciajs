import { runtimeError } from "../../errors.ts";

export interface ViewMore {
  margin?: number | string;
  amount?: number;
  reverse?: boolean;
}

export interface ViewSettings {
  rootMargin: string;
  amount: number;
}

export const DEFAULT_VIEW: ViewSettings = { rootMargin: "0px", amount: 0.15 };

/** A CSS length or percentage, with an optional sign. A bare zero is allowed. */
const CSS_LENGTH = /^(-?(?:\d+\.?\d*|\.\d+))(px|%|em|rem|vw|vh|vmin|vmax)?$/;

export function readViewMore(more: ViewMore): { view: ViewSettings; reverse: boolean } {
  return {
    view: { rootMargin: readMargin(more.margin), amount: readAmount(more.amount) },
    reverse: readReverse(more.reverse),
  };
}

export function sameView(a: ViewSettings, b: ViewSettings): boolean {
  return a.rootMargin === b.rootMargin && a.amount === b.amount;
}

function readReverse(reverse: boolean | undefined): boolean {
  if (reverse === undefined) return false;
  if (typeof reverse !== "boolean") throw runtimeError("L2020", { value: String(reverse) });
  return reverse;
}

// A positive margin shrinks the root box, so it maps to the negated rootMargin.
function readMargin(margin: number | string | undefined): string {
  if (margin === undefined) return DEFAULT_VIEW.rootMargin;
  if (typeof margin === "number") return numberMargin(margin);
  return stringMargin(margin);
}

function numberMargin(margin: number): string {
  if (!Number.isFinite(margin)) throw badMargin(margin);
  return `${-margin}px`;
}

function stringMargin(margin: string): string {
  const match = CSS_LENGTH.exec(margin.trim());
  if (!match) throw badMargin(margin);
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === undefined && value !== 0) throw badMargin(margin);
  return `${-value}${unit ?? "px"}`;
}

function badMargin(margin: unknown): Error {
  return runtimeError("L2021", { value: String(margin) });
}

function readAmount(amount: number | undefined): number {
  if (amount === undefined) return DEFAULT_VIEW.amount;
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) {
    throw runtimeError("L2022", { value: String(amount) });
  }
  return amount;
}
