#!/usr/bin/env bun
import { parseCommand, UsageError } from "./args.ts";
import { runBuild } from "./build.ts";
import { startDev } from "./dev.ts";
import { createLogger } from "./log.ts";
import { USAGE } from "./usage.ts";

async function main(argv: string[]): Promise<number> {
  try {
    const command = parseCommand(argv, process.env);
    if (command.name === "help") {
      process.stdout.write(USAGE);
      return 0;
    }
    if (command.name === "build") return runBuild(command);
    await startDev(command);
    return 0;
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`${error.message}\n\n${USAGE}`);
      return 1;
    }
    createLogger("cli").error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

process.exitCode = await main(Bun.argv.slice(2));
