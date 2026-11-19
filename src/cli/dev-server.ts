import type { ServerWebSocket } from "bun";
import { assetKey, type Assets } from "./dev-build.ts";
import { RELOAD_PATH } from "./reload-client.ts";
import { publicFile } from "./public.ts";

export interface DevServerOptions {
  dir: string;
  port: number;
}

export interface DevServer {
  readonly url: URL;
  publish(assets: Assets): void;
  showError(message: string): void;
  stop(): void;
}

type Socket = ServerWebSocket<unknown>;

export function createDevServer({ dir, port }: DevServerOptions): DevServer {
  let assets: Assets = new Map();
  let error: string | null = null;
  const sockets = new Set<Socket>();

  const server = Bun.serve({
    port,
    fetch(request, instance) {
      if (new URL(request.url).pathname === RELOAD_PATH) {
        return instance.upgrade(request) ? undefined : new Response("expected a websocket", { status: 400 });
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
      message() {},
    },
  });

  async function respond(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    const asset = assets.get(assetKey(pathname));
    if (asset) return new Response(asset);
    const file = publicFile(dir, pathname);
    if (file && (await file.exists())) return new Response(file);
    return new Response("not found", { status: 404 });
  }

  function broadcast(message: object): void {
    const text = JSON.stringify(message);
    for (const socket of sockets) socket.send(text);
  }

  return {
    url: new URL(`http://localhost:${server.port}/`),
    publish(next) {
      assets = next;
      error = null;
      broadcast({ type: "reload" });
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
