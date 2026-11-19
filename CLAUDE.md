# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

LuciaJS: a Bun-native UI framework with single-file `.lucia` components, signals and scoped SCSS.

## Keep this file current

Update this CLAUDE.md in the same change whenever commands, architecture, the compiled-output contract or the `.lucia` format change.

## Commands

| Task | Command |
|---|---|
| Install | `bun install` |
| All tests | `bun test` |
| One file | `bun test packages/compiler/test/style.test.ts` |
| One test by name | `bun test -t "diamond"` |
| Typecheck | `bun run typecheck` |
| Dev (example app, restarts on server change) | `bun dev` (port 3000, `PORT=` to change) |

## Architecture

Workspace packages, wired by the `workspace:*` deps in the root `package.json`. Bun uses its isolated linker, so the root must list every workspace package that tests import.

```
.lucia file ──@lucia/bun-plugin──> @lucia/compiler ──> TS module ──imports──> lucia/internal
                                   parse → style → codegen
```

- `packages/lucia`: the runtime. `index.ts` is the public API (`signal`, `computed`, `batch`, `untrack`, `mount`). `internal.ts` exposes the helpers that compiled code uses (`watch`, `text`, `attr`, `listen`, `insert`, `injectStyle`). `watch` stays internal: there is no public effect API yet, by design.
- Signal updates run in two phases. A write marks every dependent computed dirty synchronously, then queued watchers run once. This prevents glitches in diamond-shaped graphs. Keep `markDirty()` free of signal reads.
- `packages/compiler`:
  - `parse.ts` splits a file into `<script>`, `<style>` and markup.
  - `style.ts` compiles SCSS with `sass`, then scopes selectors with `[data-l-<fnv1a(file)>]`. It supports `:global()` and leaves `@keyframes` and `@font-face` unscoped.
  - `codegen.ts` emits the module.
- Compiled module contract: script content first, then a default-export `component(target) → { root, destroy }`. The template is parsed once per module and cloned on every mount. If the script exports `setup(root)`, it is called after mount, and any function it returns runs on destroy.
- `packages/bun-plugin`: an `onLoad` hook for `.lucia` files that returns the compiled code with `loader: "ts"`.
- Tests: `bunfig.toml` preloads `test/setup.ts`, which registers the happy-dom globals and the `.lucia` plugin. `lucia.d.ts` declares the `*.lucia` module type.

## `.lucia` format

- `<script>` is always TypeScript. It has no `lang` attribute.
- `<style>` is SCSS by default. `lang="css"` skips the SCSS compiler.
- Markup is static HTML for now. The template syntax is still undecided: the user will write sample `.lucia` files first. Do not borrow Svelte syntax (`{#if}`, `on:`, runes, `export let`).
- Deferred until designed with the user: effects, animation, dev server/HMR, SSR, hydration, keyed lists.

## Project rules

- Optimize for performance and readability: no allocations on hot paths where avoidable, small named functions.
- No comments unless they explain a non-obvious why.
