# SmoothJS

A minimal, lightweight JavaScript framework for building simple frontend applications. Perfect for backend developers who want to quickly build UIs without complex tooling.

## Features

- **Component-based architecture** - Create reusable UI components with state management
- **Vite-powered dev server and bundling** - Fast HMR for development and a library build output in dist/
- **Template literals** - Use familiar JavaScript template strings for HTML rendering
- **Built-in HTTP client** - Simple fetch-based API for making HTTP requests
- **Event handling** - Declarative event binding with automatic cleanup
- **State management** - Reactive state updates with optional global store
- **Router support** - Simple client-side routing for SPAs
- **Utility functions** - Common helpers for DOM manipulation and data formatting

## Installation

- Install via npm (recommended)

  npm
  npm i smoothjs

  pnpm
  pnpm add smoothjs

  yarn
  yarn add smoothjs

- Minimal usage in an ESM/Vite project

  import SmoothJS, { Component, Router } from 'smoothjs';

  class App extends Component {
    template() { return this.html`<h1>Hello SmoothJS</h1>`; }
  }

  new App().mount('#app');

- Use via CDN (no install)

  <!-- unpkg -->
  <script type="module">
    import SmoothJS, { Component } from 'https://unpkg.com/smoothjs@latest/dist/smoothjs.min.js';
    class App extends Component { template() { return `<h1>Hello SmoothJS</h1>`; } }
    new App().mount('#app');
  </script>

  <!-- jsDelivr -->
  <script type="module">
    import SmoothJS, { Component } from 'https://cdn.jsdelivr.net/npm/smoothjs@latest/dist/smoothjs.min.js';
    class App extends Component { template() { return `<h1>Hello SmoothJS</h1>`; } }
    new App().mount('#app');
  </script>

- CLI quickstart

  # Scaffold a vanilla SmoothJS app (single index.html)
  npx smoothjs create my-app
  cd my-app
  # Serve it locally
  npx smoothjs serve . --port 5173
  # Or install globally
  # npm i -g smoothjs && smoothjs serve . --port 5173

See the “Packaging and CLI” section below for more distribution details.

## Quick Start

1. Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

2. Open your browser to http://localhost:5173/ (the examples are served as the dev root).

3. Import from the package in your app code:

```ts
import SmoothJS, { Component, Router } from 'smoothjs';

class App extends Component {
  template() { return this.html`<h1>Hello SmoothJS</h1>`; }
}

new App().mount('#app');
```

2. Create a component:

```javascript
const { Component } = SmoothJS;

class MyComponent extends Component {
  constructor() {
    super(null, { count: 0 });
  }
  
  onCreate() {
    this.on('click', '#increment', () => {
      this.setState({ count: this.state.count + 1 });
    });
  }
  
  template() {
    return this.html`
      <div>
        <h2>Count: ${this.state.count}</h2>
        <button id="increment">Increment</button>
      </div>
    `;
  }
}

// Mount the component
SmoothJS.utils.ready(() => {
  new MyComponent().mount('#app');
});
```

## Running the Example

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open your browser to http://localhost:5173/

The example includes a fully functional todo app demonstrating:
- State management and persistence
- Event handling
- Template rendering with data binding
- HTTP client usage (mock demo)

## API Reference

### Component Class

```javascript
class MyComponent extends SmoothJS.Component {
  constructor(element = null, initialState = {}) {
    super(element, initialState);
  }
  
  // Lifecycle hooks
  onCreate() {}      // Called after construction
  onMount() {}       // Called after DOM mounting
  onUnmount() {}     // Called before DOM cleanup
  onStateChange(prevState, newState) {} // Called on state updates
  
  // Template rendering
  template() {
    return this.html`<div>Your HTML here</div>`;
  }
  
  // Event handling
  on(event, selector, handler) {} // Returns this for chaining
  
  // DOM utilities
  find(selector) {}               // querySelector within component
  findAll(selector) {}            // querySelectorAll within component
  
  // Mounting
  mount(selector) {}              // Mount to DOM element
  unmount() {}                    // Remove from DOM
}
```

### Global Store

```javascript
const store = SmoothJS.createStore({ initialState });

store.getState()              // Get current state
store.setState(newState)      // Update state
store.subscribe(callback)     // Listen for changes
```

### HTTP Client

```javascript
const { http } = SmoothJS;

await http.get(url, options)
await http.post(url, data, options)
await http.put(url, data, options)
await http.delete(url, options)
```

### Utilities

```javascript
const { utils } = SmoothJS;

utils.ready(callback)                    // DOM ready
utils.debounce(func, delay)             // Debounce function
utils.throttle(func, delay)             // Throttle function
utils.escapeHtml(text)                  // HTML escape
utils.formatters.currency(amount)       // Format currency
utils.formatters.date(date, options)    // Format date
utils.formatters.number(num)            // Format number
```

## Philosophy

SmoothJS is designed with simplicity in mind:

- **ESM-first and Vite-friendly** - Works great with Vite dev server and modern browsers
- **Minimal learning curve** - Uses familiar JavaScript patterns
- **No dependencies** - Pure vanilla JavaScript
- **Backend developer friendly** - Straightforward API design
- **Just enough features** - Perfect for simple to medium complexity UIs

## License

MIT

---

## What’s New in v1.1.0

SmoothJS 1.1.0 focuses on robustness and production readiness while keeping the library minimal and easy to use.

Key improvements:
- Component
  - setState supports functional updates and safely queues updates triggered during render
  - Added off(event, selector) to remove handlers registered with on()
  - SSR-safe rendering and improved lifecycle error handling
- DOM utilities
  - SSR-guarded $, $$
  - createElement supports style and dataset objects and safely handles arrays/nulls/booleans
- HTTP client
  - AbortController and timeout support
  - HTTPError with status/body fields for better error diagnosis
  - http.raw() to access the Response directly
  - http.withBase(baseURL) to create a client with a base URL and default options
- Router
  - History and hash modes, configurable root mount selector
  - notFound component option
  - beforeEach(to, from) navigation guard (return false to cancel)
  - destroy() cleans up listeners
- Store
  - Functional setState, replaceState(nextState), reset()
  - Microtask-batched notifications and safe subscribe/unsubscribe
- Utils
  - utils.isBrowser flag and SSR-safe utils.ready()
- Packaging
  - ESM by default (package.json { "type": "module" })

## Updated API Highlights

### Router

Create a router with options and routes:

```js
import { Router } from 'smoothjs';

class NotFound extends Component {
  template() { return this.html`<h1>Not Found</h1>`; }
}

const router = new Router({
  mode: 'history',              // 'history' | 'hash'
  root: '#app',                 // root mount selector
  notFound: NotFound,           // fallback component
  beforeEach: (to, from) => {   // optional guard; return false to cancel
    // e.g., auth checks
    return true;
  }
});

router
  .route('/', HomeComponent)
  .route('/about', AboutComponent)
  .start();
```

Programmatic navigation:
```js
router.navigate('/about');
router.destroy(); // clean up listeners
```

### HTTP

```js
import { http, HTTPError } from 'smoothjs';

// Timeout and JSON handling
try {
  const data = await http.get('/api/todos', { timeout: 5000 });
} catch (e) {
  if (e instanceof HTTPError) {
    console.error(e.status, e.body);
  }
}

// Base client
const api = http.withBase('https://api.example.com');
const created = await api.post('/items', { name: 'X' });

// Raw response when needed
const res = await http.raw('/download');
```

### Store

```js
import { createStore } from './index.js';

const store = createStore({ count: 0 });

store.subscribe((state) => console.log('state:', state));

store.setState((prev) => ({ count: prev.count + 1 }));
store.replaceState({ count: 10 });
store.reset(); // back to initial
```

### Utils and DOM

```js
import { utils, createElement } from './index.js';

utils.ready(() => console.log('DOM ready (browser or SSR-safe)'));

const el = createElement('button', {
  className: 'btn',
  style: { color: 'white', backgroundColor: 'teal' },
  dataset: { id: '42' },
  onClick: () => alert('clicked')
}, 'Click me');
```

### ESM Module Note

SmoothJS is now ESM-first (package.json type: module). In browsers, import via type="module" script tags. In Node or bundlers, use ESM import syntax.


## Multi-App Examples Hub

A collection of small, focused demos showing SmoothJS features via client-side routing.

1) Start the dev server:
   npm run dev

2) Open the hub:
  http://localhost:5173/

Included pages (hash routing):
- Home: Overview and links
- Todo: Component state, events, utils.escapeHtml, focus-preserving input
- Counter: Global store (subscribe/reset/replace), debounced console logs
- Fetch: Built-in http client with withBase, timeout, loading/error states (fetches examples/data.json)
- DOM: createElement, $, $$ utilities and dynamic events
- About: Utilities like formatters and library version



## Granular Updates, Keys, and Props/Children

SmoothJS components now support more ergonomic composition and more efficient updates.

- Granular DOM updates: Component renders patch the existing DOM instead of fully replacing innerHTML. Text nodes, attributes, and common input properties (value/checked/disabled) are synced.
- Keyed list reconciliation: Add a data-key attribute to list item roots to preserve identity across reorders/inserts/removals. When no keys are present, a simple index-based reconciliation is used.
- Props and children:
  - Pass initial props/children when mounting: new MyComponent().mount('#app', { props: { title: 'Hello' }, children: [/* nodes/strings */] }).
  - Update props via setProps(partialOrFn), with onPropsChange(prev, next) hook for reacting to prop changes.

Example (keyed list):
```js
// Inside a component template method
const items = this.state.items;
return this.html`
  <ul>
    ${items.map(it => this.html`
      <li data-key="${it.id}">${utils.escapeHtml(it.label)}</li>
    `)}
  </ul>
`;
```

Example (props):
```js
class Greeting extends Component {
  template() { return this.html`<h3>Hello, ${utils.escapeHtml(this.props.name || 'friend')}!</h3>`; }
}
const g = new Greeting();
g.mount('#app', { props: { name: 'Ada' } });
// Later
g.setProps({ name: 'Alan' });
```



## New: Error boundaries, memoized selectors, and update batching

- Error boundaries via renderError(error) and onError(error) in Component. If template throws, renderError is used to display a fallback UI.
- Update batching: Component.batch(fn) and utils.batch(fn) coalesce multiple setState calls into a single render tick.
- Memoized derived state: store.select(selector, onChange, isEqual?) and createSelector(...inputs, resultFn) to compute memoized values.

Quick examples

```js
// Error boundary in a component
class ErrorDemo extends SmoothJS.Component {
  constructor() { super(null, { crash: false }); }
  onCreate() { this.on('click', '#boom', () => this.setState({ crash: true })); }
  renderError(err) { return this.html`<div class="error">Oops: ${SmoothJS.utils.escapeHtml(err.message)}</div>`; }
  template() { if (this.state.crash) throw new Error('Boom'); return this.html`<button id="boom">Crash</button>`; }
}

// Batching updates
SmoothJS.utils.batch(() => {
  cmp.setState({ a: 1 });
  cmp.setState({ b: 2 }); // only one render scheduled
});

// Selectors and derived state
const store = SmoothJS.createStore({ count: 0 });
const selectIsEven = SmoothJS.createSelector(s => s.count, c => c % 2 === 0);
store.select(selectIsEven, (isEven) => console.log('Even?', isEven));
```

See examples/index.html -> Counter and Error pages for live demos.


## TypeScript Types and Testing Utilities

SmoothJS ships first-class TypeScript types and lightweight testing helpers.

- Types are published via index.d.ts at the package root and cover Component, Router (including nested routes, lazy loaders, and link), Store/createSelector, utils, DOM helpers, http/HTTPError, Testing helpers, plus SSR and Query cache types.
- Testing helpers are available as named exports under Testing in ESM and on the global SmoothJS.Testing.

Quick examples (TypeScript):

```ts
import SmoothJS, { Component, createStore, createSelector, Router, Testing } from 'smoothjs';

type CounterState = { count: number };

class Counter extends Component<CounterState> {
  constructor() { super(null, { count: 0 }); }
  template() { return this.html`<button id="inc">${this.state.count}</button>`; }
}

const store = createStore<CounterState>({ count: 0 });
const selectIsEven = createSelector((s: CounterState) => s.count, (c) => c % 2 === 0);
store.select(selectIsEven, (isEven) => console.log('even?', isEven));

// Testing helpers (JSDOM/browser)
const { instance, container, unmount } = Testing.mount(Counter);
Testing.fire(container.querySelector('#inc'), 'click');
unmount();
```

Global usage:

```html
<script>
  // After loading index.js as a module, window.SmoothJS is available
  const { Testing } = window.SmoothJS;
  // Testing.mount, Testing.fire, Testing.wait, Testing.getByTestId, etc.
</script>
```

## SSR + Hydration and Query Cache

SmoothJS supports basic SSR and hydration alongside a tiny query/cache layer.

- SSR: Use SSR.renderToString(App, { props, state, containerId }) on the server to generate HTML.
- Hydration: On the client, call new App().hydrate('#app', { props }) to attach behavior to server-rendered markup.
- Query cache: Use Query.fetch/subscribe with staleTime to dedupe and cache network requests.

Example (server-side):
```js
import { SSR } from 'smoothjs';
import App from './App.js';
const html = SSR.renderToString(App, { props: { userId: 1 }, state: { /* initial */ } , containerId: 'app' });
// send html within your page template
```

Example (client-side hydration):
```js
import SmoothJS, { Component } from './index.js';
import App from './App.js';
new App().hydrate('#app', { props: { userId: 1 } });
```

Example (Query cache):
```js
import { Query, http } from 'smoothjs';
const api = http.withBase('/api');
// subscribe in your component's onCreate
this.unsub = Query.subscribe('todos', ({ data, error }) => this.setState({ data, error }));
// fetch with dedupe + cache for 30s
await Query.fetch('todos', () => api.get('/todos'), { staleTime: 30000 });
// later, force refetch or invalidate
await Query.refetch('todos');
Query.invalidate('todos');
```

See examples/index.html -> Fetch page for a live Query demo, and use SSR + hydrate in your server/client setup as shown above.



## Packaging and CLI

SmoothJS is published as an ESM-first package with tree-shakeable exports and a basic zero-dependency CLI.

- Package layout:
  - ESM entry: index.js (exported via package exports)
  - Types: index.d.ts
  - Marked sideEffects: false for optimal tree-shaking
  - CDN/browser build shim: dist/smoothjs.min.js (ESM re-export shim)

- CDN usage:
  <script type="module">
    import SmoothJS, { Component } from 'https://unpkg.com/smoothjs@latest/dist/smoothjs.min.js';
    class App extends Component { template() { return this.html`<h1>Hello SmoothJS</h1>`; } }
    new App().mount('#app');
  </script>

- Node/ESM usage:
  import SmoothJS, { Component, Router } from 'smoothjs';

- CLI (scaffold and Vite dev server):
  - npx smoothjs help
  - npx smoothjs create my-app
  - npx smoothjs serve . --port 5173
  - Or install globally: npm i -g smoothjs then run smoothjs ...

Notes:
- smoothjs serve uses the Vite dev server under the hood (default port 5173) for full Vite behavior (HMR, alias resolution like `import ... from 'smoothjs'`).
- create scaffolds a single index.html that imports SmoothJS via the package path.


## Development

- Install dependencies
  
  npm install

- Start the Vite dev server (serves examples/ as root)
  
  npm run dev

- Build the library
  
  npm run build

- Preview the build locally
  
  npm run preview

- Run tests (placeholder)
  
  npm test

## .gitignore

This repository includes a .gitignore appropriate for a Vite-based JS library:
- node_modules/ and common tool caches
- dist/ build output
- Vite cache directories (.vite/)
- Logs (npm/yarn/pnpm)
- Environment files (.env, .env.*)
- Coverage reports (coverage/)
- Platform directories (.vercel/, .netlify/)
- Editor/OS files (.idea/, .vscode/, .DS_Store)

If you add tools that generate new artifacts, extend .gitignore accordingly to keep the repo clean.
