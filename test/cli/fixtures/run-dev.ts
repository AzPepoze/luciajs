import { startDev } from "../../../src/cli/dev.ts";

const dev = await startDev({ dir: Bun.argv[2]!, port: 0 });
console.log(dev.url.href);
