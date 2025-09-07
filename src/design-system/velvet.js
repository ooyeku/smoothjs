import { hash } from '../utils/hash.js';
import { VelvetUtilities } from './utilities.js';
import { defaultTheme } from './theme.js';

// Global cache and buffer for Velvet across all instances
/**
 * A globally shared object used for storing and managing application-wide CSS-related state.
 *
 * This object is designed to ensure that the same instance is used across the application,
 * leveraging the global scope (either `window` or `globalThis`). It provides mechanisms
 * for caching CSS classes, buffering changes, scheduling updates, and manipulating the
 * associated style sheet.
 *
 * Properties:
 * - `cache` (Map): A map to store CSS class names and their associated styles.
 * - `buf` (Array): An array used to buffer pending changes or operations.
 * - `scheduled` (boolean): A flag indicating whether updates have been scheduled.
 * - `styleEl` (HTMLElement|null): A reference to the `<style>` element used for injecting CSS.
 * - `sheet` (CSSStyleSheet|null): A reference to the CSS style sheet object.
 */
const V_GLOBAL = (() => {
  const g = (typeof window !== 'undefined' ? window : globalThis);
  g.__SMOOTH_VELVET__ = g.__SMOOTH_VELVET__ || {
    cache: new Map(), // className -> css
    buf: [],
    scheduled: false,
    styleEl: null,
    sheet: null,
  };
  return g.__SMOOTH_VELVET__;
})();

/**
 * Flushes the CSS buffer (`V_GLOBAL.buf`) into the associated style element,
 * minimizing DOM operations by appending the buffer content as a single chunk.
 * If the style element does not exist, the function will attempt to retrieve it from the DOM.
 * Clears the CSS buffer and resets the scheduled flag after flushing.
 *
 * @return {void} No return value.
 */
function _flushCSS() {
  if (!V_GLOBAL.buf.length) return;
  try {
    const style = V_GLOBAL.styleEl || document.getElementById('velvet-styles');
    if (style) {
      // Append as one chunk to minimize operations
      style.textContent += V_GLOBAL.buf.join('');
    }
  } catch {}
  V_GLOBAL.buf.length = 0;
  V_GLOBAL.scheduled = false;
}

/**
 * Enqueues a CSS string to a buffer and schedules a flush operation if not already scheduled.
 *
 * @param {string} css - The CSS string to enqueue. If null or undefined, no action is taken.
 * @return {void} This method does not return a value.
 */
function _enqueueCSS(css) {
  if (!css) return;
  V_GLOBAL.buf.push(css);
  if (!V_GLOBAL.scheduled) {
    V_GLOBAL.scheduled = true;
    Promise.resolve().then(_flushCSS);
  }
}

/**
 * The Velvet class provides a utility for dynamically generating CSS class names with styles,
 * as well as a set of helper methods for creating UI design patterns such as flex, grid, and buttons.
 * It manages a global stylesheet and caches styles to optimize performance.
 */
export class Velvet {
  constructor(component) {
    this.component = component;
    this.styles = new Map();
    this.utilities = new VelvetUtilities(defaultTheme).utilities;
    // Ensure a single global style element exists and is cached
    if (typeof document !== 'undefined') {
      if (!V_GLOBAL.styleEl) {
        const existing = document.getElementById('velvet-styles');
        if (existing) {
          V_GLOBAL.styleEl = existing;
          V_GLOBAL.sheet = existing.sheet || null;
        } else {
          this.initStyleSheet();
        }
      }
    }
  }
  
  initStyleSheet() {
    if (typeof document === 'undefined') return;
    if (V_GLOBAL.styleEl) return;
    const style = document.createElement('style');
    style.id = 'velvet-styles';
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
    const className = this.generateClassName(styleDefinition);
    if (!V_GLOBAL.cache.has(className)) {
      const css = this.processStyles(className, styleDefinition);
      V_GLOBAL.cache.set(className, css);
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
    
    // Dark mode styles
    if (Object.keys(dark).length > 0) {
      css += `[data-theme="dark"] .${className} { ${this.objectToCSS(dark)} }\n`;
      css += `@media (prefers-color-scheme: dark) { 
        :root:not([data-theme="light"]) .${className} { ${this.objectToCSS(dark)} }
      }\n`;
    }
    
    // Responsive styles
    const breakpoints = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
    
    Object.entries(responsive).forEach(([breakpoint, styles]) => {
      if (breakpoints[breakpoint] && Object.keys(styles).length > 0) {
        css += `@media (min-width: ${breakpoints[breakpoint]}) {
          .${className} { ${this.objectToCSS(styles)} }
        }\n`;
      }
    });
    
    return css;
  }
  
  objectToCSS(obj) {
    return Object.entries(obj)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
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
}

// Singleton for global theme management
/**
 * A global variable intended to store the reference to the main velvet object or instance.
 * This variable can be used across different modules or components to access or manipulate
 * the shared velvet object. It is initialized to `null` by default.
 *
 * Note: Ensure that this variable is assigned properly before use to avoid
 * potential runtime issues.
 *
 * @type {Object|null}
 */
let globalVelvet = null;

/**
 * Initializes the Velvet instance with optional configuration settings.
 *
 * @param {Object} config - Configuration object for initializing Velvet.
 * @param {string} [config.darkMode='auto'] - Determines theme mode. 'auto' enables detection based on user system preferences.
 * @return {Velvet} The initialized Velvet instance.
 */
export function initVelvet(config = {}) {
  if (!globalVelvet) {
    globalVelvet = new Velvet(null);
    
    // Apply global configuration
    if (config.darkMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      });
    }
  }
  return globalVelvet;
}

/**
 * Toggles the application's theme between dark mode and light mode by
 * switching the value of the `data-theme` attribute on the root `<html>` element.
 * If the current theme is `dark`, it sets the theme to `light`, and vice versa.
 *
 * @return {void} This function does not return a value.
 */
export function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}