import './theme.js';
/**
 * A private WeakMap to serve as a registry for associating context-specific data with objects.
 * The `_contextRegistry` is used internally to maintain a mapping between objects and their corresponding
 * data in a memory-efficient way. The use of `WeakMap` ensures that the keys (objects) do not prevent garbage
 * collection, aiding in memory management.
 *
 * This variable should not be accessed directly and is intended for internal use only.
 *
 * Key: An object for which context-specific data needs to be tracked.
 * Value: The context-specific data associated with the key object.
 */
const _contextRegistry = new WeakMap(); // WeakMap<Element, Map<symbol, any>> for context values
/**
 * Determines whether error logging should be enabled based on the current environment.
 *
 * The method checks specific environment variables and global properties to decide if
 * error logging is appropriate. Logging is disabled in testing environments.
 *
 * @return {boolean} Returns true if errors should be logged, false otherwise.
 */
function _shouldLogErrors() {
  try {
    const env = (typeof process !== 'undefined' && process && process.env) ? process.env : {};
    if (env.NODE_ENV === 'test') return false;
    if (env.VITEST) return false;
    if (typeof globalThis !== 'undefined') {
      if (globalThis.__VITEST_BROWSER__ || globalThis.VITEST) return false;
    }
  } catch {}
  return true;
}

/**
 * SmoothComponent represents a base class designed for managing state, properties,
 * rendering, and lifecycle events of a component in a smooth and efficient manner.
 * It leverages batching, context handling, and portals to manage complex rendering scenarios.
 */
export class SmoothComponent {
  static _dirty = new Set();
  static _scheduled = false;
  static _batchDepth = 0;
  static _needsFlush = false;
  static _byEl = new WeakMap();

  static _scheduleFlush(force = false) {
    if (this._batchDepth > 0 && !force) {
      this._needsFlush = true;
      return;
    }
    if (this._scheduled) return;
    this._scheduled = true;
    Promise.resolve().then(() => this._flush());
  }

  static _flush() {
    this._scheduled = false;
    const items = Array.from(this._dirty);
    this._dirty.clear();
    for (const inst of items) {
      try { inst.render(); } catch (e) { /* render() already handles errors */ }
    }
    if (this._batchDepth === 0 && this._needsFlush) {
      this._needsFlush = false;
    }
  }

  static batch(fn) {
    this._batchDepth++;
    try {
      return fn && fn();
    } finally {
      this._batchDepth--;
      if (this._batchDepth === 0) {
        if (this._dirty.size > 0) this._scheduleFlush(true);
      }
    }
  }

  constructor(element = null, initialState = {}, props = {}) {
    this.element = element;
    this.state = { ...initialState };
    this.props = { ...(props || {}) };
    this.events = new Map();
    this.children = [];
    this.isRendering = false;
    this._pendingState = null;
    this._pendingProps = null;
    this._mounted = false;
    this._pendingContext = null;
    this._pendingPortals = [];
    this._portalMap = new Map(); // id -> { targetEl, containerEl }
    this._delegatedHandlers = new Map(); // Back-compat alias: event -> root listener
    this._rootListeners = new Map(); // event -> listener
    this._delegationRules = new Map(); // event -> [{ sel, handler }]
    this._isComposing = false; // IME composition flag
    this._range = null; // per-instance Range cache
    this._lastHtml = null; // last template string for no-op detection
    this._postScheduled = false; // microtask scheduler flag

    this.onCreate();
  }

  onCreate() {}
  
  onMount() {}
  
  onUnmount() {}
  
  onStateChange(prevState, newState) {}
  
  onPropsChange(prevProps, newProps) {}
  
  get isMounted() {
    return !!this._mounted;
  }
  
  _enqueueRender() {
    SmoothComponent._dirty.add(this);
    SmoothComponent._scheduleFlush();
  }

  setChildren(children) {
    if (children == null) {
      this.children = [];
    } else if (Array.isArray(children)) {
      this.children = children.slice();
    } else {
      this.children = [children];
    }
    this._enqueueRender();
  }
  
  setState(update) {
    const partial = typeof update === 'function' ? update({ ...this.state }) : update;
    if (!partial || typeof partial !== 'object') return;

    if (this.isRendering) {
      // Queue updates during render and merge shallowly
      this._pendingState = { ...(this._pendingState || {}), ...partial };
      return;
    }
    
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partial };
    try {
      this.onStateChange(prevState, this.state);
    } catch (err) {
      console.error('onStateChange error:', err);
    }
    this._enqueueRender();
  }
  
  setProps(update) {
    const partial = typeof update === 'function' ? update({ ...this.props }) : update;
    if (!partial || typeof partial !== 'object') return;
    if (this.isRendering) {
      this._pendingProps = { ...(this._pendingProps || {}), ...partial };
      return;
    }
    const prevProps = { ...this.props };
    this.props = { ...this.props, ...partial };
    try {
      this.onPropsChange(prevProps, this.props);
    } catch (err) {
      console.error('onPropsChange error:', err);
    }
    this._enqueueRender();
  }
  
  template() {
    return `<div>Override template() method</div>`;
  }
  
  html(strings, ...values) {
    const parts = [];
    for (let i = 0; i < strings.length; i++) {
      parts.push(strings[i]);
      if (i < values.length) {
        const value = values[i];
        if (value && value.__smooth_portal__ === true) {
          // portal placeholder contributes nothing to inline HTML
        } else if (value == null) {
          // null/undefined => empty string
        } else if (Array.isArray(value)) {
          // arrays joined by comma per tests expectation
          parts.push(value.join(','));
        } else {
          parts.push(String(value));
        }
      }
    }
    return parts.join('');
  }

  // Composition helpers
  renderChildren() {
    if (!this.children || this.children.length === 0) return '';
    return this.children.map(ch => {
      if (ch == null || ch === false) return '';
      if (typeof ch === 'string') return ch;
      if (ch instanceof Node) return ch.outerHTML || ch.textContent || '';
      return String(ch);
    }).join('');
  }

  provideContext(ctx, value) {
    if (!ctx || !ctx.id) return;
    const apply = (el) => {
      if (!el) return;
      let map = _contextRegistry.get(el);
      if (!map) { map = new Map(); _contextRegistry.set(el, map); }
      map.set(ctx.id, value);
    };
    this._contexts = this._contexts || new Set();
    this._contexts.add(ctx.id);
    if (this.element) apply(this.element); else {
      this._pendingContext = this._pendingContext || [];
      this._pendingContext.push({ id: ctx.id, value });
    }
  }

  useContext(ctx) {
    if (!ctx || !ctx.id) return ctx ? ctx.defaultValue : undefined;
    let el = this.element;
    while (el) {
      const map = _contextRegistry.get(el);
      if (map && map.has(ctx.id)) return map.get(ctx.id);
      el = el.parentElement;
    }
    return ctx.defaultValue;
  }

  portal(target, content, key = null) {
    // Defer rendering to after main patch; return a marker object recognized by html()
    const id = (this.constructor._portalCounter = (this.constructor._portalCounter || 0) + 1);
    const k = key != null ? String(key) : (typeof target === 'string' ? `sel:${target}` : `el:${id}`);
    this._pendingPortals.push({ id, key: k, target, content });
    return { __smooth_portal__: true, id };
  }
  
  _processPortals() {
    if (!this._pendingPortals || this._pendingPortals.length === 0) return;
    for (const p of this._pendingPortals) {
      const targetEl = typeof p.target === 'string' ? (document.querySelector(p.target)) : (p.target || null);
      if (!targetEl) continue;
      // get or create container in target
      let rec = this._portalMap.get(p.key);
      if (!rec || !rec.targetEl || rec.targetEl !== targetEl) {
        if (rec && rec.containerEl && rec.containerEl.parentNode) {
          try { rec.containerEl.parentNode.removeChild(rec.containerEl); } catch {}
        }
        const containerEl = document.createElement('div');
        containerEl.setAttribute('data-smooth-portal', p.key);
        targetEl.appendChild(containerEl);
        rec = { targetEl, containerEl };
        this._portalMap.set(p.key, rec);
      }
      // Build new content fragment using per-instance Range
      let frag = document.createDocumentFragment();
      const c = (typeof p.content === 'function') ? p.content.call(this, this) : p.content;
      if (typeof c === 'string') {
        try {
          const range = this._getRange(rec.containerEl);
          if (range) frag = range.createContextualFragment(c);
        } catch {
          const tmp = document.createElement('div');
          tmp.innerHTML = c;
          while (tmp.firstChild) frag.appendChild(tmp.firstChild);
        }
      } else if (c instanceof Node) {
        frag.appendChild(c);
      } else if (Array.isArray(c)) {
        const tmp = document.createElement('div');
        tmp.innerHTML = c.join('');
        while (tmp.firstChild) frag.appendChild(tmp.firstChild);
      } else if (c != null) {
        frag.appendChild(document.createTextNode(String(c)));
      }
      this._patchChildren(
        rec.containerEl,
        Array.from(rec.containerEl.childNodes),
        Array.from(frag.childNodes)
      );
    }
    this._pendingPortals.length = 0;
  }

  // Lightweight DOM utilities for diffing
  _isText(node) { return node && node.nodeType === Node.TEXT_NODE; }
  _isElement(node) { return node && node.nodeType === Node.ELEMENT_NODE; }
  _sameType(a, b) {
    if (!a || !b) return false;
    if (this._isText(a) && this._isText(b)) return true;
    return this._isElement(a) && this._isElement(b) && a.tagName === b.tagName;
  }
  _getKey(node) {
    return this._isElement(node) ? (node.getAttribute('data-key') || null) : null;
  }
  _getRange(ctxNode) {
    if (typeof document === 'undefined') return null;
    if (!this._range) {
      try { this._range = document.createRange(); } catch { this._range = null; }
    }
    if (this._range && ctxNode) {
      try { this._range.selectNode(ctxNode); }
      catch { try { this._range.selectNodeContents(ctxNode); } catch {} }
    }
    return this._range;
  }
  _setAttributes(el, fromEl) {
    // Fast-path: if attributes sets are identical by name/value, skip churn
    const oldAttrs = el.attributes;
    const newAttrs = fromEl.attributes;
    let identical = oldAttrs.length === newAttrs.length;
    if (identical) {
      for (let i = 0; i < newAttrs.length; i++) {
        const { name, value } = newAttrs[i];
        if (el.getAttribute(name) !== value) { identical = false; break; }
      }
    }
    if (!identical) {
      // Remove old attrs not in fromEl
      for (let i = oldAttrs.length - 1; i >= 0; i--) {
        const name = oldAttrs[i].name;
        if (!fromEl.hasAttribute(name)) el.removeAttribute(name);
      }
      // Set/update attrs
      for (let i = 0; i < newAttrs.length; i++) {
        const { name, value } = newAttrs[i];
        if (el.getAttribute(name) !== value) el.setAttribute(name, value);
      }
    }
    // Sync common properties for form elements
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      const isActive = (typeof document !== 'undefined') ? (document.activeElement === el) : false;
      const composing = !!this._isComposing && isActive;
      if (!composing && 'value' in fromEl && el.value !== fromEl.value) {
        el.value = fromEl.value;
      }
      if ('checked' in fromEl && el.checked !== fromEl.checked) el.checked = fromEl.checked;
      if ('disabled' in fromEl) el.disabled = fromEl.disabled;
    }
  }
  _patch(parent, oldNode, newNode) {
    if (!oldNode && newNode) {
      // Insert the actual parsed node (move from fragment), avoid cloning
      parent.appendChild(newNode);
      return;
    }
    if (oldNode && !newNode) {
      parent.removeChild(oldNode);
      return;
    }
    if (!this._sameType(oldNode, newNode)) {
      // Replace with the actual node
      parent.replaceChild(newNode, oldNode);
      return;
    }
    if (this._isText(oldNode) && this._isText(newNode)) {
      if (oldNode.nodeValue !== newNode.nodeValue) oldNode.nodeValue = newNode.nodeValue;
      return;
    }
    // Element nodes of same tag
    this._setAttributes(oldNode, newNode);
    this._patchChildren(oldNode, Array.from(oldNode.childNodes), Array.from(newNode.childNodes));
  }
  _patchChildren(parentEl, oldChildren, newChildren) {
    // Determine if keyed reconciliation should be used
    const hasKeys = newChildren.some(n => this._getKey(n) != null) || oldChildren.some(n => this._getKey(n) != null);
    if (hasKeys) {
      // Dev diagnostic: warn when mixing keyed and unkeyed in dynamic lists (can be error-prone)
      try {
        const env = (typeof process !== 'undefined' && process && process.env) ? process.env : {};
        const isProd = env && (env.NODE_ENV === 'production');
        if (!isProd) {
          const hasKeyed = newChildren.some(n => this._getKey(n) != null);
          const hasUnkeyed = newChildren.some(n => this._getKey(n) == null);
          if (hasKeyed && hasUnkeyed) {
            console.warn('[smoothjs] Mixing keyed and unkeyed children in a dynamic list may lead to surprising reconciliation. Prefer all-keyed.');
          }
        }
      } catch {}
      // Build maps for old keyed children
      const oldKeyToNode = new Map();
      const oldKeyToIndex = new Map();
      for (let i = 0; i < oldChildren.length; i++) {
        const k = this._getKey(oldChildren[i]);
        if (k != null) {
          const key = String(k);
          oldKeyToNode.set(key, oldChildren[i]);
          oldKeyToIndex.set(key, i);
        }
      }

      // Build sequence of old indices for new keyed order; -1 for new nodes
      const newLen = newChildren.length;
      const seq = new Array(newLen);
      const keyedPositions = new Array(newLen);
      for (let i = 0; i < newLen; i++) {
        const k = this._getKey(newChildren[i]);
        if (k != null) {
          const key = String(k);
          keyedPositions[i] = true;
          const idx = oldKeyToIndex.has(key) ? oldKeyToIndex.get(key) : -1;
          seq[i] = idx;
        } else {
          keyedPositions[i] = false;
          seq[i] = -2; // sentinel for unkeyed
        }
      }

      // Compute LIS indices for existing keyed nodes (seq >= 0)
      const lis = (() => {
        const arr = [];
        const pos = [];
        const prev = new Array(newLen).fill(-1);
        for (let i = 0; i < newLen; i++) {
          const v = seq[i];
          if (v < 0) { continue; }
          let l = 0, r = arr.length;
          while (l < r) {
            const m = (l + r) >> 1;
            if (arr[m] < v) l = m + 1; else r = m;
          }
          if (l >= arr.length) arr.push(v); else arr[l] = v;
          pos[l] = i;
          if (l > 0) prev[i] = pos[l - 1];
        }
        let k = arr.length ? pos[arr.length - 1] : -1;
        const result = new Set();
        while (k !== -1) { result.add(k); k = prev[k]; }
        return result;
      })();

      // Track which old keys were seen to remove leftovers later
      const seen = new Set();
      // Anchor for insertBefore; iterate from end for stable moves
      let anchor = null;
      for (let i = newLen - 1; i >= 0; i--) {
        const newChild = newChildren[i];
        const k = this._getKey(newChild);
        if (k != null) {
          const key = String(k);
          const existing = oldKeyToNode.get(key);
          if (existing) {
            seen.add(key);
            // Patch content
            this._patch(parentEl, existing, newChild);
            // Move only if not part of LIS
            if (!lis.has(i)) {
              parentEl.insertBefore(existing, anchor);
            }
          } else {
            // Brand new keyed node: insert actual node from fragment
            parentEl.insertBefore(newChild, anchor);
          }
        } else {
          // Unkeyed: align by current index i
          const at = parentEl.childNodes[i] || anchor;
          // If there's a node at i and it's the same type, patch in place; otherwise insert
          const currentAtI = parentEl.childNodes[i] || null;
          if (currentAtI) {
            this._patch(parentEl, currentAtI, newChild);
          } else {
            parentEl.insertBefore(newChild, anchor);
          }
        }
        anchor = parentEl.childNodes[i] ? parentEl.childNodes[i].nextSibling : anchor;
      }

      // Remove any old keyed nodes not present in newChildren
      for (const [key, node] of oldKeyToNode.entries()) {
        if (!seen.has(key) && node.parentNode === parentEl) {
          parentEl.removeChild(node);
        }
      }

      // In mixed lists, remove obsolete unkeyed nodes that occupy positions
      // where new children expect keyed nodes (e.g., placeholder rows like "No items")
      const desiredLen = newChildren.length;
      for (let i = 0; i < Math.min(parentEl.childNodes.length, desiredLen); i++) {
        if (keyedPositions[i]) {
          const n = parentEl.childNodes[i];
          if (this._getKey(n) == null) {
            parentEl.removeChild(n);
            i--; // re-check this index after removal
          }
        }
      }

      // Trim extra nodes if parent has more than needed
      while (parentEl.childNodes.length > desiredLen) {
        parentEl.removeChild(parentEl.lastChild);
      }
      return;
    }
    // Non-keyed: patch by index using existing and new nodes (move instead of clone)
    const minLen = Math.min(oldChildren.length, newChildren.length);
    for (let i = 0; i < minLen; i++) this._patch(parentEl, oldChildren[i], newChildren[i]);
    // Append new
    for (let i = minLen; i < newChildren.length; i++) parentEl.appendChild(newChildren[i]);
    // Remove old
    for (let i = minLen; i < oldChildren.length; i++) parentEl.removeChild(oldChildren[i]);
  }
  
  render() {
    if (typeof document === 'undefined') return;
    if (!this.element || this.isRendering) return;
    
    // Register element-instance mapping
    try { if (this.element) this.constructor._byEl.set(this.element, this); } catch {}

    // Apply any pending context entries now that we have an element
    if (this._pendingContext && this.element) {
      for (const entry of this._pendingContext) {
        let map = _contextRegistry.get(this.element);
        if (!map) { map = new Map(); _contextRegistry.set(this.element, map); }
        map.set(entry.id, entry.value);
      }
      this._pendingContext = null;
    }
    
    // Capture focus inside this component before rendering
    let focusInfo = null;
    try {
      const active = document.activeElement;
      if (active && this.element.contains(active)) {
        focusInfo = {
          id: active.id || null,
          name: active.getAttribute ? active.getAttribute('name') : null,
          isContentEditable: !!active.isContentEditable,
          selectionStart: (typeof active.selectionStart === 'number') ? active.selectionStart : null,
          selectionEnd: (typeof active.selectionEnd === 'number') ? active.selectionEnd : null
        };
      }
    } catch {}

    try {
      this.isRendering = true;
      const html = this.template();

      // No-op render detection for string templates
      let skippedPatch = false;
      if (typeof html === 'string') {
        const same = this._lastHtml != null && this._lastHtml === html;
        const hasDOM = this.element && this.element.childNodes && this.element.childNodes.length > 0;
        // Only skip when mounted and DOM is already present
        skippedPatch = same && this._mounted && hasDOM;
        this._lastHtml = html;
      } else {
        this._lastHtml = null; // non-string outputs disable string cache
      }

      if (!skippedPatch) {
        // Build a DocumentFragment for the new content to avoid clones
        let frag = document.createDocumentFragment();
        if (html == null) {
          // nothing
        } else if (typeof html === 'string') {
          try {
            const range = this._getRange(this.element);
            if (range) frag = range.createContextualFragment(html);
          } catch {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            while (tmp.firstChild) frag.appendChild(tmp.firstChild);
          }
        } else if (html instanceof Node) {
          frag.appendChild(html);
        } else {
          const tmp = document.createTextNode(String(html));
          frag.appendChild(tmp);
        }
        // Capture children arrays once
        const oldChildren = Array.from(this.element.childNodes);
        const newChildren = Array.from(frag.childNodes);
        // Patch children of root element to match the new content
        this._patchChildren(
          this.element,
          oldChildren,
          newChildren
        );
      }

      // Coalesce post-patch work (listeners + portals) into one microtask
      this._schedulePostPatch();

      const firstMount = !this._mounted;
      if (firstMount) {
        this._mounted = true;
        try { this.onMount(); } catch (e) { console.error('onMount error:', e); }
      }

      // Restore focus if possible
      if (focusInfo) {
        let target = null;
        if (focusInfo.id) {
          // Prefer ID lookup (unique)
          try { target = document.getElementById(focusInfo.id); } catch {}
        }
        if (!target && focusInfo.name) {
          try { target = this.element.querySelector(`[name="${focusInfo.name}"]`); } catch {}
        }
        if (target && this.element.contains(target)) {
          try {
            target.focus();
            if (focusInfo.selectionStart != null && focusInfo.selectionEnd != null && typeof target.setSelectionRange === 'function') {
              // Guard against inputs that don't support selection
              target.setSelectionRange(focusInfo.selectionStart, focusInfo.selectionEnd);
            }
          } catch {}
        }
      }
    } catch (error) {
      try { if (typeof this.onError === 'function') this.onError(error); } catch (e) { console.error('onError error:', e); }
      if (_shouldLogErrors()) console.error(`Error rendering component:`, error);
      try { if (typeof window !== 'undefined' && window && window.dispatchEvent) window.dispatchEvent(new CustomEvent('smooth:error', { detail: { error, component: this } })); } catch {}
      if (this.element) {
        try {
          if (typeof this.renderError === 'function') {
            const fallback = this.renderError(error) || '';
            const c = document.createElement('div');
            if (typeof fallback === 'string') c.innerHTML = fallback; else if (fallback instanceof Node) c.appendChild(fallback);
            this._patchChildren(this.element, Array.from(this.element.childNodes), Array.from(c.childNodes));
            // Bind events for fallback UI too
            this.bindEvents();
          } else {
            this.element.innerHTML = `<div style=\"color: red;\">Component Error: ${error && error.message ? error.message : String(error)}</div>`;
          }
        } catch (e2) {
          this.element.innerHTML = `<div style=\"color: red;\">Component Error</div>`;
        }
      }
    } finally {
      this.isRendering = false;
      const pendingState = this._pendingState;
      const pendingProps = this._pendingProps;
      this._pendingState = null;
      this._pendingProps = null;
      if (pendingState) this.setState(pendingState);
      if (pendingProps) this.setProps(pendingProps);
    }
  }
  
  _schedulePostPatch() {
    if (this._postScheduled) return;
    this._postScheduled = true;
    Promise.resolve().then(() => {
      this._postScheduled = false;
      if (!this.element) return;
      try { this.bindEvents(); } catch {}
      try { this._processPortals && this._processPortals(); } catch (e) { console.error('portal processing error:', e); }
    });
  }

  bindEvents() {
    if (!this.element) return;

    // Build desired delegation rules: event -> [{ sel, handler }]
    const desired = new Map();
    this.events.forEach((handler, key) => {
      const idx = key.indexOf(':');
      const event = idx >= 0 ? key.slice(0, idx) : key;
      const sel = idx >= 0 ? key.slice(idx + 1) : null;
      if (!desired.has(event)) desired.set(event, []);
      desired.get(event).push({ sel, handler });
    });

    // Reconcile listeners: remove events no longer needed
    for (const [evt, fn] of this._rootListeners.entries()) {
      if (!desired.has(evt) && evt !== 'compositionstart' && evt !== 'compositionend') {
        try { this.element.removeEventListener(evt, fn); } catch {}
        this._rootListeners.delete(evt);
        this._delegationRules.delete(evt);
      }
    }

    // Add/update needed listeners
    for (const [evt, rules] of desired.entries()) {
      this._delegationRules.set(evt, rules);
      if (!this._rootListeners.has(evt)) {
        const listener = (e) => {
          const rulesArr = this._delegationRules.get(evt) || [];
          for (const { sel, handler } of rulesArr) {
            if (sel) {
              let matchEl = null;
              try { matchEl = e.target && this.element && this.element.contains(e.target) ? e.target.closest(sel) : null; } catch {}
              if (matchEl && this.element.contains(matchEl)) {
                const proxy = new Proxy(e, {
                  get(target, prop) {
                    if (prop === 'currentTarget') return matchEl;
                    // Use Reflect.get without proxy receiver so native getters see the original event
                    const val = Reflect.get(target, prop);
                    return typeof val === 'function' ? val.bind(target) : val;
                  }
                });
                handler(proxy);
              }
            } else {
              handler(e);
            }
          }
        };
        this.element.addEventListener(evt, listener);
        this._rootListeners.set(evt, listener);
      }
    }

    // Attach IME composition listeners once
    if (!this._compositionBound) {
      const onStart = () => { this._isComposing = true; };
      const onEnd = () => { this._isComposing = false; try { this._enqueueRender(); } catch {} };
      try {
        this.element.addEventListener('compositionstart', onStart);
        this.element.addEventListener('compositionend', onEnd);
        this._rootListeners.set('compositionstart', onStart);
        this._rootListeners.set('compositionend', onEnd);
        this._compositionBound = true;
      } catch {}
    }
  }
  
  on(event, selector, handler) {
    if (typeof event !== 'string' || !event) return this;
    if (typeof selector === 'function') {
      handler = selector;
      selector = null;
    }
    if (typeof handler !== 'function') return this;
    
    const key = selector ? `${event}:${selector}` : event;
    this.events.set(key, handler.bind(this));
    return this;
  }

  off(event, selector) {
    const key = selector ? `${event}:${selector}` : event;
    this.events.delete(key);
    return this;
  }
  
  mount(selector, options = null) {
    if (typeof document === 'undefined') return this;
    if (options && typeof options === 'object') {
      if (options.props && typeof options.props === 'object') this.props = { ...this.props, ...options.props };
      if (Array.isArray(options.children)) this.children = options.children.slice();
    }
    if (typeof selector === 'string') {
      this.element = document.querySelector(selector);
    } else {
      this.element = selector || this.element;
    }
    
    if (!this.element) {
      console.warn(`Element not found: ${selector}`);
      return this;
    }
    
    this.render();
    return this;
  }

  // Hydrate: bind events to existing server-rendered markup without initial render
  hydrate(selector, options = null) {
    if (typeof document === 'undefined') return this;
    if (options && typeof options === 'object') {
      if (options.props && typeof options.props === 'object') this.props = { ...this.props, ...options.props };
      if (options.state && typeof options.state === 'object') this.state = { ...this.state, ...options.state };
      if (Array.isArray(options.children)) this.children = options.children.slice();
    }
    if (typeof selector === 'string') {
      this.element = document.querySelector(selector);
    } else {
      this.element = selector || this.element;
    }
    if (!this.element) {
      console.warn(`Element not found for hydrate: ${selector}`);
      return this;
    }
    this.bindEvents();
    this._mounted = true;
    try { this.onMount(); } catch (e) { console.error('onMount error during hydrate:', e); }
    return this;
  }
  
  unmount() {
    if (this.element) {
      try {
        this.onUnmount();
      } catch (err) {
        console.error('onUnmount error:', err);
      }
      // Clean up portals
      if (this._portalMap) {
        try {
          for (const rec of this._portalMap.values()) {
            if (rec && rec.containerEl && rec.containerEl.parentNode) {
              rec.containerEl.parentNode.removeChild(rec.containerEl);
            }
          }
        } catch {}
        this._portalMap.clear();
      }
      // Clear context entries for this element
      try { if (this.element) _contextRegistry.delete(this.element); } catch {}
      // Remove delegated root listeners (legacy)
      if (this._delegatedHandlers && this._delegatedHandlers.size) {
        try {
          for (const [evt, fn] of this._delegatedHandlers.entries()) {
            this.element.removeEventListener(evt, fn);
          }
        } catch {}
        this._delegatedHandlers.clear();
      }
      // Remove reconciled root listeners
      if (this._rootListeners && this._rootListeners.size) {
        try {
          for (const [evt, fn] of this._rootListeners.entries()) {
            this.element.removeEventListener(evt, fn);
          }
        } catch {}
        this._rootListeners.clear();
      }
      if (this._delegationRules) {
        try { this._delegationRules.clear(); } catch {}
      }
      this.events.clear();
      this.element.innerHTML = '';
      // Reset small caches to avoid stale state across lifecycles
      this._lastHtml = null;
      this._postScheduled = false;
      this._range = null;
      this.element = null;
      this._mounted = false;
    }
    // Clear children to release references
    this.children = [];
  }
  
  find(selector) {
    return this.element ? this.element.querySelector(selector) : null;
  }
  
  findAll(selector) {
    return this.element ? Array.from(this.element.querySelectorAll(selector)) : [];
  }
}
