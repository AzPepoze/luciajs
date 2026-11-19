# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

LuciaJS: a Bun-native UI framework with single-file `.lucia` components, signals and scoped SCSS.

- Commands and layout: [docs/development.md](docs/development.md)
- How the compiler and runtime fit together: [docs/architecture.md](docs/architecture.md)
- The `.lucia` format: [docs/components.md](docs/components.md)

## Keep docs current

Update this file and the matching `docs/` page in the same change whenever commands, architecture, the compiled-output contract or the `.lucia` format change. The README is a front page only: keep the detail in `docs/`.

## Workflow

- The main agent orchestrates only: plan, write exact specs, review and test. Hand all coding, tests and docs edits to Haiku subagents to save tokens.
- The main agent writes code itself only for the hard core logic (signal graph, template scanner, binding order), and says so when it does.
- Every change updates the docs that describe it, in the same change. A task is not done while the docs are stale.

## Design direction

- The user designs the markup syntax. Do not invent new syntax, and do not borrow Svelte's (`{#if}`, `on:`, runes, `export let`).
- Deferred until designed with the user: events, conditions, lists, effects, animation, dev server/HMR, SSR, hydration.
- `examples/web` shows every feature in a normal page. `examples/stress` pushes the limits. The plugin test attaches web's `Counter`, so update both together.

## Project rules

- Domain folders own framework logic (`parse/`, `style/`, `template/`, `signal/`, `dom/`).
- `utils/` only holds helpers used by 2+ domains. Move a helper there when a second domain needs it.
- One job per file, about 150 lines max.
- Tests mirror the source folders.
- Always pick the clean, well-designed approach, never a quick hack that only works. If the clean way needs a refactor, do the refactor.
- Optimize for performance and readability: no allocations on hot paths where avoidable, small named functions.
- No comments unless they explain a non-obvious why.
