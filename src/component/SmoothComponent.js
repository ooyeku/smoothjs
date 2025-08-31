const _contextRegistry = new WeakMap(); // WeakMap<Element, Map<symbol, any>> for context values
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
    let result = '';
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < values.length) {
        const value = values[i];
        if (value && value.__smooth_portal__ === true) {
          // portal placeholder contributes nothing to inline HTML
          result += '';
        } else if (value == null) {
          // null/undefined => empty string
          result += '';
        } else if (Array.isArray(value)) {
          // arrays joined by comma per tests expectation
          result += value.join(',');
        } else {
          result += String(value);
        }
      }
    }
    return result;
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
        // if existing container exists in a different target, remove it
        if (rec && rec.containerEl && rec.containerEl.parentNode) {
          try { rec.containerEl.parentNode.removeChild(rec.containerEl); } catch {}
        }
        const containerEl = document.createElement('div');
        containerEl.setAttribute('data-smooth-portal', p.key);
        targetEl.appendChild(containerEl);
        rec = { targetEl, containerEl };
        this._portalMap.set(p.key, rec);
      }
      // Build new content fragment
      const tmp = document.createElement('div');
      const c = (typeof p.content === 'function') ? p.content.call(this, this) : p.content;
      if (typeof c === 'string') tmp.innerHTML = c;
      else if (c instanceof Node) tmp.appendChild(c.cloneNode(true));
      else if (Array.isArray(c)) tmp.innerHTML = c.join('');
      else if (c != null) tmp.textContent = String(c);
      // Patch target container children
      this._patchChildren(
        rec.containerEl,
        Array.from(rec.containerEl.childNodes),
        Array.from(tmp.childNodes)
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
  _setAttributes(el, fromEl) {
    // Remove old attrs not in fromEl
    const oldAttrs = el.attributes;
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name = oldAttrs[i].name;
      if (!fromEl.hasAttribute(name)) el.removeAttribute(name);
    }
    // Set/update attrs
    for (let i = 0; i < fromEl.attributes.length; i++) {
      const { name, value } = fromEl.attributes[i];
      if (el.getAttribute(name) !== value) el.setAttribute(name, value);
    }
    // Sync common properties for form elements
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      if ('value' in fromEl && el.value !== fromEl.value) el.value = fromEl.value;
      if ('checked' in fromEl && el.checked !== fromEl.checked) el.checked = fromEl.checked;
      if ('disabled' in fromEl) el.disabled = fromEl.disabled;
    }
  }
  _patch(parent, oldNode, newNode) {
    if (!oldNode && newNode) {
      parent.appendChild(newNode.cloneNode(true));
      return;
    }
    if (oldNode && !newNode) {
      parent.removeChild(oldNode);
      return;
    }
    if (!this._sameType(oldNode, newNode)) {
      parent.replaceChild(newNode.cloneNode(true), oldNode);
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
      const oldMap = new Map();
      oldChildren.forEach((child, idx) => {
        const k = this._getKey(child);
        if (k != null) oldMap.set(String(k), { child, idx });
      });
      let lastPlacedIndex = 0;
      let i = 0;
      for (const newChild of newChildren) {
        const key = this._getKey(newChild);
        if (key == null) {
          // unkeyed new child, try to align by position relative to lastPlacedIndex
          const oldAtI = parentEl.childNodes[i];
          this._patch(parentEl, oldAtI || null, newChild);
          i++;
          continue;
        }
        const rec = oldMap.get(String(key));
        if (rec) {
          // Move existing node to correct position if needed and patch
          const currentNode = rec.child;
          // Find current index of currentNode
          const currentIndex = Array.prototype.indexOf.call(parentEl.childNodes, currentNode);
          const referenceNode = parentEl.childNodes[i] || null;
          if (currentIndex !== i) {
            parentEl.insertBefore(currentNode, referenceNode);
          }
          this._patch(parentEl, currentNode, newChild);
          oldMap.delete(String(key));
          i++;
        } else {
          // New node, insert at position i
          const ref = parentEl.childNodes[i] || null;
          parentEl.insertBefore(newChild.cloneNode(true), ref);
          i++;
        }
      }
      // Remove any remaining old keyed nodes not present in newChildren
      oldMap.forEach(({ child }) => {
        if (child.parentNode === parentEl) parentEl.removeChild(child);
      });
      // Remove extra trailing nodes if newChildren shorter
      while (parentEl.childNodes.length > newChildren.length) {
        parentEl.removeChild(parentEl.lastChild);
      }
      return;
    }
    // Non-keyed: patch by index
    const minLen = Math.min(oldChildren.length, newChildren.length);
    for (let i = 0; i < minLen; i++) this._patch(parentEl, oldChildren[i], newChildren[i]);
    // Append new
    for (let i = minLen; i < newChildren.length; i++) parentEl.appendChild(newChildren[i].cloneNode(true));
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
      // Build a temporary container for the new content
      const container = document.createElement('div');
      if (html == null) {
        container.innerHTML = '';
      } else if (typeof html === 'string') {
        container.innerHTML = html;
      } else if (html instanceof Node) {
        container.appendChild(html.cloneNode(true));
      } else {
        container.textContent = String(html);
      }
      // Patch children of root element to match the new content
      this._patchChildren(
        this.element,
        Array.from(this.element.childNodes),
        Array.from(container.childNodes)
      );
      this.bindEvents();
      // Process any pending portals after main patch
      try { this._processPortals && this._processPortals(); } catch (e) { console.error('portal processing error:', e); }
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
  
  bindEvents() {
    if (!this.element) return;
    this.events.forEach((handler, selector) => {
      const [event, sel] = selector.split(':');
      const elements = sel ? this.element.querySelectorAll(sel) : [this.element];
      
      elements.forEach(el => {
        el.removeEventListener(event, handler);
        el.addEventListener(event, handler);
      });
    });
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
      this.events.clear();
      this.element.innerHTML = '';
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
