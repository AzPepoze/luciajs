import { lucia } from "@lucia/bun-plugin";

const root = import.meta.dir;

async function bundle(): Promise<Response> {
  const result = await Bun.build({ entrypoints: [`${root}/src/main.ts`], plugins: [lucia()] });
  if (!result.success) return new Response(result.logs.join("\n"), { status: 500 });
  return new Response(result.outputs[0], { headers: { "content-type": "text/javascript" } });
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/main.js") return bundle();
    return new Response(Bun.file(`${root}/index.html`));
  },
});

console.log(`basic example: ${server.url}`);
