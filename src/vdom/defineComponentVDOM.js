/**
 * Virtual DOM integration for functional components
 * Extends defineComponent with virtual DOM capabilities
 */

import { defineComponent } from '../functional/defineComponent.js';
import { 
  createElement, 
  createText, 
  createFragment,
  patchNode,
  patchChildren,
  htmlToVNodes
} from './index.js';

/**
 * Enhanced defineComponent with Virtual DOM support
 * @param {Function} setup - Setup function
 * @returns {Function} Component class
 */
export function defineComponentVDOM(setup) {
  if (typeof setup !== 'function') throw new Error('defineComponentVDOM expects a function');

  class FunctionalVDOMAdapter extends defineComponent(setup) {
    constructor(element = null, initialState = {}, props = {}) {
      super(element, initialState, props);
      this._vdom = null; // Current virtual DOM tree
      this._vdomEnabled = true; // Enable/disable virtual DOM
    }

    // Ensure immediate flush for VDOM hook state updates
    _useState(initial) {
      const [value, set] = super._useState(initial);
      const self = this;
      const wrappedSet = (next) => {
        set(next);
        if (self._vdomEnabled) {
          try { self.constructor._flush && self.constructor._flush(); } catch {}
        }
      };
      return [value, wrappedSet];
    }

    /**
     * Enable or disable virtual DOM
     * @param {boolean} enabled - Whether to enable virtual DOM
     */
    setVDOMEnabled(enabled) {
      this._vdomEnabled = !!enabled;
      // Trigger immediate re-render to reflect mode change
      try { if (this.element) this.render(); } catch {}
    }

    /**
     * Enhanced template method with virtual DOM support
     */
    template() {
      this._hookIndex = 0;
      const ctx = this._buildCtx();
      
      // Add virtual DOM helpers to context
      ctx.h = (tag, props = {}, ...children) => {
        const { key = null, ...rest } = props || {};
        const vChildren = this._flattenChildren(children);
        return createElement(tag, rest, vChildren, key);
      };
      
      ctx.t = (text) => createText(text);
      ctx.f = (...children) => createFragment(this._flattenChildren(children));
      
      // Invoke setup on every render
      const res = setup(ctx) || {};
      
      if (!this._setupRan) {
        this._setupRan = true;
        this._setupResult = {
          render: res.render,
          vrender: res.vrender, // Virtual DOM render function
          onMount: res.onMount,
          onUnmount: res.onUnmount,
          onPropsChange: res.onPropsChange,
          onError: res.onError,
          renderError: res.renderError
        };
      }
      if (typeof res.renderError === 'function') {
        this.renderError = function(err) { return res.renderError.call(this, err); };
      }
      
      // Try virtual DOM render first, then fall back to HTML render
      let output;
      if (this._vdomEnabled && typeof res.vrender === 'function') {
        output = res.vrender.call(this, ctx);
      } else if (typeof res.render === 'function') {
        output = res.render.call(this, ctx);
      } else {
        output = '';
      }
      
      // Schedule effect flush
      if (!this._effectsScheduled) {
        this._effectsScheduled = true;
        Promise.resolve().then(() => {
          this._effectsScheduled = false;
          if (this.element) this._flushEffects();
        });
      }
      
      return output;
    }

    /**
     * Enhanced render method with virtual DOM support
     */
    render() {
      if (typeof document === 'undefined') return;
      if (!this.element || this.isRendering) return;
      
      // Register element-instance mapping
      try { 
        if (this.element) this.constructor._byEl.set(this.element, this); 
      } catch {}

      // Apply any pending context entries
      if (this._pendingContext && this.element) {
        for (const entry of this._pendingContext) {
          let map = this.constructor._contextRegistry?.get(this.element);
          if (!map) { 
            map = new Map(); 
            this.constructor._contextRegistry?.set(this.element, map); 
          }
          map.set(entry.id, entry.value);
        }
        this._pendingContext = null;
      }
      
      // Capture focus before rendering
      let focusInfo = this._captureFocus();
      
      try {
        this.isRendering = true;
        
        if (this._vdomEnabled) {
          this._renderWithVDOM();
        } else {
          this._renderWithoutVDOM();
        }
        
        this.bindEvents();
        this._processPortals();
        
        const firstMount = !this._mounted;
        if (firstMount) {
          this._mounted = true;
          try { this.onMount(); } catch (e) { 
            if (this._shouldLogErrors()) console.error('onMount error:', e); 
          }
        }
        
        this._restoreFocus(focusInfo);
        
      } catch (error) {
        if (this._shouldLogErrors()) console.error('Render error:', error);
        this._handleRenderError(error);
      } finally {
        this.isRendering = false;
      }
    }

    /**
     * Renders using virtual DOM
     */
    _renderWithVDOM() {
      // Build virtual DOM from setup/template output
      let output = this.template();
      let newVDOM = output;

      // Normalize to VDOM
      if (newVDOM == null) {
        newVDOM = createFragment([]);
      } else if (typeof newVDOM === 'string') {
        const vnodes = htmlToVNodes(newVDOM);
        newVDOM = vnodes.length === 1 ? vnodes[0] : createFragment(vnodes);
      } else if (newVDOM && typeof newVDOM === 'object' && typeof newVDOM.nodeType === 'number') {
        newVDOM = this._domToVNode(newVDOM) || createText('');
      }

      // Validate vnode shape; coerce unknown to text
      if (!newVDOM || typeof newVDOM !== 'object' || !('type' in newVDOM) || !(['element','text','fragment'].includes(newVDOM.type))) {
        newVDOM = createText(String(newVDOM ?? ''));
      }
      
      // Diff and patch against previous VDOM
      const oldVDOM = this._vdom;
      this._patchVDOM(oldVDOM, newVDOM);
      this._vdom = newVDOM;
    }

    /**
     * Renders without virtual DOM (original behavior)
     */
    _renderWithoutVDOM() {
      const html = this.template();
      const container = document.createElement('div');
      
      if (html == null) {
        container.innerHTML = '';
      } else if (typeof html === 'string') {
        container.innerHTML = html;
      } else if (html && typeof html === 'object' && typeof html.nodeType === 'number') {
        container.appendChild(html.cloneNode(true));
      } else {
        container.textContent = String(html);
      }
      
      // Use original patching
      this._patchChildren(
        this.element,
        Array.from(this.element.childNodes),
        Array.from(container.childNodes)
      );
    }

    /**
     * Patches virtual DOM
     * @param {Object} oldVDOM - Old virtual DOM
     * @param {Object} newVDOM - New virtual DOM
     */
    _patchVDOM(oldVDOM, newVDOM) {
      if (!oldVDOM) {
        // Mount new content
        this._mountVDOM(newVDOM);
        return;
      }
      
      if (oldVDOM.type === 'fragment' && newVDOM.type === 'fragment') {
        patchChildren(this.element, oldVDOM.children, newVDOM.children);
      } else if (oldVDOM.type === 'fragment') {
        // Replace fragment with single node
        while (this.element.firstChild) {
          this.element.removeChild(this.element.firstChild);
        }
        const domNode = this._createDOMNode(newVDOM);
        if (domNode) this.element.appendChild(domNode);
      } else if (newVDOM.type === 'fragment') {
        // Replace single node with fragment
        if (oldVDOM.el && oldVDOM.el.parentNode) {
          oldVDOM.el.parentNode.removeChild(oldVDOM.el);
        }
        newVDOM.children.forEach(child => {
          const domNode = this._createDOMNode(child);
          if (domNode) this.element.appendChild(domNode);
        });
      } else {
        patchNode(this.element, oldVDOM, newVDOM);
      }
    }

    /**
     * Mounts initial virtual DOM
     * @param {Object} vdom - Virtual DOM node
     */
    _mountVDOM(vdom) {
      // Clear existing content
      if (this.element) {
        this.element.textContent = '';
      }
      
      // Mount new content
      if (vdom.type === 'fragment') {
        vdom.children.forEach(child => {
          const domNode = this._createDOMNode(child);
          if (domNode) this.element.appendChild(domNode);
        });
      } else {
        const domNode = this._createDOMNode(vdom);
        if (domNode) this.element.appendChild(domNode);
      }
    }

    /**
     * Creates a DOM node from a virtual node
     * @param {Object} vnode - Virtual node
     * @returns {Node} DOM node
     */
    _createDOMNode(vnode) {
      if (!vnode) return null;
      
      switch (vnode.type) {
        case 'text':
          const tn = document.createTextNode(vnode.text);
          vnode.el = tn;
          return tn;
          
        case 'element':
          const el = document.createElement(vnode.tag);
          this._setElementProps(el, vnode.props);
          vnode.children.forEach(child => {
            const childNode = this._createDOMNode(child);
            if (childNode) el.appendChild(childNode);
          });
          vnode.el = el;
          return el;
          
        case 'fragment':
          const fragment = document.createDocumentFragment();
          vnode.children.forEach(child => {
            const childNode = this._createDOMNode(child);
            if (childNode) fragment.appendChild(childNode);
          });
          return fragment;
          
        default:
          return null;
      }
    }

    /**
     * Sets element properties
     * @param {Element} el - DOM element
     * @param {Object} props - Properties object
     */
    _setElementProps(el, props) {
      if (!props || typeof props !== 'object') return;
      
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && value && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key === 'dataset' && value && typeof value === 'object') {
          Object.assign(el.dataset, value);
        } else if (key === 'className' || key === 'class') {
          el.className = value || '';
        } else if (key.startsWith('on') && typeof value === 'function') {
          const event = key.slice(2).toLowerCase();
          el.addEventListener(event, value);
        } else if (key in el) {
          try {
            el[key] = value;
          } catch {
            if (value === true) {
              el.setAttribute(key, '');
            } else if (value !== false && value != null) {
              el.setAttribute(key, String(value));
            }
          }
        } else {
          if (value === true) {
            el.setAttribute(key, '');
          } else if (value !== false && value != null) {
            el.setAttribute(key, String(value));
          }
        }
      });
    }

    /**
     * Flattens and converts children to virtual nodes
     * @param {Array} children - Children array
     * @returns {Array} Array of virtual nodes
     */
    _flattenChildren(children) {
      const result = [];
      
      for (const child of children) {
        if (child == null || child === false) {
          // Skip null, undefined, false
          continue;
        } else if (Array.isArray(child)) {
          // Flatten arrays
          result.push(...this._flattenChildren(child));
        } else if (typeof child === 'string' || typeof child === 'number') {
          // Convert primitives to text nodes
          result.push(createText(child));
        } else if (
          child && typeof child === 'object' &&
          (child.type === 'element' || child.type === 'text' || child.type === 'fragment')
        ) {
          // Already a virtual node (recognized shape)
          result.push(child);
        } else if (child && typeof child === 'object' && typeof child.nodeType === 'number') {
          // Convert DOM node to virtual node (duck-typed to avoid Node global)
          const vn = this._domToVNode(child);
          if (vn) result.push(vn);
        } else {
          // Convert other values to text
          result.push(createText(String(child)));
        }
      }
      
      return result;
    }

    /**
     * Converts a DOM node to a virtual node
     * @param {Node} node - DOM node
     * @returns {Object} Virtual node
     */
    _domToVNode(node) {
      // Use numeric nodeType codes to avoid referencing global Node in non-browser envs
      if (!node || typeof node.nodeType !== 'number') return null;

      if (node.nodeType === 3) { // TEXT_NODE
        return createText(node.textContent);
      } else if (node.nodeType === 1) { // ELEMENT_NODE
        const props = {};
        const children = [];
        
        // Extract attributes
        Array.from(node.attributes || []).forEach(attr => {
          if (attr.name === 'class') {
            props.className = attr.value;
          } else if (attr.name.startsWith('data-')) {
            if (!props.dataset) props.dataset = {};
            props.dataset[attr.name.slice(5)] = attr.value;
          } else {
            props[attr.name] = attr.value;
          }
        });
        
        // Extract key (do not duplicate in props to avoid conflicts)
        const key = node.getAttribute && node.getAttribute('data-key');
        
        // Process children
        Array.from(node.childNodes || []).forEach(child => {
          const vn = this._domToVNode(child);
          if (vn) children.push(vn);
        });
        
        return createElement(node.tagName.toLowerCase(), props, children, key || null);
      } else if (node.nodeType === 8) { // COMMENT_NODE
        // Ignore comments to avoid spurious empty text nodes
        return null;
      }
      
      return null;
    }

    /**
     * Captures focus information before rendering
     * @returns {Object|null} Focus information
     */
    _captureFocus() {
      try {
        const active = document.activeElement;
        if (active && this.element.contains(active)) {
          const tag = (active.tagName || '').toUpperCase();
          const isInputLike = tag === 'INPUT' || tag === 'TEXTAREA';
          return {
            id: active.id || null,
            name: active.getAttribute ? active.getAttribute('name') : null,
            isContentEditable: !!active.isContentEditable,
            isInputLike,
            selectionStart: isInputLike && (typeof active.selectionStart === 'number') ? active.selectionStart : null,
            selectionEnd: isInputLike && (typeof active.selectionEnd === 'number') ? active.selectionEnd : null,
            selectionDirection: isInputLike && typeof active.selectionDirection === 'string' ? active.selectionDirection : null,
            scrollLeft: typeof active.scrollLeft === 'number' ? active.scrollLeft : null,
            scrollTop: typeof active.scrollTop === 'number' ? active.scrollTop : null
          };
        }
      } catch {}
      return null;
    }

    /**
     * Restores focus after rendering
     * @param {Object|null} focusInfo - Focus information
     */
    _restoreFocus(focusInfo) {
      if (!focusInfo) return;
      
      let target = null;
      if (focusInfo.id) {
        try { target = document.getElementById(focusInfo.id); } catch {}
      }
      if (!target && focusInfo.name) {
        try { target = this.element.querySelector(`[name="${focusInfo.name}"]`); } catch {}
      }
      
      if (target) {
        try {
          target.focus();
          const tag = (target.tagName || '').toUpperCase();
          const isInputLike = tag === 'INPUT' || tag === 'TEXTAREA';
          // Restore selection for input/textarea
          if (isInputLike && typeof target.setSelectionRange === 'function') {
            if (focusInfo.selectionStart != null && focusInfo.selectionEnd != null) {
              try {
                target.setSelectionRange(
                  focusInfo.selectionStart,
                  focusInfo.selectionEnd,
                  focusInfo.selectionDirection || undefined
                );
              } catch {}
            }
            if (typeof focusInfo.scrollLeft === 'number') target.scrollLeft = focusInfo.scrollLeft;
            if (typeof focusInfo.scrollTop === 'number') target.scrollTop = focusInfo.scrollTop;
          } else if (focusInfo.isContentEditable) {
            // Basic caret restore for contentEditable using Selection/Range APIs
            const sel = (typeof window !== 'undefined' && window.getSelection) ? window.getSelection() : null;
            if (sel && typeof document.createRange === 'function') {
              const range = document.createRange();
              try {
                range.selectNodeContents(target);
                range.collapse(false); // place caret at end
                sel.removeAllRanges();
                sel.addRange(range);
              } catch {}
            }
            if (typeof focusInfo.scrollLeft === 'number') target.scrollLeft = focusInfo.scrollLeft;
            if (typeof focusInfo.scrollTop === 'number') target.scrollTop = focusInfo.scrollTop;
          }
        } catch {}
      }
    }

    /**
     * Handles render errors
     * @param {Error} error - Render error
     */
    _handleRenderError(error) {
      if (typeof this.renderError === 'function') {
        try {
          const errorHtml = this.renderError(error);
          if (errorHtml) {
            this.element.innerHTML = errorHtml;
          }
        } catch {}
      }
    }

    /**
     * Determines if errors should be logged
     * @returns {boolean} True if errors should be logged
     */
    _shouldLogErrors() {
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
  }

  return FunctionalVDOMAdapter;
}

export default { defineComponentVDOM };
