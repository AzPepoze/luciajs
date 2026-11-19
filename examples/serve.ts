import { lucia } from "lucia/bun-plugin";

const name = Bun.argv[2];
if (!name) {
  console.error("usage: bun examples/serve.ts <name>");
  process.exit(1);
}

const dir = `${import.meta.dir}/${name}`;
const indexPage = Bun.file(`${dir}/index.html`);
if (!(await indexPage.exists())) {
  console.error(`no example named "${name}" (missing ${dir}/index.html)`);
  process.exit(1);
}

async function bundle(): Promise<Response> {
  const result = await Bun.build({ entrypoints: [`${dir}/src/main.ts`], plugins: [lucia()] });
  if (!result.success) return new Response(result.logs.join("\n"), { status: 500 });
  return new Response(result.outputs[0], { headers: { "content-type": "text/javascript" } });
}

function routeOf(request: Request): string {
  return new URL(request.url).pathname;
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch(request) {
    if (routeOf(request) === "/main.js") return bundle();
    return new Response(indexPage);
  },
});

console.log(`${name} example: ${server.url}`);
