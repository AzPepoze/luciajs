/** Marks a callback as a component's setup hook. Returns it unchanged. */
export function setup<T>(hook: T): T {
  return hook;
}
