import type { ServerWebSocket } from "bun";
import { assetKey } from "./bundle.ts";
import type { Assets } from "./dev-build.ts";
import { publicFile } from "./public.ts";
import { RELOAD_PATH } from "./reload-client.ts";
import { now } from "./timings.ts";
import type { Update } from "./update.ts";

/** A GET for a path with no file extension is a client route, so it gets index.html (history-API routing). */
export function isPageRoute(method: string, pathname: string): boolean {
  return method === "GET" && !/\.[^/]*$/.test(pathname);
}

export interface DevServerOptions {
  dir: string;
  port: number;
  /** Called with the time from a publish to the page's `ready` report. */
  onReady?: (ms: number) => void;
}

export interface DevServer {
  readonly url: URL;
  publish(assets: Assets, update: Update): void;
  showError(message: string): void;
  stop(): void;
}

type Socket = ServerWebSocket<unknown>;

export function createDevServer({ dir, port, onReady }: DevServerOptions): DevServer {
  let assets: Assets = new Map();
  let error: string | null = null;
  let publishedAt: number | null = null;
  const sockets = new Set<Socket>();

  const server = Bun.serve({
    port,
    fetch(request, instance) {
      if (new URL(request.url).pathname === RELOAD_PATH) {
        return instance.upgrade(request)
          ? undefined
          : new Response("expected a websocket", { status: 400 });
      }
      return respond(request);
    },
    websocket: {
      open(socket) {
        sockets.add(socket);
        if (error !== null) socket.send(JSON.stringify({ type: "error", message: error }));
      },
      close(socket) {
        sockets.delete(socket);
      },
      message(_socket, text) {
        if (!isReadyReport(text) || publishedAt === null) return;
        const ms = now() - publishedAt;
        publishedAt = null;
        onReady?.(ms);
      },
    },
  });

  async function respond(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    const asset = assets.get(assetKey(pathname));
    if (asset) return new Response(asset);
    const file = publicFile(dir, pathname);
    if (file && (await file.exists())) return new Response(file);
    const index = assets.get(assetKey("index.html"));
    if (index && isPageRoute(request.method, pathname)) return new Response(index);
    return new Response("not found", { status: 404 });
  }

  function broadcast(message: object): void {
    const text = JSON.stringify(message);
    for (const socket of sockets) socket.send(text);
  }

  return {
    url: new URL(`http://localhost:${server.port}/`),
    publish(next, update) {
      assets = next;
      error = null;
      const messages =
        update.kind === "reload"
          ? [{ type: "reload" }]
          : update.styles.map((style) => ({ type: "css", id: style.id, css: style.css }));
      if (messages.length === 0) return;
      for (const message of messages) broadcast(message);
      if (sockets.size > 0) publishedAt = now();
    },
    showError(message) {
      error = message;
      broadcast({ type: "error", message });
    },
    stop() {
      sockets.clear();
      server.stop(true);
    },
  };
}

function isReadyReport(text: string | Buffer): boolean {
  try {
    return JSON.parse(String(text)).type === "ready";
  } catch {
    return false;
  }
}
