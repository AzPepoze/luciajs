# LuciaJS

A small UI framework for [Bun](https://bun.sh). You write components as single `.lucia` files, and the page updates through signals.

> [!WARNING]
> Early work in progress. The template syntax is not designed yet, so markup is plain static HTML for now.

## What a component looks like

```html
<script>
import { signal } from "lucia";

const count = signal(0);

export function setup(root: Element) {
  const label = root.querySelector(".count")!;
  root.querySelector("button")!.addEventListener("click", () => {
    count.value++;
    label.textContent = String(count.value);
  });
}
</script>

<button>Clicked <span class="count">0</span> times</button>

<style>
$accent: tomato;
button { color: $accent; }
</style>
```

| Part | What it is |
|---|---|
| `<script>` | Always TypeScript |
| Markup | Plain HTML |
| `<style>` | SCSS by default. Styles apply only to this component (scoped). Add `lang="css"` for plain CSS |

A **signal** holds a value. When you change it, anything that depends on it updates.

## Quick start

You need Bun 1.4 or newer.

```sh
bun install    # install dependencies
bun dev        # start the example app at http://localhost:3000
```

If port 3000 is taken, run `PORT=3100 bun dev`.

## Commands

| Command | What it does |
|---|---|
| `bun dev` | Runs the example app. The server restarts when its own files change; refresh the browser to see `.lucia` edits |
| `bun test` | Runs all tests |
| `bun run typecheck` | Checks TypeScript types |

## Packages

| Package | What it does |
|---|---|
| `lucia` | The runtime: signals and mounting |
| `@lucia/compiler` | Turns a `.lucia` file into a JavaScript module |
| `@lucia/bun-plugin` | Lets Bun import `.lucia` files |
| `examples/basic` | A small demo app |

## Signals API

| Function | Use |
|---|---|
| `signal(value)` | A value you can read and set with `.value` |
| `computed(() => ...)` | A value derived from other signals; cached until they change |
| `batch(() => ...)` | Groups several changes into one update |
| `untrack(() => ...)` | Reads signals without depending on them |
| `mount(Component, element)` | Puts a component on the page |
