import { compile } from "@compiler/index.ts";
import type { BunPlugin } from "bun";
import { setupRaw } from "./raw.ts";

export function lucia(): BunPlugin {
	return {
		name: "lucia",
		setup(build) {
			build.onLoad({ filter: /\.lucia$/ }, async ({ path }) => {
				const source = await Bun.file(path).text();
				return {
					contents: compile(source, path).code,
					loader: "ts",
				};
			});
			setupRaw(build);
		},
	};
}

export default lucia;
