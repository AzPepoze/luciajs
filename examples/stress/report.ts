export interface Result {
  name: string;
  value: string;
}

export function timed(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

export function formatMs(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}
