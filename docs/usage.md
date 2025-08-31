# SmoothJS Usage Guide

A developer-focused guide to building apps with SmoothJS. This document covers the core APIs, patterns, and examples you can copy‑paste.

If you’re just looking for a quick taste, open examples/ in dev and explore. For concepts and features, see docs/roadmap.md.


## Getting started

- Install
```bash
  npm
  npm i smoothjs

  pnpm
  pnpm add smoothjs

  yarn
  yarn add smoothjs
```

- Minimal Vite/ESM usage
```javascript 
  import SmoothJS, { Component } from 'smoothjs';
  class App extends Component { template() { return this.html`<h1>Hello</h1>`; } }
  new App().mount('#app');
```
- CDN (no install)
```html
  <script type="module">
    import SmoothJS, { Component } from 'https://unpkg.com/smoothjs@latest/dist/smoothjs.min.js';
    class App extends Component { template() { return `<h1>Hello</h1>`; } }
    new App().mount('#app');
  </script>
```
- CLI (optional)
```bash
  npx smoothjs create my-app
  npx smoothjs serve . --port 5173
```

## Components 101

SmoothJS ships a simple class-based component with a tiny rendering and diffing layer.

- Lifecycle hooks: onCreate(), onMount(), onUnmount(), onStateChange(prev, next), onPropsChange(prev, next)
- State/props update: setState(partial | fn), setProps(partial | fn)
- Rendering: template() returns string or Node. Use html`...` helper for strings.
- Events: this.on(event, selector?, handler) with event delegation; this.off(event, selector?)
- Mount/hydrate: mount(selector|Element, { props, state, children }), hydrate(selector|Element, { props, state, children })
- Find helpers: find(css), findAll(css)

Example:
```javascript
  import { Component, utils } from 'smoothjs';
  class Counter extends Component {
    constructor() { super(null, { n: 0 }); }
    onCreate() { this.on('click', '#inc', () => this.setState({ n: this.state.n + 1 })); }
    template() { return this.html`<button id="inc">+1</button><span>${this.state.n}</span>`; }
  }
  new Counter().mount('#app');
```
Batch updates:

- All setState calls in the same microtask are batched automatically; for explicit batching across functions use utils.batch(() => { ... }).

Children and composition:

- setChildren(value | value[]): sets renderable children (strings, Nodes). Use renderChildren() inside template.

  class List extends Component {
    template() { return this.html`<ul>${this.renderChildren()}</ul>`; }
  }

Context and portals:
```javascript
  import { Component, createContext } from 'smoothjs';
  const Theme = createContext('light');
  class Provider extends Component {
    onCreate() { this.provideContext(Theme, 'dark'); }
    template() { return this.html`<div>${this.renderChildren()}</div>`; }
  }
  class Consumer extends Component {
    template() { return this.html`<p>${this.useContext(Theme)}</p>`; }
  }

  // Portals render into a different DOM node after main patch
  class PortalDemo extends Component {
    template() { return this.html`Content ${this.portal('#portal-target', '<div>Floating</div>')}`; }
  }
```
Error boundaries:

- Throw in template() and implement renderError(err) to show a fallback. onError(err) also runs.
```javascript
  import { Component } from 'smoothjs';
  class Safe extends Component {
    renderError(err) { return this.html`<div class="error">${err.message}</div>`; }
    template() { if (this.props.crash) throw new Error('Boom'); return this.html`OK`; }
  }
```
Focus preservation:

- SmoothJS preserves active input focus/selection across renders when possible.


## Router
```javascript
  import { Router } from 'smoothjs';
  class Home { template() { return '<div>Home</div>'; } }
  class Users { template() { return '<div><div data-router-outlet></div></div>'; } }
  class UserDetail { template() { return `<div>User</div>`; } }

  const router = new Router({ mode: 'hash', root: '#app' });
  router
    .route('/', Home)
    .route('/users', Users)
    .route('/users/:id', UserDetail);
  router.start();
```
- Nested routes render into [data-router-outlet] of the parent.
- Dynamic params available on component props.params (e.g., { id }).
- Link helper builds SPA-friendly links with active class:

  router.link('/users', 'Users', { exact: false, activeClass: 'active' });

- Guards: beforeEach(to, from) can return false to cancel or a string path to redirect.
- Lazy routes: route('/about', () => import('./About.js').then(m => m.About))


## Data query layer
```javascript
  import { Query } from 'smoothjs';
  const data = await Query.fetch('todos', () => fetch('/api/todos').then(r => r.json()), {
    staleTime: 30000,
    cacheTime: 300000,
    swr: true,
    refetchOnWindowFocus: true,
    tags: ['todos']
  });
```
- Subscribe to updates:
```javascript
  const unsub = Query.subscribe('todos', (snap) => { /* snap = { data, error, updatedAt } */ });
```
- Invalidate and refetch:
```javascript
  Query.invalidate('todos');
  Query.invalidateTag('todos');
  await Query.refetch('todos');

```
- Mutations with optimistic updates:
```javascript
  await Query.mutate('todos', serverSave, {
    optimisticData: (prev) => [...(prev||[]), { id: 2, title: 'b' }],
    rollbackOnError: true,
    invalidateTags: ['todos']
  });
```

## HTTP client
```javascript
  import { http } from 'smoothjs';
  const api = http.withBase('/api', { timeout: 5000 });
  const users = await api.get('/users');
  const text = await api.get('/raw.txt', { responseType: 'text' });

```
- request(url, { method, headers, body, timeout, responseType: 'json'|'text' })
- HTTPError thrown on non-2xx with { status, statusText, url, body }


## Store and selectors
```javascript
  import { createStore, createSelector } from 'smoothjs';
  const store = createStore({ n: 0 });
  const double = createSelector((s) => s.n, (n) => n * 2);
  const unsub = store.subscribe((s) => console.log('state', s));
  store.setState({ n: 1 });
```
- store.select(selector, onChange, isEqual?) enables memoized subscriptions.


## SSR + Hydration
```javascript
  import { SSR } from 'smoothjs';
  const html = SSR.renderToString(App, { state: { count: 2 }, containerId: 'root' });
  // Send html to client…
  // On client:
  const app = new App();
  app.hydrate('#root', { state: { count: 2 } });

```
- Prefer template() returns string on the server.


## Design System (Velvet)
```javascript
  import { Velvet } from 'smoothjs';
  const { VelvetUI } = Velvet;
  // Button
  const btn = new VelvetUI.Button(null, {}, { variant: 'primary', children: 'Click' });
  btn.mount('#host');

// Style utilities:

  class MyComp extends Velvet.VelvetComponent {
    template() {
      const className = this.vs({ base: { padding: '1rem', border: '1px solid #e5e7eb' }, dark: { backgroundColor: '#0f1a2b', color: '#fff' } });
      return this.html`<div class="${className}">Hello</div>`;
    }
  }

```
- Velvet engine dedupes and batches CSS into a single style tag.


## Accessibility utilities
```javascript
  import { A11y } from 'smoothjs';
  const cleanup = A11y.focusTrap('#dialog');
  A11y.announce('Saved', { politeness: 'polite' });
  A11y.createSkipLink('#app');
```



## Forms and security
```javascript
  import { Forms, Security } from 'smoothjs';
  const form = Forms.createForm({ email: '' }, { email: (v) => /@/.test(v) ? '' : 'Invalid' });
  form.handleChange({ target: { name: 'email', value: 'a@b.com', type: 'text' } });
  const safe = Security.sanitize('<img src="javascript:alert(1)">Hello');
```

## Testing utilities
```javascript
import { Testing } from 'smoothjs';
  const { instance, container, unmount } = Testing.mount(MyComp);
  const btn = Testing.getByTestId(container, 'btn');
  Testing.fire(btn, 'click');
  await Testing.waitFor(() => { /* condition */ return true; });
  await Testing.act(() => Promise.resolve());
```

## DevTools
```javascript
  import { DevTools } from 'smoothjs';
  DevTools.enableOverlay();
  DevTools.time('render list', () => renderList());
```

## Performance tips

- Prefer keyed lists (data-key on rows/items) for stable reconciliation.
- Coalesce multiple setState calls within microtasks; consider utils.batch.
- Use Query SWR/focus policies for responsive data; avoid unnecessary refetches.
- Use Velvet once per app; its engine batches CSS insertions.


## Examples and docs

- Browse the runnable examples: examples/index.html (served via Vite in dev).
- See docs/roadmap.md for the v1.0.0 roadmap and feature breakdown.
- Check tests/ for usage patterns of core pieces.


## Troubleshooting

- “Element not found” warnings: ensure mount() selector exists before calling.
- Hydration issues: make server HTML match template() string output and pass initial state to hydrate().
- Router not rendering: confirm router.options.root points to an existing element and start() was called.



# Functional Components

SmoothJS supports functional components via defineComponent(setup). The setup function receives a small context with hooks and utilities and returns a render() function (plus optional lifecycle callbacks).

Example (counter with delegated events):

```javascript
import { defineComponent } from 'smoothjs';

const Counter = defineComponent(({ useState, html, on }) => {
  const [n, setN] = useState(0);
  on('click', '#inc', () => setN(v => v + 1));
  const render = () => html`<button id="inc">+1</button><span>${n}</span>`;
  return { render };
});
```

Hooks available:
- useState(initial)
- useRef(initial?)
- useMemo(factory, deps?)
- useEffect(effect, deps?)
- useContext(Context)/provideContext(Context, value)
- portal(target, content, key?)
- useQuery(key, fetcher, options?) — thin adapter over Query

Context and portals:
```javascript
import { defineComponent, createContext } from 'smoothjs';
const Theme = createContext('light');

const Demo = defineComponent(({ provideContext, useContext, html, portal, useState, on }) => {
  provideContext(Theme, 'dark');
  const theme = useContext(Theme);
  const [open, setOpen] = useState(false);
  on('click', '#toggle', () => setOpen(v => !v));
  const render = () => html`
    <button id="toggle">${open ? 'Hide' : 'Show'} Portal</button>
    ${open ? portal('#portal-target', `<div data-key="p">Theme: ${theme}</div>`) : ''}
  `;
  return { render };
});
```

Data with useQuery:
```javascript
import { defineComponent, http } from 'smoothjs';

const DataBox = defineComponent(({ useQuery, html }) => {
  const [data, q] = useQuery('todos', () => http.get('/api/todos'), {
    staleTime: 30000,
    cacheTime: 300000,
    swr: true,
    tags: ['todos']
  });
  const render = () => html`
    <div>
      <button id="refetch">Refetch</button>
      ${q.error ? `Error: ${q.error}` : ''}
      <pre>${data ? JSON.stringify(data, null, 2) : 'Loading...'}</pre>
    </div>
  `;
  return { render };
});
```

Migration guide (functional vs class):
- Choose functional for concise components with local state, effects, and integrated data via useQuery.
- Class components remain supported; both interoperate. You can mount function components anywhere a class component is accepted.
- Event delegation stays the same via on(event, selector, handler) in setup.

FAQ additions:
- Performance: hooks are thin over the existing scheduler; prefer keyed lists and batching as usual.
- Event handling: continue to use delegated events to limit listeners.
- Security: sanitization behavior is unchanged; never inject untrusted HTML; prefer Security.sanitize for unsafe inputs.
- IDE/lint: avoid calling hooks conditionally; keep call orders stable.
