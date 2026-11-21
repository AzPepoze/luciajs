import type { HotBuilder, HotModule } from "../build/hot-build.ts";

type HotPlan = { ok: true; modules: HotModule[] } | { ok: false; messages: string[] };

export async function buildHotModules(hotBuilder: HotBuilder, paths: string[]): Promise<HotPlan> {
  const modules: HotModule[] = [];
  for (const path of paths) {
    const built = await hotBuilder.build(path);
    if (!built.ok) return { ok: false, messages: built.messages };
    modules.push(built.module);
  }
  return { ok: true, modules };
}
