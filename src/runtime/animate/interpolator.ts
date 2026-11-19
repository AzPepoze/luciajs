/** Gives the value at eased progress t (0..1) between two values. Built once, called every frame. */
export type Interpolator = (t: number) => unknown;

/** Values that cannot blend switch from `from` to `to` at the middle. */
export function discrete(from: unknown, to: unknown): Interpolator {
  return (t) => (t < 0.5 ? from : to);
}
