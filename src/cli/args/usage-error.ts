export class UsageError extends Error {}

export function withUsageErrors<T>(parse: () => T): T {
  try {
    return parse();
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }
}
