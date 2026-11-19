import { resolveColor, type Rgba } from "./color.ts";
import { discrete, type Interpolator } from "./interpolator.ts";
import { resolveVars } from "./vars.ts";

/** Literal text, numbers and their units. literals.length is numbers.length + 1. */
interface TextTemplate {
  literals: string[];
  numbers: number[];
  units: string[];
  rounded: boolean[];
}

// A color or a word (checked as a color), or a number with an optional unit. Colors are normalized to rgba() first.
const TOKEN =
  /(#[0-9a-f]{3,8}\b)|(\b(?:rgba?|hsla?)\([^)]*\))|(\b[a-z]+\b)|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)([a-z]+|%)?/gi;

class TemplateBuilder {
  readonly template: TextTemplate = { literals: [""], numbers: [], units: [], rounded: [] };

  text(value: string): void {
    this.template.literals[this.template.literals.length - 1] += value;
  }

  number(value: number, rounded: boolean, unit = ""): void {
    this.template.numbers.push(value);
    this.template.units.push(unit);
    this.template.rounded.push(rounded);
    this.template.literals.push("");
  }

  color([r, g, b, a]: Rgba): void {
    this.text("rgba(");
    this.number(r, true);
    this.text(", ");
    this.number(g, true);
    this.text(", ");
    this.number(b, true);
    this.text(", ");
    this.number(a, false);
    this.text(")");
  }
}

function tokenize(text: string, probe: HTMLElement | undefined): TextTemplate {
  const builder = new TemplateBuilder();
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const token = match[0];
    const at = match.index!;
    builder.text(text.slice(last, at));
    last = at + token.length;
    if (match[4] !== undefined) builder.number(Number(match[4]), false, match[5] ?? "");
    else addColorOrText(builder, token, probe);
  }
  builder.text(text.slice(last));
  return builder.template;
}

function addColorOrText(
  builder: TemplateBuilder,
  token: string,
  probe: HTMLElement | undefined,
): void {
  const color = resolveColor(token, probe);
  if (color) builder.color(color);
  else builder.text(token);
}

function sameLiterals(a: TextTemplate, b: TextTemplate): boolean {
  return (
    a.literals.length === b.literals.length &&
    a.literals.every((literal, i) => literal === b.literals[i])
  );
}

/** Each number takes one unit. A bare 0 takes the unit of the other side, so `translateY(0)` tweens to `20px`. */
function sharedUnits(start: TextTemplate, end: TextTemplate): string[] | undefined {
  const units: string[] = [];
  for (let i = 0; i < start.units.length; i++) {
    const unit = unitAt(start, end, i);
    if (unit === undefined) return undefined;
    units.push(unit);
  }
  return units;
}

function unitAt(start: TextTemplate, end: TextTemplate, i: number): string | undefined {
  const from = start.units[i]!;
  const to = end.units[i]!;
  if (from === to) return from;
  if (from === "" && start.numbers[i] === 0) return to;
  if (to === "" && end.numbers[i] === 0) return from;
  return undefined;
}

function formatNumber(value: number, rounded: boolean): string {
  return String(rounded ? Math.round(value) : value);
}

export function interpolateText(from: string, to: string, probe?: HTMLElement): Interpolator {
  if (from === to) return () => from;
  const resolvedFrom = resolveVars(probe, from);
  const resolvedTo = resolveVars(probe, to);
  const start = tokenize(resolvedFrom, probe);
  const end = tokenize(resolvedTo, probe);
  const units = sameLiterals(start, end) ? sharedUnits(start, end) : undefined;
  if (!units) return discrete(resolvedFrom, resolvedTo);
  const deltas = end.numbers.map((value, i) => value - start.numbers[i]!);
  return (t) => {
    let out = start.literals[0]!;
    for (let i = 0; i < deltas.length; i++) {
      out +=
        formatNumber(start.numbers[i]! + deltas[i]! * t, start.rounded[i]!) +
        units[i]! +
        start.literals[i + 1];
    }
    return out;
  };
}
