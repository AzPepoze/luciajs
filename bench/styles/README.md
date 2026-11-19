# Selector scoping benchmark

This benchmark compares the style recalc cost of five ways to scope the same CSS. It runs in Chromium and Firefox with Playwright and writes the results to `RESULTS.md`.

| Variant | Scoping |
|---|---|
| A | None (unscoped) |
| B | Attribute stamp on every element |
| C | Native `@scope` with a donut stop |
| D | Ancestor prefix `[data-l]:not([data-l="child"])`, no stop |
| E | Ancestor prefix with a stop inside child roots |

Run it from this folder:

```sh
bun run bench
```

Options:

| Option | Default | Effect |
|---|---|---|
| `--variants=A,E` | all | Run only the listed variants |
| `--runs=N` | 10 | Measured runs per browser and variant |

Example, variants A and E with 10 runs:

```sh
bun run bench --variants=A,E --runs=10
```
