import { hash } from '../utils/hash.js';
import { VelvetUtilities } from './utilities.js';
import { defaultTheme } from './theme.js';
import { injectThemeVariables } from './tokens.js';

// Global cache and buffer for Velvet across all instances
const V_GLOBAL = (() => {
  const g = (typeof window !== 'undefined' ? window : globalThis);
  g.__SMOOTH_VELVET__ = g.__SMOOTH_VELVET__ || {
    cache: new Map(), // className -> css
    lruKeys: [], // insertion order of classNames for simple LRU
    MAX_CACHE: 10000,
    buf: [], // raw css chunks (fallback)
    rules: [], // individual minified rules for CSSOM insert
    ruleSet: new Set(), // dedupe of rule strings
    scheduled: false,
    styleEl: null,
    sheet: null,
    objToClass: new WeakMap(), // styleObj -> className
    normalizedCache: new Map(), // JSON.stringify(normalized) -> className
    propMemo: new Map(), // camelCase -> kebab-case memo
    keyframes: new Set(), // registered @keyframes names
    varsApplied: false,
    nonce: null,
  };
  return g.__SMOOTH_VELVET__;
})();

function _minify(css) {
  if (!css) return '';
  // remove comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // collapse whitespace
  css = css.replace(/\s+/g, ' ');
  // remove spaces around symbols
  css = css.replace(/\s*([{}:;,>])\s*/g, '$1');
  // trailing semicolons
  css = css.replace(/;}/g, '}');
  // zero units
  css = css.replace(/(:|\s)0(px|rem|em|vh|vw|%)\b/g, '$10');
  // shorten hex colors #aabbcc -> #abc
  css = css.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3');
  return css.trim();
}

function _flushCSS() {
  try {
    const style = V_GLOBAL.styleEl || (typeof document !== 'undefined' ? document.getElementById('velvet-styles') : null);
    const sheet = V_GLOBAL.sheet || (style ? style.sheet : null);
    if (sheet && V_GLOBAL.rules.length) {
      for (const rule of V_GLOBAL.rules) {
        if (!V_GLOBAL.ruleSet.has(rule)) {
          try { sheet.insertRule(rule, sheet.cssRules.length); V_GLOBAL.ruleSet.add(rule); }
          catch { V_GLOBAL.buf.push(rule); }
        }
      }
      V_GLOBAL.rules.length = 0;
    } else if (!sheet && style && V_GLOBAL.rules.length) {
      // Fallback: append rules as text and mark as seen
      style.textContent += V_GLOBAL.rules.join('');
      for (const rule of V_GLOBAL.rules) { V_GLOBAL.ruleSet.add(rule); }
      V_GLOBAL.rules.length = 0;
    }
    if (style && V_GLOBAL.buf.length) {
      style.textContent += V_GLOBAL.buf.join('');
      V_GLOBAL.buf.length = 0;
    }
  } catch {
    // best-effort fallback: ignore
  }
  V_GLOBAL.scheduled = false;
}

function _enqueueCSS(css) {
  if (!css) return;
  const min = _minify(css);
  // Split into individual rules to dedupe/insert via CSSOM
  const parts = min.split('}');
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    const rule = p.endsWith('}') ? p : p + '}';
    if (!V_GLOBAL.ruleSet.has(rule)) {
      V_GLOBAL.rules.push(rule);
    }
  }
  if (!V_GLOBAL.scheduled) {
    V_GLOBAL.scheduled = true;
    Promise.resolve().then(_flushCSS);
  }
}

export class Velvet {
  constructor(component) {
    this.component = component;
    this.styles = new Map();
    this.utilities = new VelvetUtilities(defaultTheme).utilities;
    // Ensure a single global style element exists and is cached
    if (typeof document !== 'undefined') {
      const existing = V_GLOBAL.styleEl || document.getElementById('velvet-styles');
      if (existing) {
        V_GLOBAL.styleEl = existing;
        V_GLOBAL.sheet = existing.sheet || null;
        try { Velvet.hydrate(existing); } catch {}
      } else {
        this.initStyleSheet();
      }
    }
  }
  
  initStyleSheet() {
    if (typeof document === 'undefined') return;
    if (V_GLOBAL.styleEl) return;
    const style = document.createElement('style');
    style.id = 'velvet-styles';
    try { style.setAttribute('data-velvet', '1'); } catch {}
    const nonce = V_GLOBAL.nonce || (typeof window !== 'undefined' ? (window.__VELVET_NONCE__ || null) : null);
    if (nonce) { try { style.setAttribute('nonce', String(nonce)); } catch {} }
    style.textContent = this.getBaseStyles();
    document.head.appendChild(style);
    V_GLOBAL.styleEl = style;
    V_GLOBAL.sheet = style.sheet || null;
  }
  
  getBaseStyles() {
    return `
      *, *::before, *::after { box-sizing: border-box; }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
        50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes shimmer {
        from { background-position: -200% 0; }
        to { background-position: 200% 0; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.5); }
        50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.8); }
      }
      
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      [data-theme="dark"] {
        color-scheme: dark;
      }
      
      .velvet-transition {
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 250ms;
      }
    `;
  }
  
  // Normalize style object to stable shape for deterministic hashing
  _normalize(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const keys = Object.keys(obj).sort();
    const out = {};
    for (const k of keys) {
      const v = obj[k];
      out[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? this._normalize(v) : v;
    }
    return out;
  }

  generateClassName(styleObj) {
    const normalized = this._normalize(styleObj || {});
    const styleHash = hash(JSON.stringify(normalized));
    return `velvet-${styleHash}`;
  }
  
  style(styleDefinition) {
    if (typeof styleDefinition === 'string') {
      return styleDefinition;
    }
    // Deterministic by-value caching + referential caching
    const normalized = this._normalize(styleDefinition || {});
    let normStr = '';
    try { normStr = JSON.stringify(normalized); } catch { normStr = ''; }
    let className = V_GLOBAL.objToClass.get(styleDefinition);
    if (!className) {
      if (normStr && V_GLOBAL.normalizedCache.has(normStr)) {
        className = V_GLOBAL.normalizedCache.get(normStr);
      } else {
        className = this.generateClassName(styleDefinition);
        if (normStr) {
          try { V_GLOBAL.normalizedCache.set(normStr, className); } catch {}
        }
      }
      try { V_GLOBAL.objToClass.set(styleDefinition, className); } catch {}
    }
    if (!V_GLOBAL.cache.has(className)) {
      const css = this.processStyles(className, styleDefinition);
      this._cachePut(className, css);
      this.injectStyles(css);
    }
    return className;
  }
  
  processStyles(className, styleObj) {
    const { base = {}, hover = {}, focus = {}, active = {}, dark = {}, responsive = {} } = styleObj;
    let css = '';
    
    // Base styles
    if (Object.keys(base).length > 0) {
      css += `.${className} { ${this.objectToCSS(base)} }\n`;
    }
    
    // Hover styles
    if (Object.keys(hover).length > 0) {
      css += `.${className}:hover { ${this.objectToCSS(hover)} }\n`;
    }
    
    // Focus styles
    if (Object.keys(focus).length > 0) {
      css += `.${className}:focus { ${this.objectToCSS(focus)} }\n`;
      css += `.${className}:focus-visible { ${this.objectToCSS(focus)} }\n`;
    }
    
    // Active styles
    if (Object.keys(active).length > 0) {
      css += `.${className}:active { ${this.objectToCSS(active)} }\n`;
    }
    
    // Dark mode styles (keep specificity low via :where)
    if (Object.keys(dark).length > 0) {
      css += `[data-theme="dark"] :where(.${className}) { ${this.objectToCSS(dark)} }\n`;
      css += `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) :where(.${className}) { ${this.objectToCSS(dark)} } }\n`;
    }
    
    // Responsive styles in deterministic order
    const breakpoints = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
    const order = ['sm','md','lg','xl','2xl'];
    for (const bp of order) {
      const styles = responsive[bp];
      if (styles && Object.keys(styles).length > 0 && breakpoints[bp]) {
        css += `@media (min-width: ${breakpoints[bp]}) { .${className} { ${this.objectToCSS(styles)} } }\n`;
      }
    }
    
    return css;
  }
  
  objectToCSS(obj) {
    if (!obj || typeof obj !== 'object') return '';
    const keys = Object.keys(obj).sort();
    const toKebab = (key) => {
      const m = V_GLOBAL.propMemo;
      if (m.has(key)) return m.get(key);
      const v = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      m.set(key, v);
      return v;
    };
    const UNITLESS = new Set([
      'opacity','zIndex','lineHeight','fontWeight','flex','flexGrow','flexShrink','order','zoom','scale','scaleX','scaleY','scaleZ','tabSize'
    ]);
    const isDev = (() => {
      try { return !(typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production'); } catch { return true; }
    })();
    const parts = [];
    for (const key of keys) {
      let value = obj[key];
      if (value === undefined || value === null) continue;
      const cssKey = toKebab(key);
      // Drop obviously invalid values in dev
      const t = typeof value;
      if (t === 'object' || t === 'function') {
        if (isDev) { try { console.warn('[velvet] Dropping invalid CSS value for', cssKey, value); } catch {} }
        continue;
      }
      // Normalize numeric values
      if (t === 'number') {
        if (value === 0) {
          value = 0; // strip units for zero
        } else if (!UNITLESS.has(key)) {
          value = `${value}px`;
        }
      }
      parts.push(`${cssKey}: ${String(value)}`);
    }
    return parts.join('; ');
  }
  
  _cachePut(className, css) {
    V_GLOBAL.cache.set(className, css);
    V_GLOBAL.lruKeys.push(className);
    const max = V_GLOBAL.MAX_CACHE || 10000;
    if (V_GLOBAL.lruKeys.length > max) {
      const evict = V_GLOBAL.lruKeys.shift();
      if (evict && evict !== className) {
        try { V_GLOBAL.cache.delete(evict); } catch {}
      }
    }
  }
  
  injectStyles(css) {
    if (typeof document === 'undefined') return;
    if (!css) return;
    // Batch CSS appends to a single style tag to minimize DOM churn
    _enqueueCSS(css);
  }
  
  // Utility methods for common patterns
  box(styles = {}) {
    return this.style({
      base: {
        display: 'flex',
        flexDirection: 'column',
        ...styles
      }
    });
  }
  
  flex(styles = {}) {
    return this.style({
      base: {
        display: 'flex',
        ...styles
      }
    });
  }
  
  grid(styles = {}) {
    return this.style({
      base: {
        display: 'grid',
        ...styles
      }
    });
  }
  
  text(styles = {}) {
    return this.style({
      base: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.5',
        ...styles
      }
    });
  }
  
  button(variant = 'primary', size = 'md') {
    const variants = {
      primary: {
        backgroundColor: '#0ea5e9',
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 250ms ease'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '#0ea5e9',
        borderRadius: '8px',
        border: '2px solid #0ea5e9',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 250ms ease'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#71717a',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 250ms ease'
      }
    };
    
    const sizes = {
      sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
    };
    
    const hoverStyles = {
      primary: { backgroundColor: '#0284c7', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
      secondary: { backgroundColor: '#0ea5e9', color: 'white' },
      ghost: { backgroundColor: '#f4f4f5' }
    };
    
    return this.style({
      base: {
        ...variants[variant],
        ...sizes[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      },
      hover: hoverStyles[variant],
      active: {
        transform: 'scale(0.98)'
      }
    });
  }
  
  card(elevated = false) {
    return this.style({
      base: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        transition: 'all 250ms ease',
        border: '1px solid #e5e7eb',
        ...(elevated ? {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        } : {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
        })
      },
      dark: {
        backgroundColor: '#0f1a2b',
        color: '#f0f3f8',
        border: '1px solid #3b4b63'
      }
    });
  }
  
  input() {
    return this.style({
      base: {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        lineHeight: '1.5',
        color: '#18181b',
        backgroundColor: 'white',
        border: '1px solid #d4d4d8',
        borderRadius: '8px',
        transition: 'all 250ms ease',
        outline: 'none'
      },
      focus: {
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)'
      },
      dark: {
        backgroundColor: '#0f1a2b',
        color: '#f0f3f8',
        borderColor: '#3b4b63'
      }
    });
  }
  
  // Container with max-width
  container(maxWidth = 'lg') {
    const widths = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%'
    };
    
    return this.style({
      base: {
        width: '100%',
        maxWidth: widths[maxWidth] || widths.lg,
        margin: '0 auto',
        padding: '0 1rem'
      },
      responsive: {
        md: { padding: '0 1.5rem' },
        lg: { padding: '0 2rem' }
      }
    });
  }
  
  // Keyframes registry and dedupe
  static registerKeyframes(name, frames) {
    const n = String(name);
    if (V_GLOBAL.keyframes.has(n)) return n;
    let body = '';
    if (typeof frames === 'string') {
      body = frames.trim();
    } else if (frames && typeof frames === 'object') {
      try {
        const steps = Object.keys(frames).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        const v = new Velvet(null);
        const parts = [];
        for (const k of steps) {
          const css = v.objectToCSS(frames[k]);
          parts.push(`${k} { ${css} }`);
        }
        body = parts.join(' ');
      } catch {}
    }
    const rule = `@keyframes ${n}{${body}}`;
    _enqueueCSS(rule);
    V_GLOBAL.keyframes.add(n);
    return n;
  }
  
  // SSR/CSP helpers
  static setNonce(nonce) {
    V_GLOBAL.nonce = nonce != null ? String(nonce) : null;
    try { if (V_GLOBAL.styleEl && V_GLOBAL.nonce) V_GLOBAL.styleEl.setAttribute('nonce', V_GLOBAL.nonce); } catch {}
  }

  static extractCSS() {
    if (typeof document === 'undefined') return '';
    const style = V_GLOBAL.styleEl || document.getElementById('velvet-styles') || document.querySelector('style[data-velvet]');
    if (!style) return '';
    try {
      const sheet = style.sheet;
      if (sheet && sheet.cssRules) {
        let out = '';
        for (let i = 0; i < sheet.cssRules.length; i++) {
          const r = sheet.cssRules[i];
          if (r && r.cssText) out += r.cssText;
        }
        return out;
      }
    } catch {}
    return style.textContent || '';
  }

  static hydrate(styleEl = null) {
    if (typeof document === 'undefined') return;
    const style = styleEl || document.getElementById('velvet-styles') || document.querySelector('style[data-velvet]');
    if (!style) return;
    V_GLOBAL.styleEl = style;
    V_GLOBAL.sheet = style.sheet || null;
    // Seed ruleSet from existing CSS so we don't re-insert duplicates
    try {
      const sheet = V_GLOBAL.sheet;
      if (sheet && sheet.cssRules) {
        for (let i = 0; i < sheet.cssRules.length; i++) {
          const css = sheet.cssRules[i].cssText;
          if (css) V_GLOBAL.ruleSet.add(_minify(css));
        }
      } else {
        const txt = style.textContent || '';
        const parts = _minify(txt).split('}');
        for (let p of parts) {
          p = p.trim();
          if (!p) continue;
          const rule = p.endsWith('}') ? p : p + '}';
          V_GLOBAL.ruleSet.add(rule);
        }
      }
    } catch {}
  }
}

// Singleton for global theme management
let globalVelvet = null;

export function initVelvet(config = {}) {
  if (!globalVelvet) {
    globalVelvet = new Velvet(null);
    // Apply CSS variables from theme once (no-op on server)
    try {
      if (!V_GLOBAL.varsApplied) {
        injectThemeVariables();
        V_GLOBAL.varsApplied = true;
      }
    } catch {}
    // Apply global configuration
    if (typeof window !== 'undefined' && config.darkMode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      try { document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light'); } catch {}
      try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          try { document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light'); } catch {}
        });
      } catch {}
    }
  }
  return globalVelvet;
}

export function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}