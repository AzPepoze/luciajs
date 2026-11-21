/** An easing style in ease-in form: f(0) = 0 and f(1) = 1. */
export type EaseStyle = (t: number) => number;

const BACK_OVERSHOOT = 1.70158;
const BOUNCE_N = 7.5625;
const BOUNCE_D = 2.75;

const LINEAR: EaseStyle = (t) => t;
const QUAD: EaseStyle = (t) => t ** 2;
const CUBIC: EaseStyle = (t) => t ** 3;
const QUART: EaseStyle = (t) => t ** 4;
const QUINT: EaseStyle = (t) => t ** 5;
const SINE: EaseStyle = (t) => 1 - Math.cos((t * Math.PI) / 2);
const EXPO: EaseStyle = (t) => (t === 0 ? 0 : 2 ** (10 * t - 10));
const CIRC: EaseStyle = (t) => 1 - Math.sqrt(1 - t * t);
const BACK: EaseStyle = (t) => (BACK_OVERSHOOT + 1) * t ** 3 - BACK_OVERSHOOT * t * t;
const ELASTIC: EaseStyle = (t) => Math.sin(((13 * Math.PI) / 2) * t) * 2 ** (10 * (t - 1));
const BOUNCE: EaseStyle = (t) => 1 - bounceOut(1 - t);

export const STYLE = Object.freeze({
  LINEAR,
  QUAD,
  CUBIC,
  QUART,
  QUINT,
  SINE,
  EXPO,
  CIRC,
  BACK,
  ELASTIC,
  BOUNCE,
} as const);

function bounceOut(t: number): number {
  if (t < 1 / BOUNCE_D) return BOUNCE_N * t * t;
  if (t < 2 / BOUNCE_D) return BOUNCE_N * (t -= 1.5 / BOUNCE_D) * t + 0.75;
  if (t < 2.5 / BOUNCE_D) return BOUNCE_N * (t -= 2.25 / BOUNCE_D) * t + 0.9375;
  return BOUNCE_N * (t -= 2.625 / BOUNCE_D) * t + 0.984375;
}
