/**
 * A utility object providing various commonly-used functions for browser and server environments.
 */
export const utils = {
  isBrowser: (typeof window !== 'undefined') && (typeof document !== 'undefined'),

  ready(callback) {
    if (typeof callback !== 'function') return;
    if (!this.isBrowser) {
      // In non-browser environments, schedule on next microtask
      Promise.resolve().then(() => callback());
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  },
  
  batch(fn) {
    try {
      const compBatch = (typeof window !== 'undefined' && window.SmoothJS && window.SmoothJS.Component && typeof window.SmoothJS.Component.batch === 'function') ? window.SmoothJS.Component.batch : null;
      if (compBatch) return compBatch(fn);
      return fn && fn();
    } catch (e) {
      return fn && fn();
    }
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  escapeHtml(text) {
    if (!this.isBrowser) {
      // Fallback simple escape for SSR
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    // Use DOM to escape core HTML entities, then ensure quotes are encoded too
    const div = document.createElement('div');
    div.textContent = text;
    let out = div.innerHTML;
    // JSDOM/browser innerHTML does not encode quotes; normalize here
    out = out.replace(/\"/g, '&quot;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return out;
  },
  
  formatters: {
    currency(amount, currency = 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },
    
    date(date, options = {}) {
      return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    },
    
    number(num) {
      return new Intl.NumberFormat('en-US').format(num);
    }
  }
};
