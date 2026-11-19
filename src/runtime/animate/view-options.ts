/** The `more` options of ACTIVE.VIEW. */
export interface ViewMore {
  margin?: number | string;
  amount?: number;
  reverse?: boolean;
}

/** What the shared IntersectionObserver is built from. */
export interface ViewSettings {
  rootMargin: string;
  threshold: number;
}

export const DEFAULT_VIEW: ViewSettings = { rootMargin: "0px", threshold: 0.15 };

/** A CSS length or percentage, with an optional sign. A bare zero is allowed. */
const CSS_LENGTH = /^(-?(?:\d+\.?\d*|\.\d+))(px|%|em|rem|vw|vh|vmin|vmax)?$/;

export function readViewMore(more: ViewMore): { view: ViewSettings; reverse: boolean } {
  return {
    view: { rootMargin: readMargin(more.margin), threshold: readAmount(more.amount) },
    reverse: readReverse(more.reverse),
  };
}

export function sameView(a: ViewSettings, b: ViewSettings): boolean {
  return a.rootMargin === b.rootMargin && a.threshold === b.threshold;
}

function readReverse(reverse: boolean | undefined): boolean {
  if (reverse === undefined) return false;
  if (typeof reverse !== "boolean") throw new Error(`animate more reverse must be true or false, got ${String(reverse)}`);
  return reverse;
}

/**
 * A positive margin is inside the screen edge, so the root box shrinks: it maps to the
 * negated rootMargin. A number is px. A string is a CSS length or percentage.
 */
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
  return new Error(`animate more margin must be a number of px or a CSS length such as "10%", got ${String(margin)}`);
}

function readAmount(amount: number | undefined): number {
  if (amount === undefined) return DEFAULT_VIEW.threshold;
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) {
    throw new Error(`animate more amount must be a number from 0 to 1, got ${String(amount)}`);
  }
  return amount;
}
