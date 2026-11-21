import { UsageError } from "./usage-error.ts";

export function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new UsageError(`invalid port "${value}"`);
  return port;
}

export function parseMaxWarnings(value: string | undefined): number {
  if (value === undefined) return Number.POSITIVE_INFINITY;
  if (!/^\d+$/.test(value))
    throw new UsageError(`invalid max warnings "${value}", use a whole number from 0`);
  return Number(value);
}
