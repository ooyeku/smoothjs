import { SmoothComponent } from '../component/SmoothComponent.js';
import { Velvet } from './velvet.js';
import { defaultTheme } from './theme.js';

/**
 * Represents a component with advanced styling, theming, and animation capabilities.
 * Extends the `SmoothComponent` class to provide a streamlined interface for creating
 * styled components, managing themes, and applying animations.
 */
export class VelvetComponent extends SmoothComponent {
  constructor(element, initialState, props) {
    super(element, initialState, props);
    this.v = new Velvet(this);
    this.theme = defaultTheme;
    // Per-instance caches to avoid repeated work across renders
    this._vsCacheStr = new Map();   // utility tokens -> className
    this._vsCacheObj = new WeakMap(); // style object identity -> className
    this._themeCache = new Map();   // "tokens.colors.primary.500" -> resolved value
  }

  // Compose classes efficiently; accepts strings/arrays/falsy
  cx(...parts) {
    let out = '';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p) continue;
      if (typeof p === 'string') {
        if (out) out += ' ';
        out += p;
      } else if (Array.isArray(p)) {
        for (let j = 0; j < p.length; j++) {
          const s = p[j];
          if (!s) continue;
          if (out) out += ' ';
          out += s;
        }
      }
    }
    return out;
  }
  
  vs(styles) {
    // Fast path: string utilities/presets (cache per token)
    if (typeof styles === 'string') {
      // Tokenize once; map through utilities; cache each token
      const classes = styles.split(' ').filter(Boolean).map(cls => {
        // Cached token resolution
        const cached = this._vsCacheStr.get(cls);
        if (cached) return cached;
        // Check if it's a utility class backed by Velvet utilities
        if (this.v.utilities && this.v.utilities[cls]) {
          const resolved = this.v.style({ base: this.v.utilities[cls] });
          this._vsCacheStr.set(cls, resolved);
          return resolved;
        }
        // Pass-through raw class token; cache to avoid future checks
        this._vsCacheStr.set(cls, cls);
        return cls;
      });
      return classes.join(' ');
    }
    // Object/array styles: cache by object identity (works best with stable objects)
    if (styles && (typeof styles === 'object' || Array.isArray(styles))) {
      const cached = this._vsCacheObj.get(styles);
      if (cached) return cached;
      const className = this.v.style(styles);
      this._vsCacheObj.set(styles, className);
      return className;
    }
    // Fallback
    return this.v.style(styles);
  }
  
  styled(tag, styles, props = {}) {
    const className = this.vs(styles);
    const propsStr = Object.entries(props)
      .map(([key, value]) => {
        // Skip event handlers; they should be bound via .on()
        if (key === 'onclick' || key.startsWith('on')) return '';
        if (value === false || value == null) return ''; // omit falsy boolean/null/undefined
        if (value === true) return `${key}`; // boolean attribute shorthand
        return `${key}="${String(value)}"`;
      })
      .filter(Boolean)
      .join(' ');
    
    // Avoid trailing space if no props
    return propsStr
      ? `<${tag} class="${className}" ${propsStr}>`
      : `<${tag} class="${className}">`;
  }
  
  styledClose(tag) {
    return `</${tag}>`;
  }
  
  // Allow swapping theme at runtime and reset caches that depend on theme
  setTheme(nextTheme) {
    if (nextTheme && nextTheme !== this.theme) {
      this.theme = nextTheme;
      // Theme-based caches are now stale
      this._themeCache.clear();
      // style caches might also depend on theme tokens; conservatively clear string cache
      this._vsCacheStr.clear();
    }
  }
  
  // Detect reduced motion preference once per callsite
  _prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }

  animate(element, animation, options = {}) {
    const {
      duration = 250,
      easing = 'ease',
      delay = 0,
      fillMode = 'both',
      iterations = 1,
      direction = 'normal'
    } = options;
    
    if (typeof element === 'string') {
      element = this.element && this.element.querySelector ? this.element.querySelector(element) : null;
    }
    if (!element) return;

    // Respect reduced motion
    if (this._prefersReducedMotion()) {
      if (options.onComplete) {
        try { options.onComplete(); } catch {}
      }
      return;
    }

    // If a keyframes object/array is provided, prefer WAAPI for perf and compositing
    const isKeyframes = Array.isArray(animation) || (animation && typeof animation === 'object' && !('trim' in animation));
    if (element.animate && isKeyframes) {
      try {
        const anim = element.animate(animation, {
          duration,
          easing,
          delay,
          fill: fillMode,
          iterations,
          direction
        });
        if (options.onComplete) {
          anim.finished.then(() => { try { options.onComplete(); } catch {} }).catch(() => {});
        }
        return;
      } catch {
        // fall through to CSS string fallback
      }
    }

    // Fallback: treat animation as a CSS keyframe name string
    if (typeof animation === 'string') {
      const d = (typeof duration === 'number') ? `${duration}ms` : duration;
      const dl = (typeof delay === 'number') ? `${delay}ms` : delay;
      element.style.animation = `${animation} ${d} ${easing} ${dl} ${fillMode} ${iterations} ${direction}`;
      if (options.onComplete) {
        const handleEnd = () => {
          element.removeEventListener('animationend', handleEnd);
          try { options.onComplete(); } catch {}
        };
        element.addEventListener('animationend', handleEnd);
      }
    }
  }
  
  ripple(arg) {
    try {
      // Resolve element and event safely
      const evt = (arg && typeof arg === 'object' && ('target' in arg || 'currentTarget' in arg)) ? arg : null;
      let el = null;
      if (evt) {
        const t = evt.currentTarget || evt.target;
        el = (t && t.closest) ? t.closest('button, a[role="button"], [data-ripple-host]') : t;
      } else if (arg && typeof arg === 'object' && arg.nodeType === 1) {
        el = arg; // direct element
      }
      if (!el || el.nodeType !== 1) return;

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) || 0;
      const cx = (evt && typeof evt.clientX === 'number') ? evt.clientX : (rect.left + rect.width / 2);
      const cy = (evt && typeof evt.clientY === 'number') ? evt.clientY : (rect.top + rect.height / 2);
      const x = cx - rect.left - size / 2;
      const y = cy - rect.top - size / 2;

      // Ensure positioning without breaking existing positioned elements
      const computedPos = (el && el.ownerDocument && el.ownerDocument.defaultView)
        ? el.ownerDocument.defaultView.getComputedStyle(el).position
        : '';
      if (!computedPos || computedPos === 'static') {
        el.style.position = 'relative';
      }
      el.style.overflow = 'hidden';

      const ripple = document.createElement('span');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = this.vs({
        base: {
          position: 'absolute',
          borderRadius: '50%',
          transform: 'scale(0)',
          willChange: 'transform, opacity',
          background: 'rgba(255, 255, 255, 0.5)',
          pointerEvents: 'none'
        }
      });

      // Prefer WAAPI for better perf; fallback to CSS animation keyframes name "ripple"
      if (ripple.animate) {
        try {
          el.appendChild(ripple);
          const anim = ripple.animate(
            [
              { transform: 'scale(0)', opacity: 0.35 },
              { transform: 'scale(1)', opacity: 0 }
            ],
            { duration: 600, easing: 'ease-out', fill: 'forwards' }
          );
          anim.finished.then(() => { try { ripple.remove(); } catch {} }).catch(() => { try { ripple.remove(); } catch {} });
          return;
        } catch {
          // fall through
        }
      }

      ripple.className += ' ' + this.vs({ base: { animation: 'ripple 600ms ease-out forwards' } });
      try { Element.prototype.appendChild.call(el, ripple); } catch { el.appendChild(ripple); }
      const remove = () => { try { ripple.remove(); } catch {} };
      ripple.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, 700);
    } catch {
      // noop fail-safe
    }
  }
  
  // Helper to merge theme values with custom styles
  withTheme(themeKey, customStyles = {}) {
    const themeValue = this.getThemeValue(themeKey);
    return { ...themeValue, ...customStyles };
  }
  
  getThemeValue(path) {
    if (!path) return {};
    const cached = this._themeCache.get(path);
    if (cached !== undefined) return cached;
    const keys = path.split('.');
    let value = this.theme;
    for (const key of keys) {
      value = value && value[key];
      if (value === undefined) {
        this._themeCache.set(path, {});
        return {};
      }
    }
    // Cache resolved value (shallow, non-reactive)
    this._themeCache.set(path, value);
    return value;
  }
  
  // Preset component styles
  getPresetStyle(preset) {
    const presets = {
      'button.primary': this.v.button('primary', 'md'),
      'button.secondary': this.v.button('secondary', 'md'),
      'button.ghost': this.v.button('ghost', 'md'),
      'button.primary.sm': this.v.button('primary', 'sm'),
      'button.primary.lg': this.v.button('primary', 'lg'),
      'card': this.v.card(false),
      'card.elevated': this.v.card(true),
      'input': this.v.input(),
      'container': this.v.container('lg'),
      'container.sm': this.v.container('sm'),
      'container.md': this.v.container('md'),
      'container.xl': this.v.container('xl'),
      'container.full': this.v.container('full'),
      'flex': this.v.flex(),
      'flex.center': this.v.flex({ alignItems: 'center', justifyContent: 'center' }),
      'flex.between': this.v.flex({ justifyContent: 'space-between', alignItems: 'center' }),
      'flex.col': this.v.flex({ flexDirection: 'column' }),
      'grid': this.v.grid(),
      'grid.2': this.v.grid({ gridTemplateColumns: 'repeat(2, 1fr)' }),
      'grid.3': this.v.grid({ gridTemplateColumns: 'repeat(3, 1fr)' }),
      'grid.4': this.v.grid({ gridTemplateColumns: 'repeat(4, 1fr)' }),
      'text.h1': this.v.text({ fontSize: 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)', fontWeight: '700', lineHeight: '1.1' }),
      'text.h2': this.v.text({ fontSize: 'clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem)', fontWeight: '600', lineHeight: '1.2' }),
      'text.h3': this.v.text({ fontSize: 'clamp(1.5rem, 1.35rem + 0.75vw, 2rem)', fontWeight: '600', lineHeight: '1.3' }),
      'text.body': this.v.text({ fontSize: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)' }),
      'text.small': this.v.text({ fontSize: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)' }),
      'text.muted': this.v.text({ color: '#71717a' })
    };
    
    return presets[preset] || '';
  }
}