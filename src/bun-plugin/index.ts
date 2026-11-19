import { compile, LuciaError } from "@compiler/index.ts";
import { formatError } from "@cli/format-error.ts";
import { colorEnabled } from "@cli/color.ts";
import type { BunPlugin } from "bun";
import { setupRaw } from "./raw.ts";

export interface LuciaPluginOptions {
  /** Dev builds keep runtime error locations and an inline source map. Default false. */
  dev?: boolean;
}

export function lucia({ dev = false }: LuciaPluginOptions = {}): BunPlugin {
	return {
		name: "lucia",
		setup(build) {
			build.onLoad({ filter: /\.lucia$/ }, async ({ path }) => {
				const source = await Bun.file(path).text();
				try {
					const { code, map } = compile(source, path, { dev });
					return { contents: dev ? withInlineMap(code, map) : code, loader: "ts" };
				} catch (error) {
					if (error instanceof LuciaError) throw new Error(formatError(error, source, colorEnabled()));
					throw error;
				}
			});
			setupRaw(build);
		},
	};
}

function withInlineMap(code: string, map: string): string {
	const encoded = Buffer.from(map).toString("base64");
	return `${code}\n//# sourceMappingURL=data:application/json;base64,${encoded}`;
}

export default lucia;
