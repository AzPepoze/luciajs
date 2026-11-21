/** Red, green, blue (0..255) and alpha (0..1). */
export type Rgba = [number, number, number, number];

const RGB_FUNCTION = /^rgba?\(/i;
const PERCENT = 100;
const PERCENT_SCALE = 255 / PERCENT;
const probeCache = new Map<string, Rgba | null>();
let probe: HTMLElement | undefined;

/**
 * Hex and rgb() are parsed here. Named colors and hsl() are read from the browser, on `probe` when given.
 */
export function resolveColor(token: string, probe?: HTMLElement): Rgba | null {
  if (token.startsWith("#")) return parseHex(token);
  if (RGB_FUNCTION.test(token)) return parseRgb(token);
  return probeColor(token, probe);
}

function parseHex(token: string): Rgba | null {
  const digits = token.slice(1);
  if (![3, 4, 6, 8].includes(digits.length)) return null;
  const full = digits.length <= 4 ? [...digits].map((c) => c + c).join("") : digits;
  const channel = (index: number): number => parseInt(full.slice(index, index + 2), 16);
  const alpha = full.length === 8 ? channel(6) / 255 : 1;
  return [channel(0), channel(2), channel(4), alpha];
}

function parseRgb(token: string): Rgba | null {
  const inside = token.slice(token.indexOf("(") + 1, -1);
  const parts = inside.split(/[\s,/]+/).filter(Boolean);
  if (parts.length !== 3 && parts.length !== 4) return null;
  const [r, g, b, a] = parts;
  const channels = [
    parseChannel(r!, PERCENT_SCALE),
    parseChannel(g!, PERCENT_SCALE),
    parseChannel(b!, PERCENT_SCALE),
  ];
  const alpha = a === undefined ? 1 : parseChannel(a, 1 / PERCENT);
  if (channels.some(Number.isNaN) || Number.isNaN(alpha)) return null;
  return [channels[0]!, channels[1]!, channels[2]!, alpha];
}

/** `50%` scales by `percentScale`; a plain number is used as it is. */
function parseChannel(part: string, percentScale: number): number {
  if (part.endsWith("%")) return parseFloat(part) * percentScale;
  return parseFloat(part);
}

/** Sets the color on the element for a moment, reads the computed value, and puts the old value back. */
function readComputedColor(token: string, el: HTMLElement): Rgba | null {
  const previous = el.style.color;
  el.style.color = token;
  const value = el.style.color ? getComputedStyle(el).color : "";
  el.style.color = previous;
  return parseComputed(value);
}

/** A color name means the same on every element, so each name is read from the browser once. */
function probeColor(token: string, probe: HTMLElement | undefined): Rgba | null {
  const cached = probeCache.get(token);
  if (cached !== undefined) return cached;
  const resolved = readComputedColor(token, probe ?? sharedProbe());
  probeCache.set(token, resolved);
  return resolved;
}

function sharedProbe(): HTMLElement {
  probe ??= document.body.appendChild(document.createElement("span"));
  return probe;
}

function parseComputed(value: string): Rgba | null {
  if (!value.startsWith("rgb")) return null;
  const numbers = value.match(/[\d.]+/g)?.map(Number);
  if (!numbers || numbers.length < 3) return null;
  return [numbers[0]!, numbers[1]!, numbers[2]!, numbers[3] ?? 1];
}
