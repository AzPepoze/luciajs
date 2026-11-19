# Selector scoping benchmark

This benchmark compares the style recalc cost of three ways to scope the same CSS: no scope, an attribute stamp, and native `@scope` with a donut stop. It runs in Chromium and Firefox with Playwright and writes the results to `RESULTS.md`.

Run it from this folder:

```sh
bun run bench
```
