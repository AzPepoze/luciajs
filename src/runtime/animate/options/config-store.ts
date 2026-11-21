import type { AnimateConfig } from "./config.ts";

// Written only by setAnimateConfig. Kept apart from config.ts so the readers can import it without a cycle.
let configured: AnimateConfig = {};

export function animateConfig(): AnimateConfig {
  return configured;
}

export function storeAnimateConfig(config: AnimateConfig): void {
  configured = config;
}
