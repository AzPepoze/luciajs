# Contributing to Lusia

Lusia is a Bun-native UI framework built from single-file `.lusia` components, variables and scoped SCSS. This page is for contributors and coding agents. It covers the commands, the repo layout, how the compiler and runtime fit together, and the rules that keep a change consistent. It only includes facts that are not obvious from the code.

## Install, run and test

| Task                                   | Command                                      |
| -------------------------------------- | -------------------------------------------- |
| Install                                | `bun install`                                |
| Web example (port 3000)                | `bun run dev`                                |
| Stress example (port 3000)             | `bun run dev:stress`                         |
| Build the web example (writes `dist/`) | `bun run build`                              |
| All tests                              | `bun run test` (parallel, 6 workers)         |
| One test file                          | `bun test test/compiler/style/modes.test.ts` |
| Tests by name                          | `bun test -t "diamond"`                      |
| Typecheck                              | `bun run typecheck`                          |
| Format all files                       | `bun run format`                             |
| Check formatting without writing       | `bun run format:check`                       |
| Everything before a commit             | `bun run check`                              |

`bun run dev` and `bun run build` first run `scripts/playground-runtime.ts`, which writes the playground preview runtime. Run `bun scripts/playground-runtime.ts` yourself before using the CLI directly.

`bun run check` runs the typecheck, tests, site build and extension build. Set `LUSIA_CHROMIUM` to a Chromium path to include the browser tests; without it those tests are skipped.

Tests check behaviour with small data, so they stay quick. The large sizes of the stress scenarios live in their `main.ts` and only run on the stress page (`bun run dev:stress`), not in `bun run check`.

The `lusia` command builds and serves an app folder. An app folder has an `index.html` that points to its entry with a module script. Run it with Bun, for example `bun src/cli/index.ts build docs`. Its two commands are `lusia build [dir]` and `lusia dev [dir]`; a `lusia.config.json` sets the same options and flags win over it.

## Repo layout

| Path               | What it holds                                                |
| ------------------ | ------------------------------------------------------------ |
| `src/runtime`      | Variables, DOM helpers, blocks, animate                      |
| `src/compiler`     | The `.lusia` compiler: parse, style, template, codegen       |
| `src/bun-plugin`   | The Bun loader for `.lusia` files and `?raw` imports         |
| `src/cli`          | The `lusia` command: `build` and `dev`                       |
| `test/`            | Tests. One folder per area, each mirroring its `src/` folder |
| `docs`             | The docs site: every feature with a live demo and source     |
| `examples/stress`  | Scenarios that push the limits and report timings            |
| `editors/vscode`   | The VS Code extension and `.lusia` grammar                   |
| `reference/api.ts` | The single API table for the extension and the docs site     |
| `scripts/`         | Build helpers, including `playground-runtime.ts`             |
| `test/setup.ts`    | Sets up the fake DOM (happy-dom) and the `.lusia` loader     |

Domain folders own framework logic (`parse/`, `style/`, `template/`, `variable/`, `dom/`). `utils/` holds only helpers used by two or more domains. One job per file, around 150 lines. Imports across areas use `@runtime/`, `@compiler/`, `@bun-plugin/` and `@cli/` aliases; imports inside one area stay relative.

## How the compiler and runtime fit together

A `.lusia` file becomes DOM through the Bun plugin and a four-step compiler pipeline:

```text
App.lusia
   |  lusia/bun-plugin (onLoad, loader "ts")
   v
lusia/compiler:  parse  ->  style  ->  template  ->  codegen
   |
   v
TypeScript module  --imports-->  lusia/internal (runtime helpers)
```

- **Parse** splits script, style and markup. Removed sections keep their newlines so markup line numbers match the source.
- **Style** compiles each `<style>` with Sass, then adds a scope filter to each selector. The scope id is the FNV-1a hash of the file path.
- **Template** scans the markup into static HTML plus a list of bindings in document order. Components, flow tags, events and `bind` become bindings.
- **Codegen** writes the module. Imports stay at module level, `export` is a compile error, and the script body runs once per instance.

The compiler replaces each binding with a marker in the HTML (`<!--l-->` comments or `data-l-bind` on an element). Marker names live in `src/runtime/markers.ts`, shared by compiler and runtime. At runtime `createTemplate` parses the HTML and records the path to each marked node, `instantiate` clones it per attach, and one binder per binding wires the node to a `watch()`. Paths and binders are matched by index, so both sides must walk in document order.

Variable updates run in two phases: a write marks dependent `variable.compute` values dirty without running them, then queued watchers run once each. `markDirty()` must never read variables.

## Error codes

Error codes live in the `CODES` table in `src/compiler/errors/codes.ts`. Each code has a message and a hint.

To add a code:

1. Add one entry to `CODES`. Use `L1xxx` for compile errors and `L2xxx` for runtime errors.
2. Raise it with `lusiaError` (compiler) or `runtimeError` (runtime), passing a value for each `$name` placeholder.
3. Add the code to the docs site's Errors page.

> [!WARNING]
> Error codes are documented on the site's `/errors` page, generated from `src/compiler/errors/codes.ts`. Add a code there and the page picks it up automatically.

## Editor setup

The VS Code extension is in `editors/vscode`. It provides colours, completion, hover, diagnostics, navigation and formatting for `.lusia` files. The docs site also has a browser editor (`docs/src/components/CodeEditor.lusia`) and a Prism `lusia` language in `docs`, both backed by the same API table.

- `reference/api.ts` is the **single source of truth** for the API. Completion, hover and the docs site all read it. Update it in the same change as any public API or markup change.
- Any `.lusia` syntax change (new tag, attribute, keyword or export) must update **both highlighters in the same change** with matching coverage: the VS Code grammar (`editors/vscode/syntaxes/lusia.tmLanguage.json`) plus the extension's completion, hover, lint and formatter, and the docs site's Prism `lusia` language. A change is not done while either one shows the new syntax as plain text.

Editor checks:

| Command                               | Checks                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| `bun test test/editors`               | Grammar, token scopes, completion, hover, format, lint, API table |
| `cd editors/vscode && bun run build`  | The extension bundles                                             |
| `bunx tsc --noEmit -p editors/vscode` | The extension type checks                                         |

## Workflow

- Use **Conventional Commits**: `type(scope): short imperative summary`, with a lowercase summary, no trailing period and under about 72 characters. Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`. Add `!` for a breaking change. Do not add attribution trailers.
- Work in your own git worktree branched from `dev`. Create one with `git worktree add .worktrees/<name> -b <branch> dev`, then run `git rebase dev` first. Worktrees live under `.worktrees/` and are gitignored. Keep screenshots, benchmarks and scripts under `.agent/` in your worktree, not in a scratchpad or a copy of the repo in `/tmp`.
- `bun run check` must pass before any change is reported done or committed.
- Update the docs that describe a change in the same change. Feature and behaviour changes also update the demos in `docs` (and `examples/stress` when affected). A task is not done while the docs or demos are stale.
- `main` gets `dev` only when the user says so.
