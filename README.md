# LuciaJS

A small UI framework for [Bun](https://bun.sh). You write components as single `.lucia` files: TypeScript, HTML and scoped SCSS. The page updates through signals.

> [!WARNING]
> Early work in progress. Markup supports `{expression}` so far; events, conditions and lists are not designed yet.

```html
<script>
import { signal } from "lucia";

const count = signal(0);
</script>

<p class="count {count.value > 4 ? 'hot' : ''}">Clicked {count} times</p>

<style>
$accent: tomato;
.hot { color: $accent; }
</style>
```

## Quick start

You need Bun 1.4 or newer.

```sh
bun install      # install dependencies
bun dev          # run the web example at http://localhost:3000
bun dev:stress   # run the stress example at http://localhost:3000
```

If port 3000 is taken, run `PORT=3100 bun dev`.

## More

| Topic | What it covers |
|---|---|
| [Components](docs/components.md) | The `.lucia` file: script, markup with `{}`, scoped SCSS, attaching |
| [Signals](docs/signals.md) | State, derived values and shared stores |
| [Development](docs/development.md) | Commands, tests, repo layout |
| [Architecture](docs/architecture.md) | How the compiler and runtime work |
