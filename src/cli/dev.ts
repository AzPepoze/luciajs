import { resolve } from "node:path";
import { stripAnsi } from "./color.ts";
import { entryPath } from "./bundle.ts";
import { buildDev } from "./dev-build.ts";
import { createDevServer, type DevServer } from "./dev-server.ts";
import { createLogger, type Logger } from "./log.ts";
import { watchFolder } from "./watch.ts";

export interface DevOptions {
  dir: string;
  port: number;
}

export interface DevHandle {
  url: URL;
  stop(): void;
}

export async function startDev({ dir, port }: DevOptions): Promise<DevHandle> {
  const root = resolve(dir);
  const log = createLogger("dev");
  entryPath(root);

  const server = createDevServer({ dir: root, port });
  const rebuild = createRebuild(root, server, log);
  await rebuild.request();

  const watcher = watchFolder(root, (file) => {
    log.info(`changed ${file}`);
    void rebuild.request();
  });
  log.info(`serving ${server.url.href}`);
  return {
    url: server.url,
    stop() {
      watcher.close();
      server.stop();
    },
  };
}

interface Rebuild {
  request(): Promise<void>;
}

/** Runs one build at a time. A request that arrives mid-build triggers one more build after it. */
function createRebuild(root: string, server: DevServer, log: Logger): Rebuild {
  let busy = false;
  let queued = false;

  async function buildAndPublish(): Promise<void> {
    const started = performance.now();
    const result = await buildDev(root);
    if (!result.ok) {
      for (const message of result.messages) process.stderr.write(`${message}\n`);
      server.showError(stripAnsi(result.messages.join("\n\n")));
      return;
    }
    server.publish(result.assets);
    log.info(`rebuilt in ${Math.round(performance.now() - started)} ms`);
  }

  return {
    async request() {
      if (busy) {
        queued = true;
        return;
      }
      busy = true;
      try {
        do {
          queued = false;
          await buildAndPublish();
        } while (queued);
      } finally {
        busy = false;
      }
    },
  };
}
