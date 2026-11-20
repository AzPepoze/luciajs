# LuciaJS

> [!NOTE]
> LuciaJS is a UI framework.

> [!IMPORTANT]
> LuciaJS is under active development and has no release yet. APIs and markup may change without notice.

A small UI framework for [Bun](https://bun.sh). You write components as single `.lucia` files: TypeScript, HTML and scoped SCSS. The page updates through variables.

> [!NOTE]
> Markup has `{expression}`, events, two-way `bind`, and `<IF>`, `<EACH>`, `<FOR>`. SSR and hydration are not designed yet.

```html
<script>
  import { variable } from "lucia";

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
bun run dev          # run the web example at http://localhost:3000
bun run dev:stress   # run the stress example at http://localhost:3000
bun run build        # build the web example into dist/
```

If port 3000 is taken, run `bun run dev -- --port 3100`. See [Development](docs/development.md#cli) for all options.

## More

| Topic                                | What it covers                                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| [Components](docs/components.md)     | The `.lucia` file: script, props, markup with `{}`, child components, scoped SCSS, attaching |
| [Events and bind](docs/events.md)    | `onclick={fn}`, two-way `bind` for form fields, `bind-element`                               |
| [Flow](docs/flow.md)                 | `<IF>`, `<ELSEIF>`, `<ELSE>`, `<EACH>` and `<FOR>`                                           |
| [Lazy components](docs/lazy.md)      | `lazy()`: load a component only when it is first shown, with a fallback                      |
| [Variable](docs/variable.md)         | State, derived values, `variable.autoRun` and shared variables                               |
| [Animate](docs/animate.md)           | The `animate` attribute: keyframes, triggers, easings, presets and leave                     |
| [Config](docs/config.md)             | `lucia.config.json`: output folder, routes, dev port and lazy settings                       |
| [Development](docs/development.md)   | Commands, tests, repo layout                                                                 |
| [Architecture](docs/architecture.md) | How the compiler and runtime work                                                            |
| [Error codes](docs/errors.md)        | Error codes and how to fix them                                                              |
| [Editor](docs/editor.md)             | The VS Code extension: highlighting and install                                              |
| [Playground](docs/playground.md)     | Edit a `.lucia` file in the browser and see the preview update                               |
