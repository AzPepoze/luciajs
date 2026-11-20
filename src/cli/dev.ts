import { resolve } from "node:path";
import type { LazySettings } from "@bun-plugin/children.ts";
import { colorEnabled, stripAnsi } from "./color.ts";
import { entryPath } from "./bundle.ts";
import { buildDev } from "./dev-build.ts";
import { createDevServer, type DevServer } from "./dev-server.ts";
import { createHotBuilder, type HotBuilder, type HotModule } from "./hot-build.ts";
import { createLogger, type Logger } from "./log.ts";
import { formatBrowserReady, formatRebuild, now, type Steps } from "./timings.ts";
import { chooseUpdate, describeUpdate, RELOAD, type Update } from "./update.ts";
import { watchFolder } from "./watch.ts";

export interface DevOptions {
  dir: string;
  port: number;
  /** Hides the timing lines. Errors and file changes still show. */
  quiet?: boolean;
  lazy: LazySettings;
}

export interface DevHandle {
  url: URL;
  stop(): void;
}

export async function startDev({ dir, port, quiet = false, lazy }: DevOptions): Promise<DevHandle> {
  const root = resolve(dir);
  const log = createLogger("dev");
  entryPath(root);

  const server = createDevServer({
    dir: root,
    port,
    onReady: (ms) => {
      if (!quiet) log.info(formatBrowserReady(ms, colorEnabled()));
    },
  });
  const rebuild = createRebuild(root, server, log, quiet, lazy);
  await rebuild.request({ files: [], waitMs: 0 });

  const watcher = watchFolder(root, (files, waitMs) => {
    log.info(`changed ${files.join(", ")}`);
    void rebuild.request({ files, waitMs });
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

interface Change {
  files: string[];
  waitMs: number;
}

interface Rebuild {
  request(change: Change): Promise<void>;
}

type HotPlan = { ok: true; modules: HotModule[] } | { ok: false; messages: string[] };

/** Runs one build at a time. Changes that arrive mid-build are merged and built next. */
function createRebuild(
  root: string,
  server: DevServer,
  log: Logger,
  quiet: boolean,
  lazy: LazySettings,
): Rebuild {
  let busy = false;
  let pending: Change | null = null;
  // After a failed build the page may hold code the failed build never published, so the next success reloads.
  let needsReload = false;
  const hotBuilder: HotBuilder = createHotBuilder();

  /** Builds each changed component as its own module. Any build error stops the update. */
  async function buildHotModules(paths: string[]): Promise<HotPlan> {
    const modules: HotModule[] = [];
    for (const path of paths) {
      const built = await hotBuilder.build(path);
      if (!built.ok) return { ok: false, messages: built.messages };
      modules.push(built.module);
    }
    return { ok: true, modules };
  }

  function report(messages: string[]): void {
    for (const message of messages) process.stderr.write(`${message}\n`);
    server.showError(stripAnsi(messages.join("\n\n")));
    needsReload = true;
  }

  async function buildAndPublish(change: Change): Promise<void> {
    const started = now();
    const build = await buildDev(root, lazy);
    if (!build.ok) return report(build.messages);
    const planned: Update = needsReload ? RELOAD : chooseUpdate(change.files, build.changes);
    let update = planned;
    let modules: HotModule[] = [];
    if (planned.kind === "hot") {
      const plan = await buildHotModules(planned.paths);
      if (!plan.ok) return report(plan.messages);
      // A module that copies other files cannot share their state with the page, so it reloads.
      if (plan.modules.every((module) => module.onlyComponents)) modules = plan.modules;
      else update = RELOAD;
    }
    needsReload = false;
    const sendStart = now();
    server.publish(build.assets, update, modules);
    if (!quiet) {
      const steps: Steps = { ...build.steps, wait: change.waitMs, send: now() - sendStart };
      steps.total = now() - started;
      log.info(formatRebuild(steps, describeUpdate(update), colorEnabled()));
    }
  }

  return {
    async request(change) {
      pending = mergeChange(pending, change);
      if (busy) return;
      busy = true;
      try {
        while (pending) {
          const next = pending;
          pending = null;
          await buildAndPublish(next);
        }
      } finally {
        busy = false;
      }
    },
  };
}

function mergeChange(pending: Change | null, change: Change): Change {
  if (!pending) return change;
  return { files: [...new Set([...pending.files, ...change.files])], waitMs: change.waitMs };
}
