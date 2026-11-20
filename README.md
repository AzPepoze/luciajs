# Lusia

> [!NOTE]
> Lusia is a UI framework.

> [!IMPORTANT]
> Lusia is under active development and has no release yet. APIs and markup may change without notice.

A small UI framework for [Bun](https://bun.sh). You write components as single `.lusia` files: TypeScript, HTML and scoped SCSS. The page updates through variables.

> [!NOTE]
> Markup has `{expression}`, events, two-way `bind-value`, and `<IF>`, `<EACH>`, `<FOR>`. SSR and hydration are not designed yet.

```html
<script>
  import { variable } from "lusia";

  const count = variable(0);
  const hot = variable.compute(() => (count.value > 4 ? "hot" : ""));
</script>

<p class="count {hot}">Clicked {count} times</p>

<style>
  $accent: tomato;
  .hot {
    color: $accent;
  }
</style>
```

## Quick start

You need Bun 1.4 or newer.

```sh
bun install          # install dependencies
bun run dev          # run the docs site at http://localhost:3000
bun run dev:stress   # run the stress example at http://localhost:3000
bun run build        # build the docs site into docs/dist/
```

If port 3000 is taken, run `bun run dev -- --port 3100`. See [Development](CONTRIBUTING.md) for all options.

## More

- [Home](https://azpepoze.github.io/lusia/)
- [Guide](https://azpepoze.github.io/lusia/guide)
- [Reference](https://azpepoze.github.io/lusia/reference)
- [Playground](https://azpepoze.github.io/lusia/playground)
- [Errors](https://azpepoze.github.io/lusia/errors)
- [Development](CONTRIBUTING.md)
