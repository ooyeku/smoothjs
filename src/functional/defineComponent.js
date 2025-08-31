import { SmoothComponent } from '../component/SmoothComponent.js';

// Shallow compare dependency arrays
function depsChanged(a, b) {
  if (!a && !b) return false;
  if (!a || !b) return true;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return true;
  }
  return false;
}

export function defineComponent(setup) {
  if (typeof setup !== 'function') throw new Error('defineComponent expects a function');

  class FunctionalAdapter extends SmoothComponent {
    constructor(element = null, initialState = {}, props = {}) {
      super(element, initialState, props);
      // Hook storage and effect queues per instance
      this._hooks = [];
      this._hookIndex = 0;
      this._effects = [];
      this._nextEffects = null;
      this._effectsScheduled = false;
      this._setupRan = false;
      this._setupResult = null;
    }

    onCreate() {
      // Ensure hook/effect storage is initialized before any setup/render runs
      if (!this._hooks) this._hooks = [];
      this._hookIndex = 0;
      if (!this._effects) this._effects = [];
      this._nextEffects = null;
      this._effectsScheduled = false;
      // Do not run setup here; setup will be invoked on each render so state values are fresh
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
        onError: res.onError
      };
    }

    _buildCtx() {
      // Build a stable context view each call; functions bound to this
      const self = this;
      const ctx = {};
      // Hooks
      ctx.useState = function(initial) { return self._useState(initial); };
      ctx.useRef = function(initial) { return self._useRef(initial); };
      ctx.useMemo = function(factory, deps) { return self._useMemo(factory, deps); };
      ctx.useEffect = function(effect, deps) { return self._useEffect(effect, deps); };
      // Composition/utilities passthrough
      ctx.html = function(strings, ...values) { return self.html(strings, ...values); };
      ctx.portal = function(target, content, key) { return self.portal(target, content, key); };
      ctx.provideContext = function(Context, value) { return self.provideContext(Context, value); };
      ctx.useContext = function(Context) { return self.useContext(Context); };
      ctx.on = function(event, selector, handler) { return self.on(event, selector, handler); };
      // Accessors
      Object.defineProperties(ctx, {
        props: { get() { return self.props; } },
        children: { get() { return self.children; } },
        element: { get() { return self.element; } }
      });
      ctx.find = function(sel) { return self.find(sel); };
      ctx.findAll = function(sel) { return self.findAll(sel); };
      return ctx;
    }

    // Hook implementations
    _useState(initial) {
      const i = this._hookIndex++;
      if (!this._hooks[i]) {
        const initVal = (typeof initial === 'function') ? initial() : initial;
        const record = { v: initVal };
        const access = {};
        Object.defineProperty(access, 'value', { get() { return record.v; } });
        access.valueOf = function() { return record.v; };
        access.toString = function() { return String(record.v); };
        const set = (next) => {
          const prev = record.v;
          const value = (typeof next === 'function') ? next(prev) : next;
          if (value !== prev) {
            record.v = value;
            // schedule re-render
            this._enqueueRender();
          }
        };
        this._hooks[i] = { kind: 'state', record, access, set };
      }
      const ent = this._hooks[i];
      return [ent.access, ent.set];
    }

    _useRef(initial) {
      const i = this._hookIndex++;
      if (!this._hooks[i]) {
        this._hooks[i] = { kind: 'ref', ref: { current: initial } };
      }
      return this._hooks[i].ref;
    }

    _useMemo(factory, deps) {
      const i = this._hookIndex++;
      const entry = this._hooks[i];
      if (!entry || entry.kind !== 'memo' || depsChanged(entry.deps, deps)) {
        const value = factory();
        this._hooks[i] = { kind: 'memo', value, deps: deps ? deps.slice() : deps };
        return value;
      }
      return entry.value;
    }

    _useEffect(create, deps) {
      const i = this._hookIndex++;
      // Stage effect for this render; actual run happens post-render
      const eff = { create, deps: deps ? deps.slice() : deps };
      if (!this._nextEffects) this._nextEffects = [];
      this._nextEffects[i] = eff;
      // Ensure placeholder exists so hook indices align
      if (!this._hooks[i]) this._hooks[i] = { kind: 'effect' };
      // Return noop; not used directly by callers in this design
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

    // Lifecycle bridging
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
      if (this._setupResult && typeof this._setupResult.onUnmount === 'function') {
        try { this._setupResult.onUnmount.call(this, this._buildCtx()); } catch {}
      }
    }

    onPropsChange(prev, next) {
      if (this._setupResult && typeof this._setupResult.onPropsChange === 'function') {
        try { this._setupResult.onPropsChange.call(this, prev, next); } catch {}
      }
    }

    onError(err) {
      if (this._setupResult && typeof this._setupResult.onError === 'function') {
        try { this._setupResult.onError.call(this, err); } catch {}
      }
    }

    template() {
      if (!this._setupRan) this._runSetup();
      this._hookIndex = 0;
      // Build a fresh ctx for user render each call
      const ctx = this._buildCtx();
      const render = this._setupResult && this._setupResult.render;
      const output = (typeof render === 'function') ? render.call(this, ctx) : '';
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
