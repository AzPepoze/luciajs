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

## Code rules

- Framework logic lives in domain folders: `parse/`, `style/`, `template/`, `variable/` and `dom/`.
- `utils/` holds only helpers that two or more domains use. One job per file, around 150 lines.
- Imports across areas use the `@runtime/`, `@compiler/`, `@bun-plugin/`, `@cli/` and `@language/` aliases. Imports inside one area stay relative. `src/runtime` ships as the `lusia` package, so it uses relative imports only.

## Error codes

| Range | Meaning |
| ----- | ------- |
| `L1xxx` | Compile errors in `.lusia` files |
| `L2xxx` | Runtime errors |
| `L3xxx` | Bundler errors from `Bun.build` |

To add a code, add one entry to `CODES` in `src/compiler/errors/codes.ts`.

## Syntax and API changes

A change to the API or to `.lusia` markup must update these in the same change:

- `reference/api.ts`
- The site Guide
- The demos in `docs`, and `examples/stress` when it is affected

A `.lusia` syntax change also updates both highlighters: the VS Code grammar, the extension's completion, hover, lint and formatter, and the docs site's Prism `lusia` language. See the Guide's Editor section.

## VS Code extension

The extension build bundles the compiler from `src/compiler`, so install the repo root first.

1. In `editors/vscode`, run `bun install`.
2. Run `bun run build`.
3. Link the folder into VS Code: `ln -s "$PWD" ~/.vscode/extensions/lusia.lusia-vscode-0.2.0`

Run **Developer: Reload Window** after each build.

Check the extension with `bunx tsc --noEmit -p editors/vscode`.

## Workflow

- Commit messages use [Conventional Commits](https://www.conventionalcommits.org): `type(scope): short imperative summary`. Keep the summary lowercase, with no trailing period, under about 72 characters.
- Run `bun run check` before you report a change as done.
