# SmoothJS Roadmap — Functional Components Only

This roadmap focuses on one goal: evolve SmoothJS from class-based components to functional components without breaking existing APIs.

We will deliver a function-first authoring model that wraps component creation, lifecycle, and reactivity into a single, ergonomic surface. Class components remain supported throughout 1.x; the new API is additive and interop-friendly.

## Vision and constraints
- No breaking changes in 1.x: existing class components, router, query, SSR, design system, and examples continue to work.
- Functional components feel natural and concise: minimal boilerplate; lifecycle and state are expressed declaratively.
- Interop-first: function and class components can nest each other; SSR/hydration remain compatible.
- Tree‑shakeable and tiny: the functional layer is a thin wrapper over current runtime.

## Proposed public API (draft)
- defineComponent(setup): returns a ComponentFactory with mount(), hydrate(), etc.
  - setup(ctx): runs once per instance; returns render() and optional lifecycle fns.
  - ctx provides small hooks and utilities:
    - useState(initial)
    - useRef(initial?)
    - useEffect(effect, deps?) with automatic cleanup on unmount
    - useMemo(factory, deps?)
    - useContext(Context)
    - useQuery(key, fetcher, options?) — thin adapter over Query
    - provideContext(Context, value)
    - portal(target, content, key?)
    - html(strings, ...values) passthrough
    - props, children, element, find/findAll
  - return value from setup:
    - render(): string | Node | (ctx) => string
    - optional onError(err), onMount(), onUnmount(), onPropsChange(prev, next)

- Example
  const Counter = defineComponent(({ useState, html }) => {
    const [n, setN] = useState(0);
    const inc = () => setN(n + 1);
    const render = () => html`<button id="inc">+1</button><span>${n}</span>`;
    // events can be delegated via data-action or explicit on('click', selector, handler) helper (TBD)
    return { render, onMount() { /* attach listeners via delegation */ } };
  });
  new Counter().mount('#app');

- Typing: strong generic typing for props/state/user hooks; minimal surface in index.d.ts.

## Runtime design notes
- Hook storage per instance (array + cursor) with render cycle protections; microtask-batched updates reuse existing scheduler.
- Effects run post-render; cleanup on re-render/unmount.
- Props/children diff and DOM patching reuse SmoothComponent internals via a thin adapter. No virtual DOM introduced.
- SSR: defineComponent instances expose the same hydrate() contract; template strings remain preferred for SSR output.

## Migration and compatibility
- Class components remain supported; no code changes required for existing apps.
- Interop: a function component can be used anywhere a class component is expected (factory produces a compatible instance), and vice versa.
- Events: maintain the library’s delegated event strategy to keep listener counts low.

## Milestones and acceptance criteria
1. Single release (v1.0.0)
   - All functional-component migration work ships together before the v1.0.0 release.
   - Includes: defineComponent with useState/useEffect/useRef/useMemo/useContext/provideContext/portal; interop wrapper to instantiate function components through the existing mounting flow; strong types for the new API.
   - Documentation: update examples (Counter, Fetch, Forms) and add a new “Functional” page; expand docs/usage.md with guidelines and patterns; add migration notes.
   - Quality gates: prototype and internal demos cover mount/render/update/unmount; parity tests mirror class specs (rendering, events via delegation, context, portals, error boundary); SSR renderToString + hydrate interop proven; examples run with router, dark mode, and devtools; bundle size delta minimal (<1 KB gz for core wrapper, target value TBD).
   - Stability: no open P1 bugs and all tests green prior to tagging v1.0.0.

## Testing plan
- Unit tests: hooks semantics (ordering, deps, cleanup), state batching, effect timing.
- Integration tests: functional component with context, portals, SSR/hydration, router params, Query adapter (swr + invalidate).
- Regression guard: run existing suite to ensure no changes to legacy class behavior.

## Documentation work
- docs/usage.md: new “Functional Components” chapter with step-by-step and patterns (state, effects, context, query, portals, forms).
- Migration guide: when to choose functional vs class; interop examples.
- FAQ: performance, event delegation, security (sanitization unchanged), IDE tips.

## Risks and mitigations
- Hook misuse (conditional calls): clear docs and lint recipe recommendation.
- Bundle creep: keep wrapper tiny, optional adapters split into separate subpaths when feasible.
- SSR divergence: reuse existing html() and hydration path to avoid differences.

Notes:
- This document supersedes prior phase-based plans. All previous items are intentionally removed to keep focus on the functional migration.
