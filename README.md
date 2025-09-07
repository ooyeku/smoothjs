# SmoothJS

A tiny, batteries‑included JavaScript framework for building simple frontends quickly. Ideal for backend‑leaning developers who want components, routing, data, and SSR without heavy tooling.

- Zero deps, ESM‑first, tree‑shakeable
- Functional components with hooks and fine‑grained DOM patching and keyed lists
- Router with nested routes, params, lazy routes, and guards
- Query/cache layer (SWR, optimistic mutations, tags)
- HTTP client, store/selectors, utils
- SSR + hydration
- Optional modules: Design System (Velvet), A11y, Forms, Security, DevTools, Testing

## Install

npm
```
npm i smoothjs
```
pnpm
```
pnpm add smoothjs
```

yarn
```
yarn add smoothjs
```
Minimal usage:
```
import SmoothJS, { defineComponent } from 'smoothjs';
const App = defineComponent(({ html }) => {
  const render = () => html`<h1>Hello SmoothJS</h1>`;
  return { render };
});
new App().mount('#app');
```
CDN:
```
<script type="module">
  import SmoothJS, { defineComponent } from 'https://unpkg.com/smoothjs@latest/dist/smoothjs.min.js';
  const App = defineComponent(({ html }) => ({ render: () => html`<h1>Hello</h1>` }));
  new App().mount('#app');
</script>
```
CLI (optional):
```
npx smoothjs create my-app
npx smoothjs serve . --port 5173
```
## Learn the framework

Start here:
- docs/usage.md — detailed developer guide and how‑to for Components, Router, Query, SSR, Velvet, A11y, Forms, Security, Testing, and DevTools.

Then explore the runnable examples:
- examples/index.html (serve with `npm run dev`) — demos for counter, fetch, composition, design system, forms, and more.

## Links

- Roadmap: docs/roadmap.md
- Changelog: CHANGELOG.md
- License: MIT (LICENSE)

## Version

This README reflects SmoothJS v1.0.0
