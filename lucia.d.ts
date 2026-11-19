declare module "*.lucia" {
  import type { Component } from "lucia";
  const component: Component;
  export default component;
}

declare module "*?raw" {
  const source: string;
  export default source;
}
