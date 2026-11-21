# Contributing to Lusia

Welcome, and thank you for helping improve Lusia. Start with the [quick start](README.md#quick-start), then use this page for commands and code rules. The [Guide](https://azpepoze.github.io/lusia/guide) explains the framework itself.

## Commands

| Task | Command |
| ---- | ------- |
| Install packages | `bun install` |
| Install docs site packages | `cd docs && bun install` |
| Run the stress example (port 3000) | `bun run dev:stress` |
| Run the docs site (port 3000) | `cd docs && bun run dev` |
| Build the docs site into `docs/dist/` | `cd docs && bun run build` |
| Run the lusia tests | `bun run test` |
| Run the docs site tests | `cd docs && bun run test` |
| Run one test file | `bun test test/compiler/style/modes.test.ts` |
| Run tests by name | `bun test -t "diamond"` |
| Typecheck | `bun run typecheck` |
| Format all files | `bun run format` |
| Check formatting without writing | `bun run format:check` |
| Check before a commit (lusia) | `bun run check` |
| Check before a commit (docs site) | `cd docs && bun run check` |
| Run the editor tests | `bun test test/editors` |
| Build the VS Code extension | `cd editors/vscode && bun run build` |

> [!TIP]
> Set `LUSIA_CHROMIUM` to a Chromium path to run the browser tests. Without it they are skipped.

`bun run check` runs the typecheck, the tests and the extension build in parallel. `cd docs && bun run check` runs the docs site typecheck, tests and build.

`cd docs && bun run dev` and `bun run build` first run `docs/scripts/playground-runtime.ts`. Run that script yourself before using the CLI directly.

Tests use small data. The large stress sizes live in `examples/stress` and run only on the stress page.

Run the `lusia` command from source with `bun src/cli/index.ts <command>`. Run `bun src/cli/index.ts --help` for the commands and flags.

## Repo layout

| Path | What it holds |
| ---- | ------------- |
| `src/runtime` | The `lusia` package: variables, DOM helpers, animate |
| `src/compiler` | Turns `.lusia` files into TypeScript modules |
| `src/language` | Parse, format and lint for `.lusia` files |
| `src/bun-plugin` | The Bun loader for `.lusia` files and `?raw` imports |
| `src/cli` | The `lusia` command |
| `test/` | Tests. One folder per area, mirroring `src/`. `test/setup.ts` sets up the fake DOM |
| `docs/` | The docs site, with its own `package.json` |
| `examples/stress` | Scenarios that push the limits and report timings |
| `editors/vscode` | The VS Code extension and the `.lusia` grammar |
| `reference/api.ts` | The API table for the extension and the docs site |
| `scripts/check.ts` | The steps behind `bun run check` |

### Folders inside `src`

| Folder | What it holds |
| ------ | ------------- |
| `src/runtime/variable` | Variables, compute values and updates |
| `src/runtime/dom` | Bindings, blocks, components, lazy loading, hot reload and templates |
| `src/runtime/animate` | The animate helpers |
| `src/compiler/parse` | Splits script, style and markup |
| `src/compiler/style` | Sass compile and selector scoping |
| `src/compiler/template` | Scans markup, checks it and writes the module |
| `src/compiler/errors` | Error codes and error output |
| `src/compiler/sourcemap` | Source maps for compiled files |
| `src/compiler/hot` | Hot reload support for compiled files |
| `src/compiler/lazy` | Lazy component loading for compiled files |
| `src/compiler/utils` | Small helpers for the compiler |
| `src/language/parse` | Sections, imports, props and tags |
| `src/language/format` | Formatting for `.lusia` files |
| `src/language/lint` | Lint rules, one file per rule group |
| `src/cli/args` | Command line and `lusia.config.json` options |
| `src/cli/build` | The build command |
| `src/cli/dev` | The dev server and file watching |
| `src/cli/format` | The format command |
| `src/cli/lint` | The lint command |
| `src/cli/log` | Colored log output |

## Code rules

- Framework logic lives in domain folders: `parse/`, `style/`, `template/`, `variable/` and `dom/`.
- `utils/` holds only helpers that two or more domains use.
- One job per file, around 150 lines.
- Imports across areas use the `@runtime/`, `@compiler/`, `@bun-plugin/`, `@cli/` and `@language/` aliases. Imports inside one area stay relative.
- `src/runtime` ships to apps as the `lusia` package, so it uses relative imports only.
- Public names use plain words and "update", never "change". The DOM `change` event keeps its name.
- Avoid allocations on hot paths. Render loops and audio callbacks must not allocate, lock or log.
- Compiler and runtime share the marker names in `src/runtime/markers.ts`. Both walk the markup in document order, because bindings match nodes by index.
- Variable writes only mark dependent `variable.compute` values dirty. `markDirty()` must never read variables.

### Error codes

Codes live in the `CODES` table in `src/compiler/errors/codes.ts`.

| Range | Meaning |
| ----- | ------- |
| `L1xxx` | Compile errors in `.lusia` files |
| `L2xxx` | Runtime errors |
| `L3xxx` | Bundler errors from `Bun.build` |

To add a code, add one entry to `CODES`. Raise it with `lusiaError` (compiler) or `runtimeError` (runtime). The [Errors](https://azpepoze.github.io/lusia/errors) page reads the table, so it needs no edit.

### Syntax and API changes

A change to the API or to `.lusia` markup must update these in the same change:

- `reference/api.ts`
- The site Guide
- The demos in `docs`, and `examples/stress` when it is affected

A `.lusia` syntax change also updates both highlighters: the VS Code grammar, the extension's completion, hover, lint and formatter, and the docs site's Prism `lusia` language. See the Guide's Editor section.

### VS Code extension

The extension build bundles the compiler from `src/compiler`, so install the repo root first. To try a build in VS Code:

```sh
cd editors/vscode
bun install
bun run build
ln -s "$PWD" ~/.vscode/extensions/lusia.lusia-vscode-0.2.0
```

Run **Developer: Reload Window** after each build. To check a colour token, run **Developer: Inspect Editor Tokens and Scopes**.

Check the extension with `bunx tsc --noEmit -p editors/vscode`.

## Workflow

- Commit messages use [Conventional Commits](https://www.conventionalcommits.org): `type(scope): short imperative summary`. Keep the summary lowercase, with no trailing period, under about 72 characters.
- Work on a branch from `dev`, in your own worktree: `git worktree add .worktrees/<name> -b <branch> dev`. `.worktrees/` and `.agent/` are gitignored.
- Run `bun run check` before you report a change as done.
- Update the docs that describe your change in the same change.
- `main` only takes changes from `dev` when the maintainer says so.
