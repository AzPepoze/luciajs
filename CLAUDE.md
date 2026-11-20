# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

LuciaJS: a Bun-native UI framework with single-file `.lucia` components, stores and scoped SCSS.

- Commands and layout: [docs/development.md](docs/development.md)
- How the compiler and runtime fit together: [docs/architecture.md](docs/architecture.md)
- The `.lucia` format: [docs/components.md](docs/components.md)
- Events and `bind`: [docs/events.md](docs/events.md). Flow tags: [docs/flow.md](docs/flow.md). Animate: [docs/animate.md](docs/animate.md)
- The docs site playground (`/playground`): [docs/playground.md](docs/playground.md). It needs `scripts/playground-runtime.ts`, which `dev` and `build` run first.

## Keep docs current

Update this file and the matching `docs/` page in the same change whenever commands, architecture, the compiled-output contract or the `.lucia` format change. The README is a front page only: keep the detail in `docs/`.

Any `.lucia` syntax change (new tag, attribute, keyword or export) must update both highlighters in the same change, with matching coverage: the VS Code grammar (`editors/vscode/syntaxes/lucia.tmLanguage.json`) plus the extension's completion, hover, lint and formatter, and the docs site's Prism `lucia` language in `examples/web`. A change is not done while either one shows the new syntax as plain text. See [docs/editor.md](docs/editor.md).

`reference/api.ts` is the API table. It feeds both the VS Code extension and `examples/web`, so it must change in the same change whenever the public API or the `.lucia` markup changes.

## Workflow

- The main agent orchestrates only: plan, write exact specs, review and test. Hand all coding, tests and docs edits to Haiku subagents to save tokens.
- The main agent writes code itself only for the hard core logic (store graph, template scanner, binding order), and says so when it does.
- Worktrees live in this repo under `.claude/worktrees/` (gitignored). Agents keep screenshots, benchmarks and scripts inside their worktree under `.agent/` (gitignored), never in a scratchpad or `/tmp` copy of the repo. A new worktree runs `git rebase dev` first, because it may start from `main`.
- Each coding agent works in its own git worktree branched from `dev`, so one agent's half-done edits never break another's build. The main agent reviews, runs `bun run check`, and merges it into `dev`. `main` only gets `dev` when the user says so.
- Every task the user gives gets a GitHub issue (`gh issue create`) before work starts, one per separate task, so nothing is forgotten. Gaps and follow-ups found during the work get their own issues too. Check open issues (`gh issue list`) at the start of a session and when choosing what to do next. Close an issue with a comment saying what was done only after `bun run check` passes and the change is committed or merged into the dev branch; reference the issue in the commit (`fixes #N`). Finished but uncommitted work keeps the `done-uncommitted` label until then.
- `bun run check` (typecheck, tests, site build, extension build) must pass before any change is reported done or committed. Set `LUCIA_CHROMIUM` so the browser tests run too.
- Every change updates the docs that describe it, in the same change. A task is not done while the docs are stale.
- Every feature or behavior change also updates the demos in the same change: add or adjust the `examples/web` showcase section, and the `examples/stress` scenarios when it affects them. A task is not done while the demos are stale.

## Design direction

- Public API names use the simplest common English words, for beginners and non-native English developers (`store`, `store.from`, `store.onUpdate`, not `signal`, `derive`, `effect`). Avoid jargon and long words in names, errors and docs.
- Reuse the words the API already uses. A new option for the same idea takes the same word, with a prefix for the variant: `duration` -> `outDuration`, `turnDuration`; `style`/`ease` -> `turnStyle`/`turnEase`. Never introduce a synonym (`time`, `length`, `curve`, `transition`) for an existing word.
- The user designs the markup syntax. Do not invent new syntax, and do not borrow Svelte's (`{#if}`, `on:`, runes, `export let`).
- Deferred until designed with the user: SSR, hydration.
- Events (`onclick={fn}`), `bind` and the flow tags (`<IF>`, `<ELSEIF>`, `<ELSE>`, `<EACH>`, `<FOR>`) are designed and implemented. Their syntax follows [docs/events.md](docs/events.md) and [docs/flow.md](docs/flow.md). Change it only with the user.
- `animate` is designed. Its syntax follows [docs/animate.md](docs/animate.md): one special attribute, options inside the value, enums `EASE` (with `EASE.STYLE`) and `WHEN` (no flat names). Change its syntax only with the user.
- `examples/web` is a docs-style showcase: every feature with a live demo and its source. `examples/stress` pushes the limits. The plugin test attaches web's `Events` demo, so update both together.

## Project rules

- Domain folders own framework logic (`parse/`, `style/`, `template/`, `store/`, `dom/`).
- `utils/` only holds helpers used by 2+ domains. Move a helper there when a second domain needs it.
- One job per file, about 150 lines max.
- Tests mirror the source folders.
- Use @runtime/@compiler/@bun-plugin aliases for imports across areas; keep same-area imports relative.
- Always pick the clean, well-designed approach, never a quick hack that only works. If the clean way needs a refactor, do the refactor.
- Optimize for performance and readability: no allocations on hot paths where avoidable, small named functions.
- No comments unless they explain a non-obvious why.
