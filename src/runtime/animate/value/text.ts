import { resolveColor, type Rgba } from "./color.ts";
import { isLength } from "./length.ts";
import { discrete, type Interpolator } from "./interpolator.ts";
import { resolveVars } from "./vars.ts";

/** Literal text, numbers and their units. literals.length is numbers.length + 1. */
interface TextTemplate {
  literals: string[];
  numbers: number[];
  units: string[];
  rounded: boolean[];
}

// Matches colors and words, then numbers with an optional unit.
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

/** How one number tweens: its unit at the start and at the end. Different lengths blend through calc(). */
interface NumberPlan {
  fromUnit: string;
  toUnit: string;
}

function planNumbers(start: TextTemplate, end: TextTemplate): NumberPlan[] | undefined {
  const plans: NumberPlan[] = [];
  for (let i = 0; i < start.units.length; i++) {
    const plan = planNumber(start, end, i);
    if (!plan) return undefined;
    plans.push(plan);
  }
  return plans;
}

/** A bare 0 takes the unit of the other side, so `translateY(0)` tweens to `20px`. */
function planNumber(start: TextTemplate, end: TextTemplate, i: number): NumberPlan | undefined {
  const fromUnit = start.units[i]!;
  const toUnit = end.units[i]!;
  if (fromUnit === toUnit) return { fromUnit, toUnit };
  if (fromUnit === "" && start.numbers[i] === 0) return { fromUnit: toUnit, toUnit };
  if (toUnit === "" && end.numbers[i] === 0) return { fromUnit, toUnit: fromUnit };
  if (isLength(fromUnit) && isLength(toUnit)) return { fromUnit, toUnit };
  return undefined;
}

function formatNumber(value: number, rounded: boolean): string {
  return String(rounded ? Math.round(value) : value);
}

function numberAt(from: number, to: number, plan: NumberPlan, rounded: boolean, t: number): string {
  if (plan.fromUnit === plan.toUnit)
    return formatNumber(from + (to - from) * t, rounded) + plan.fromUnit;
  return `calc(${from * (1 - t)}${plan.fromUnit} + ${to * t}${plan.toUnit})`;
}

export function interpolateText(from: string, to: string, probe?: HTMLElement): Interpolator {
  if (from === to) return () => from;
  const resolvedFrom = resolveVars(probe, from);
  const resolvedTo = resolveVars(probe, to);
  const start = tokenize(resolvedFrom, probe);
  const end = tokenize(resolvedTo, probe);
  const plans = sameLiterals(start, end) ? planNumbers(start, end) : undefined;
  if (!plans) return discrete(resolvedFrom, resolvedTo);
  return (t) => {
    let out = start.literals[0]!;
    for (let i = 0; i < plans.length; i++) {
      out +=
        numberAt(start.numbers[i]!, end.numbers[i]!, plans[i]!, start.rounded[i]!, t) +
        start.literals[i + 1];
    }
    return out;
  };
}
