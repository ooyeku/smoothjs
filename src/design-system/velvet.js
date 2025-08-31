import { hash } from '../utils/hash.js';
import { VelvetUtilities } from './utilities.js';
import { defaultTheme } from './theme.js';

export class Velvet {
  constructor(component) {
    this.component = component;
    this.styles = new Map();
    this.styleSheet = null;
    this.uniqueId = 0;
    this.utilities = new VelvetUtilities(defaultTheme).utilities;
    
    if (!document.getElementById('velvet-styles')) {
      this.initStyleSheet();
    }
  }
  
  initStyleSheet() {
    const style = document.createElement('style');
    style.id = 'velvet-styles';
    style.textContent = this.getBaseStyles();
    document.head.appendChild(style);
    this.styleSheet = style.sheet;
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
  
  generateClassName(styleObj) {
    const styleHash = hash(JSON.stringify(styleObj));
    return `velvet-${styleHash}`;
  }
  
  style(styleDefinition) {
    if (typeof styleDefinition === 'string') {
      return styleDefinition;
    }
    
    const className = this.generateClassName(styleDefinition);
    
    if (!this.styles.has(className)) {
      const css = this.processStyles(className, styleDefinition);
      this.injectStyles(css);
      this.styles.set(className, css);
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
    if (this.styleSheet) {
      try {
        const index = this.styleSheet.cssRules.length;
        this.styleSheet.insertRule(css, index);
      } catch (e) {
        // Fallback for complex rules
        const styleEl = document.getElementById('velvet-styles');
        if (styleEl) {
          styleEl.textContent += css;
        }
      }
    }
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
let globalVelvet = null;

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

export function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}