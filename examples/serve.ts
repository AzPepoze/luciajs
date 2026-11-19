import { lucia } from "lucia/bun-plugin";
import { isAbsolute, resolve, sep } from "node:path";

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

const SOURCE_PREFIX = "/source/";

async function bundle(): Promise<Response> {
  const result = await Bun.build({ entrypoints: [`${dir}/src/main.ts`], plugins: [lucia()] });
  if (!result.success) return new Response(result.logs.join("\n"), { status: 500 });
  return new Response(result.outputs[0], { headers: { "content-type": "text/javascript" } });
}

/** The file under the example folder, or null when the path would leave it. */
function sourceFile(relative: string): Bun.BunFile | null {
  if (relative.includes("..") || isAbsolute(relative)) return null;
  const file = resolve(dir, relative);
  return file.startsWith(`${dir}${sep}`) ? Bun.file(file) : null;
}

async function sourceResponse(relative: string): Promise<Response> {
  const file = sourceFile(relative);
  if (!file || !(await file.exists())) return new Response("not found", { status: 404 });
  return new Response(file, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/") return new Response(indexPage);
    if (pathname === "/main.js") return bundle();
    if (pathname.startsWith(SOURCE_PREFIX)) return sourceResponse(pathname.slice(SOURCE_PREFIX.length));
    return new Response("not found", { status: 404 });
  },
});

console.log(`${name} example: ${server.url}`);
