import type { ServerWebSocket } from "bun";
import { assetKey } from "../build/bundle.ts";
import type { Assets } from "../build/dev-build.ts";
import type { HotModule } from "../build/hot-build.ts";
import { publicFile } from "../build/public.ts";
import { RELOAD_PATH } from "./reload-client.ts";
import { now } from "../build/timings.ts";
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
  /** Replaces the app and sends `update` to every page. `modules` are the built hot modules of a hot update. */
  publish(assets: Assets, update: Update, modules?: HotModule[]): void;
  showError(message: string): void;
  stop(): void;
}

type Socket = ServerWebSocket<unknown>;

// Hot modules are needed only until the page has imported them, so the oldest are dropped.
const MAX_HOT_MODULES = 50;

export function createDevServer({ dir, port, onReady }: DevServerOptions): DevServer {
  let assets: Assets = new Map();
  const hotModules = new Map<string, Blob>();
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
    const hot = hotModules.get(pathname);
    if (hot) return new Response(hot, { headers: { "content-type": "text/javascript" } });
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

  function keepHotModule({ url, body }: HotModule): void {
    hotModules.set(url, body);
    if (hotModules.size > MAX_HOT_MODULES) hotModules.delete(hotModules.keys().next().value!);
  }

  function messagesFor(update: Update, modules: HotModule[]): object[] {
    if (update.kind === "reload") return [{ type: "reload" }];
    const styles = update.styles.map((style) => ({ type: "css", id: style.id, css: style.css }));
    if (update.kind === "styles") return styles;
    return [...modules.map(({ url }) => ({ type: "hot", url })), ...styles];
  }

  return {
    url: new URL(`http://localhost:${server.port}/`),
    publish(next, update, modules = []) {
      assets = next;
      error = null;
      for (const module of modules) keepHotModule(module);
      const messages = messagesFor(update, modules);
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
