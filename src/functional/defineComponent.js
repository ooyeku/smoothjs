import { SmoothComponent } from '../component/SmoothComponent.js';
import { Query } from '../data/query.js';

// Shallow compare dependency arrays with fast paths
/**
 * Compares two dependency arrays and determines if their contents have changed.
 *
 * @param {any[]|null} a - The first dependency array to compare. Can be null.
 * @param {any[]|null} b - The second dependency array to compare. Can be null.
 * @return {boolean} Returns true if the dependency arrays are different, otherwise false.
 */
function depsChanged(a, b) {
  if (a === b) return false;
  if (!a && !b) return false;
  if (!a || !b) return true;
  const len = a.length;
  if (len !== b.length) return true;
  switch (len) {
    case 0: return false;
    case 1: return a[0] !== b[0];
    case 2: return a[0] !== b[0] || a[1] !== b[1];
    case 3: return a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2];
    default:
      for (let i = 0; i < len; i++) {
        if (a[i] !== b[i]) return true;
      }
      return false;
  }
}

/**
 * Defines a functional component as an adapter for `SmoothComponent`.
 * The method accepts a setup function, which defines the component's behavior using hooks and a provided context.
 *
 * @param {Function} setup - A function that sets up the component behavior. It is called with a context object containing utility functions and properties for managing the component state, effects, and DOM interactions.
 * @return {SmoothComponent} A new class extending `SmoothComponent` with the provided setup logic and lifecycle methods.
 */
export function defineComponent(setup) {
  if (typeof setup !== 'function') throw new Error('defineComponent expects a function');

  class FunctionalAdapter extends SmoothComponent {
    constructor(element = null, initialState = {}, props = {}) {
      super(element, initialState, props);
      // Hook storage and effect queues per instance
      this._hooks = new Array(32); // pre-size and reuse
      this._hookIndex = 0;
      this._effects = [];
      this._nextEffects = null;
      this._effectsScheduled = false;
      this._setupRan = false;
      this._setupResult = null;
      this._ctx = null; // stable setup ctx
    }

    /**
     * Initializes internal hook and effect storage for managing component lifecycle methods.
     * Prepares the necessary structures to support hooks and effects without directly invoking setup processes.
     * This method ensures that the component's hooks and effects are in a valid, initialized state before rendering.
     *
     * @return {void} This method does not return a value.
     */
    onCreate() {
      // Ensure hook/effect storage is initialized before any setup/render runs
      if (!this._hooks) this._hooks = new Array(32);
      this._hookIndex = 0;
      if (!this._effects) this._effects = [];
      this._nextEffects = null;
      this._effectsScheduled = false;
      // Do not run setup here; setup will be invoked on each render so state values are fresh
    }

    _ensureHookCapacity(index) {
      if (index < this._hooks.length) return;
      // grow by doubling without replacing the array reference
      let newLen = this._hooks.length || 1;
      while (newLen <= index) newLen *= 2;
      this._hooks.length = newLen;
    }

    _runSetup() {
      this._setupRan = true;
      const ctx = this._buildCtx();
      const res = setup(ctx) || {};
      // Capture lifecycle callbacks from initial setup; render may be recomputed per render
      this._setupResult = {
        render: res.render,
        onMount: res.onMount,
        onUnmount: res.onUnmount,
        onPropsChange: res.onPropsChange,
        onError: res.onError,
        renderError: res.renderError
      };
      // If user provided a renderError fallback, expose it as an instance method for SmoothComponent
      if (typeof res.renderError === 'function') {
        this.renderError = function(err) { return res.renderError.call(this, err); };
      }
    }

    _buildCtx() {
      if (this._ctx) return this._ctx;
      const self = this;
      const ctx = {};
      // Hooks (stable identities)
      const useState = function(initial) { return self._useState(initial); };
      const useRef = function(initial) { return self._useRef(initial); };
      const useMemo = function(factory, deps) { return self._useMemo(factory, deps); };
      const useEffect = function(effect, deps) { return self._useEffect(effect, deps); };
      const useQuery = function(key, fetcher, options) { return self._useQuery(key, fetcher, options); };
      // Composition/utilities passthrough (stable)
      const html = function(strings, ...values) { return self.html(strings, ...values); };
      const portal = function(target, content, key) { return self.portal(target, content, key); };
      const provideContext = function(Context, value) { return self.provideContext(Context, value); };
      const useContext = function(Context) { return self.useContext(Context); };
      const on = function(event, selector, handler) { return self.on(event, selector, handler); };
      const find = function(sel) { return self.find(sel); };
      const findAll = function(sel) { return self.findAll(sel); };
      Object.defineProperties(ctx, {
        props: { get() { return self.props; } },
        children: { get() { return self.children; } },
        element: { get() { return self.element; } }
      });
      // assign stable funcs
      ctx.useState = useState;
      ctx.useRef = useRef;
      ctx.useMemo = useMemo;
      ctx.useEffect = useEffect;
      ctx.useQuery = useQuery;
      ctx.html = html;
      ctx.portal = portal;
      ctx.provideContext = provideContext;
      ctx.useContext = useContext;
      ctx.on = on;
      ctx.find = find;
      ctx.findAll = findAll;
      this._ctx = ctx;
      return ctx;
    }

    // Hook implementations
    _useState(initial) {
      const i = this._hookIndex++;
      this._ensureHookCapacity(i);
      if (!this._hooks[i]) {
        const initVal = (typeof initial === 'function') ? initial() : initial;
        const record = { v: initVal };
        const set = (next) => {
          const prev = record.v;
          const value = (typeof next === 'function') ? next(prev) : next;
          if (!Object.is(value, prev)) {
            record.v = value;
            this._enqueueRender();
          }
        };
        this._hooks[i] = { kind: 'state', record, set };
      }
      const ent = this._hooks[i];
      return [ent.record.v, ent.set];
    }

    _useRef(initial) {
      const i = this._hookIndex++;
      this._ensureHookCapacity(i);
      if (!this._hooks[i]) {
        this._hooks[i] = { kind: 'ref', ref: { current: initial } };
      }
      return this._hooks[i].ref;
    }

    _useMemo(factory, deps) {
      const i = this._hookIndex++;
      this._ensureHookCapacity(i);
      const entry = this._hooks[i];
      if (!entry || entry.kind !== 'memo' || depsChanged(entry.deps, deps)) {
        const value = factory();
        this._hooks[i] = { kind: 'memo', value, deps };
        return value;
      }
      return entry.value;
    }

    _useEffect(create, deps) {
      const i = this._hookIndex++;
      this._ensureHookCapacity(i);
      // Stage effect for this render; actual run happens post-render
      const eff = { create, deps };
      if (!this._nextEffects) this._nextEffects = [];
      this._nextEffects[i] = eff;
      // Ensure placeholder exists so hook indices align
      if (!this._hooks[i]) this._hooks[i] = { kind: 'effect' };
      // Return noop; not used directly by callers in this design
    }

    /**
     * Internal method that initializes or updates a query hook for managing data subscriptions and fetching.
     *
     * @param {string} key - The unique key identifying the query to be used.
     * @param {Function} [fetcher] - An optional function that defines how to fetch the data if not already available.
     * @param {Object} [options={}] - Optional configuration object for the query fetch process.
     * @return {Array} - Returns an array where the first position is a proxy to the query data, and the second position contains helper functions like `refetch`, `invalidate`, etc. to manage the query.
     */
    _useQuery(key, fetcher, options = {}) {
      const i = this._hookIndex++;
      this._ensureHookCapacity(i);
      const k = String(key);
      let entry = this._hooks[i];
      if (!entry || entry.kind !== 'query' || entry.key !== k) {
        // Cleanup previous subscription if reusing slot
        if (entry && entry.kind === 'query' && typeof entry.unsub === 'function') {
          try { entry.unsub(); } catch {}
        }
        const initial = { data: Query.getData(k), error: null, updatedAt: 0 };
        const self = this;
        // Create record first so the subscribe callback can safely reference it
        entry = { kind: 'query', key: k, snapshot: initial, unsub: null };
        this._hooks[i] = entry;
        const unsub = Query.subscribe(k, (snap) => {
          // Update snapshot and request re-render
          entry.snapshot = snap;
          // Back-compat: render immediately when mounted; otherwise enqueue
          if (self.element) {
            try { self.render(); } catch {}
          } else {
            self._enqueueRender();
          }
        });
        entry.unsub = unsub;
        // Kick off fetch lazily; if data appears before this microtask (e.g., via setData), skip
        Promise.resolve().then(() => {
          if (!this.element) return; // unmounted
          const cur = entry && entry.snapshot ? entry.snapshot.data : Query.getData(k);
          if (typeof cur !== 'undefined') return;
          try { Query.fetch(k, typeof fetcher === 'function' ? fetcher : undefined, options); } catch {}
        });
      }
      const getData = () => (entry && entry.snapshot ? entry.snapshot.data : Query.getData(k));
      const proxy = new Proxy({}, {
        /**
         * Retrieves a property from an object or executes specific tasks based on the property name.
         *
         * @param {object} _t - A placeholder parameter not used in the function logic.
         * @param {string} prop - The property name to retrieve or the action to execute.
         * @return {*} Returns the value associated with the specified property if it exists and is an object,
         *             or executes special cases ('__raw__' or 'toJSON') depending on the property name.
         *             Returns undefined if the property does not exist or is not applicable.
         */
        get(_t, prop) {
          if (prop === '__raw__') return getData();
          if (prop === 'toJSON') return () => getData() ?? null;
          const d = getData();
          if (d && typeof d === 'object') return d[prop];
          return undefined;
        },
        /**
         * Checks if a given property exists within a data object.
         *
         * @param {any} _t - An unused parameter in the current context.
         * @param {string} prop - The property name to check within the data object.
         * @return {boolean} Returns true if the property exists in the data object and the object is valid; otherwise, false.
         */
        has(_t, prop) {
          const d = getData();
          if (d && typeof d === 'object') return prop in d;
          return false;
        },
        /**
         * Retrieves the own property keys of an object if the data is valid and of type 'object'.
         * If the data is not valid or not an object, it returns an empty array.
         *
         * @return {Array} An array of the own property keys if the data is a valid object; otherwise, an empty array.
         */
        ownKeys() {
          const d = getData();
          if (d && typeof d === 'object') return Reflect.ownKeys(d);
          return [];
        },
        /**
         * Retrieves the property descriptor for a given property name from an internal object, if available.
         *
         * @param {Object} _t - Ignored parameter, the context or receiver of the call.
         * @param {string} prop - The name of the property for which the descriptor is to be retrieved.
         * @return {Object|undefined} The property descriptor object for the specified property if it exists; otherwise, undefined.
         */
        getOwnPropertyDescriptor(_t, prop) {
          const d = getData();
          if (d && typeof d === 'object') return Object.getOwnPropertyDescriptor(d, prop);
          return undefined;
        }
      });
      const snap = entry.snapshot || { data: Query.getData(k), error: null, updatedAt: 0 };
      const helpers = {
        data: proxy,
        error: snap.error,
        updatedAt: snap.updatedAt,
        refetch: () => Query.refetch(k),
        invalidate: () => Query.invalidate(k),
        remove: () => Query.remove(k),
        invalidateTag: (tag) => Query.invalidateTag(tag)
      };
      return [proxy, helpers];
    }

    // Reconcile and run effects after DOM has been patched
    _flushEffects() {
      this._effectsScheduled = false;
      const prev = this._effects || [];
      const next = this._nextEffects || [];
      this._nextEffects = null;
      // Cleanup removed or changed effects
      const max = Math.max(prev.length, next.length);
      for (let i = 0; i < max; i++) {
        const p = prev[i];
        const n = next[i];
        if (p && (!n || depsChanged(p.deps, n.deps))) {
          if (typeof p.cleanup === 'function') {
            try { p.cleanup(); } catch {}
          }
        }
      }
      // Run new/changed effects
      for (let i = 0; i < next.length; i++) {
        const n = next[i];
        const p = prev[i];
        const shouldRun = !p || !('deps' in p) || (n && depsChanged(p.deps, n.deps));
        // If no deps provided, always run
        const always = n && (n.deps === undefined);
        if (n && (always || shouldRun)) {
          try {
            const cleanup = n.create && n.create();
            n.cleanup = typeof cleanup === 'function' ? cleanup : null;
          } catch {}
        } else if (n && p && p.cleanup) {
          // Keep existing cleanup if effect not re-run
          n.cleanup = p.cleanup;
        }
      }
      this._effects = next;
    }


    /**
     * Executes the `onMount` lifecycle method if defined and performs related setup operations.
     * It invokes the `onMount` function provided in the `_setupResult`, binds any registered events,
     * and schedules the execution of effects for the initial render.
     *
     * @return {void} Does not return a value.
     */
    onMount() {
      if (this._setupResult && typeof this._setupResult.onMount === 'function') {
        try { this._setupResult.onMount.call(this, this._buildCtx()); } catch {}
      }
      // Re-bind events in case user registered them in onMount
      try { this.bindEvents(); } catch {}
      // Run effects scheduled for initial render
      if (!this._effectsScheduled) {
        this._effectsScheduled = true;
        Promise.resolve().then(() => { if (this.element) this._flushEffects(); });
      }
    }

    // Ensure event handlers declared in setup() are bound during hydrate
    hydrate(selector, options = null) {
      // Pre-merge options so setup can see initial props/state if it needs them
      if (options && typeof options === 'object') {
        if (options.props && typeof options.props === 'object') this.props = { ...this.props, ...options.props };
        if (options.state && typeof options.state === 'object') this.state = { ...this.state, ...options.state };
        if (Array.isArray(options.children)) this.children = options.children.slice();
      }
      if (!this._setupRan) {
        try { this._runSetup(); } catch {}
      }
      // Delegate to base hydrate to perform element selection and listener binding
      return super.hydrate(selector, options);
    }

    /**
     * Cleans up resources and subscriptions when the component or instance is unmounted.
     * This method performs the following tasks:
     * 1. Executes the cleanup functions of all registered effects and clears the effects list.
     * 2. Unsubscribes from all query subscriptions and clears their `unsub` references.
     * 3. Invokes the `onUnmount` method of the setup result, if defined.
     *
     * @return {void} This method does not return a value.
     */
    onUnmount() {
      // Cleanup effects
      if (this._effects && this._effects.length) {
        for (const e of this._effects) {
          if (e && typeof e.cleanup === 'function') {
            try { e.cleanup(); } catch {}
          }
        }
      }
      this._effects = [];
      // Cleanup query subscriptions
      if (this._hooks && this._hooks.length) {
        for (const h of this._hooks) {
          if (h && h.kind === 'query' && typeof h.unsub === 'function') {
            try { h.unsub(); } catch {}
            h.unsub = null;
          }
        }
      }
      if (this._setupResult && typeof this._setupResult.onUnmount === 'function') {
        try { this._setupResult.onUnmount.call(this, this._buildCtx()); } catch {}
      }
    }

    /**
     * Handles changes in the component's properties. Invokes the `onPropsChange` method from `_setupResult` if available.
     *
     * @param {Object} prev - The previous properties of the component.
     * @param {Object} next - The updated properties of the component.
     * @return {void}
     */
    onPropsChange(prev, next) {
      if (this._setupResult && typeof this._setupResult.onPropsChange === 'function') {
        try { this._setupResult.onPropsChange.call(this, prev, next); } catch {}
      }
    }

    /**
     * Handles error events by delegating the error to an external callback defined in the setup result, if available.
     *
     * @param {Error} err The error object that occurred.
     * @return {void}
     */
    onError(err) {
      if (this._setupResult && typeof this._setupResult.onError === 'function') {
        try { this._setupResult.onError.call(this, err); } catch {}
      }
    }

    /**
     * Executes the template logic, including the setup process, rendering,
     * lifecycle callbacks, and effect scheduling.
     *
     * @return {string} The rendered output, computed by the template's render function,
     *                  or an empty string if no valid render function is found.
     */
    template() {
      this._hookIndex = 0;
      // Build a stable ctx (created lazily once)
      const ctx = this._buildCtx();
      // Invoke setup on every render to compute current render with fresh state values
      const res = setup(ctx) || {};
      if (!this._setupRan) {
        // Capture lifecycle callbacks only on first run
        this._setupRan = true;
        this._setupResult = {
          render: res.render,
          onMount: res.onMount,
          onUnmount: res.onUnmount,
          onPropsChange: res.onPropsChange,
          onError: res.onError,
          renderError: res.renderError
        };
        if (typeof res.renderError === 'function') {
          this.renderError = function(err) { return res.renderError.call(this, err); };
        }
      }
      const output = (typeof res.render === 'function') ? res.render.call(this, ctx) : '';
      // Schedule effect flush after this render cycle
      if (!this._effectsScheduled) {
        this._effectsScheduled = true;
        Promise.resolve().then(() => {
          this._effectsScheduled = false;
          if (this.element) this._flushEffects();
        });
      }
      return output;
    }
  }

  return FunctionalAdapter;
}

export default { defineComponent };
