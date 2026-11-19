import { compile } from "@lucia/compiler";
import type { BunPlugin } from "bun";

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
		},
	};
}

export default lucia;
