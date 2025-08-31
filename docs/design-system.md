# SmoothJS Design System: Velvet

## Vision

Velvet is a magical, opinionated design system that makes styling in SmoothJS as smooth as the framework itself. It's built for developers who want beautiful UIs without diving deep into CSS, offering a fresh, modern aesthetic with JavaScript-first integration.

## Core Philosophy

1. **Zero-friction styling** - Style components as easily as setting state
2. **Design tokens as code** - Everything is JavaScript, no separate CSS files needed
3. **Intelligent defaults** - Beautiful out of the box, customizable when needed
4. **Component-aware** - Deeply integrated with SmoothJS lifecycle and patterns
5. **Progressive enhancement** - Start simple, add complexity only when needed

## Design Language

### Visual Identity

**Aesthetic**: Modern, clean, with subtle depth through carefully crafted shadows and gradients. Think "digital silk" - smooth transitions, gentle curves, and refined typography.

**Key Characteristics**:
- Generous whitespace for breathing room
- Subtle micro-animations that respond to user interaction
- Layered depth through shadows, not borders
- Gradient accents for visual interest
- Smooth corners (8px default radius)

### Color System

```javascript
const colors = {
  // Semantic colors with automatic light/dark variants
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  
  // Automatic semantic variants
  success: generateColorScale('#10b981'),
  warning: generateColorScale('#f59e0b'),
  danger: generateColorScale('#ef4444'),
  info: generateColorScale('#3b82f6'),
  
  // Neutral scale with true black/white
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
    1000: '#000000'
  },
  
  // Special effect colors
  glass: 'rgba(255, 255, 255, 0.1)',
  glow: 'rgba(14, 165, 233, 0.5)',
  shimmer: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)'
};
```

### Typography

```javascript
const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, monospace',
    display: 'Sora, sans-serif' // For headings
  },
  
  // Fluid typography that scales with viewport
  sizes: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
    base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 2rem)',
    '3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem)',
    '4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',
    '5xl': 'clamp(3rem, 2.55rem + 2.25vw, 4rem)'
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  lineHeights: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2
  }
};
```

### Spacing & Layout

```javascript
const spacing = {
  // Base unit: 4px, using multipliers for consistency
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  56: '14rem',     // 224px
  64: '16rem',     // 256px
  
  // Semantic spacing
  section: 'clamp(3rem, 5vw, 6rem)',
  container: 'clamp(1rem, 3vw, 2rem)'
};
```

### Effects & Animations

```javascript
const effects = {
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    glow: '0 0 20px rgba(14, 165, 233, 0.5)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  },
  
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '350ms ease',
    // Named transitions
    fade: 'opacity 250ms ease',
    slide: 'transform 250ms ease',
    scale: 'transform 200ms ease',
    colors: 'background-color 250ms ease, border-color 250ms ease, color 250ms ease'
  },
  
  animations: {
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    spin: 'spin 1s linear infinite',
    shimmer: 'shimmer 2s linear infinite',
    float: 'float 3s ease-in-out infinite',
    glow: 'glow 2s ease-in-out infinite'
  },
  
  blurs: {
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  }
};
```

## Technical Implementation

### 1. Core Style Engine

```javascript
// src/design-system/velvet.js
export class Velvet {
  constructor(component) {
    this.component = component;
    this.theme = defaultTheme;
    this.styles = new Map();
    this.cssVars = new Map();
    
    // Auto-inject base styles on first component
    if (!document.getElementById('velvet-base')) {
      this.injectBaseStyles();
    }
  }
  
  // Main styling method - returns class names and inline styles
  style(styleObj) {
    const { base, hover, focus, active, dark, responsive, ...variants } = styleObj;
    
    // Generate unique class name based on style hash
    const className = this.generateClassName(styleObj);
    
    if (!this.styles.has(className)) {
      // Convert JS styles to CSS
      const css = this.processStyles(styleObj);
      this.injectStyles(className, css);
      this.styles.set(className, css);
    }
    
    return className;
  }
  
  // Shorthand for common patterns
  box(styles) {
    return this.style({
      base: {
        display: 'flex',
        flexDirection: 'column',
        ...styles
      }
    });
  }
  
  text(styles) {
    return this.style({
      base: {
        fontFamily: this.theme.typography.fonts.sans,
        lineHeight: this.theme.typography.lineHeights.normal,
        ...styles
      }
    });
  }
  
  button(variant = 'primary', size = 'md') {
    return this.style(buttonStyles[variant][size]);
  }
  
  // Dynamic theme updates
  updateTheme(updates) {
    this.theme = deepMerge(this.theme, updates);
    this.updateCSSVariables();
  }
  
  // CSS variable management for dynamic theming
  private updateCSSVariables() {
    const root = document.documentElement;
    this.cssVars.forEach((value, key) => {
      root.style.setProperty(`--velvet-${key}`, value);
    });
  }
}
```

### 2. Component Integration

```javascript
// Extend SmoothComponent with Velvet
import { Component } from './component/SmoothComponent.js';
import { Velvet } from './design-system/velvet.js';

export class VelvetComponent extends Component {
  constructor(element, initialState, props) {
    super(element, initialState, props);
    this.v = new Velvet(this); // Velvet instance
    this.theme = this.v.theme; // Direct theme access
  }
  
  // Enhanced style method
  vs(styles) {
    if (typeof styles === 'string') {
      // Preset styles
      return this.v.getPreset(styles);
    }
    return this.v.style(styles);
  }
  
  // Style props helper
  styled(tag, styles, props = {}) {
    const className = this.vs(styles);
    return this.html`<${tag} class="${className}" ...${props}>`;
  }
  
  // Animation helper
  animate(element, animation, options = {}) {
    return this.v.animate(element, animation, options);
  }
}
```

### 3. Style Definition Syntax

```javascript
// Component with Velvet styling
class Card extends VelvetComponent {
  constructor() {
    super(null, {
      elevated: false,
      loading: false
    });
  }
  
  template() {
    // Method 1: Inline style objects
    const cardStyle = {
      base: {
        padding: this.theme.spacing[6],
        background: 'white',
        borderRadius: '12px',
        transition: this.theme.effects.transitions.base
      },
      hover: {
        transform: 'translateY(-2px)',
        shadow: this.theme.effects.shadows.lg
      },
      dark: {
        background: this.theme.colors.neutral[800],
        color: this.theme.colors.neutral[100]
      },
      // Conditional styles based on state
      ...(this.state.elevated && {
        base: {
          shadow: this.theme.effects.shadows.xl
        }
      })
    };
    
    // Method 2: Preset styles
    const buttonStyle = this.vs('button.primary.lg');
    
    // Method 3: Compose styles
    const titleStyle = this.vs({
      extend: 'heading.h2', // Extend preset
      base: {
        marginBottom: this.theme.spacing[4],
        gradient: this.theme.colors.gradients.primary
      }
    });
    
    return this.html`
      <div class="${this.vs(cardStyle)}">
        <h2 class="${titleStyle}">Card Title</h2>
        <p class="${this.vs('text.body')}">
          Card content goes here
        </p>
        <button 
          class="${buttonStyle}"
          onclick=${() => this.handleClick()}
        >
          ${this.state.loading ? 'Loading...' : 'Click Me'}
        </button>
      </div>
    `;
  }
}
```

### 4. Responsive Design System

```javascript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Usage in components
class ResponsiveLayout extends VelvetComponent {
  template() {
    const containerStyle = {
      base: {
        padding: this.theme.spacing[4],
        display: 'grid',
        gap: this.theme.spacing[4],
        gridTemplateColumns: '1fr'
      },
      responsive: {
        md: {
          gridTemplateColumns: 'repeat(2, 1fr)',
          padding: this.theme.spacing[6]
        },
        lg: {
          gridTemplateColumns: 'repeat(3, 1fr)',
          padding: this.theme.spacing[8]
        }
      }
    };
    
    return this.html`
      <div class="${this.vs(containerStyle)}">
        ${this.renderCards()}
      </div>
    `;
  }
}
```

### 5. Animation & Interaction System

```javascript
// Declarative animations
class AnimatedButton extends VelvetComponent {
  constructor() {
    super(null, {
      isAnimating: false
    });
  }
  
  template() {
    const buttonStyle = {
      base: {
        ...this.theme.presets.button.primary,
        position: 'relative',
        overflow: 'hidden'
      },
      // State-based animations
      animate: this.state.isAnimating && {
        animation: 'pulse 1s ease-in-out'
      },
      // Interaction states
      hover: {
        transform: 'scale(1.05)',
        shadow: this.theme.effects.shadows.glow
      },
      active: {
        transform: 'scale(0.98)'
      }
    };
    
    // Ripple effect on click
    const rippleStyle = {
      base: {
        position: 'absolute',
        borderRadius: '50%',
        transform: 'scale(0)',
        background: 'rgba(255, 255, 255, 0.5)',
        animation: 'ripple 600ms ease-out'
      }
    };
    
    return this.html`
      <button 
        class="${this.vs(buttonStyle)}"
        onclick=${(e) => this.handleClick(e)}
      >
        ${this.state.ripples.map(ripple => 
          this.html`<span 
            class="${this.vs(rippleStyle)}"
            style="left: ${ripple.x}px; top: ${ripple.y}px;"
          />`
        )}
        <span class="${this.vs('relative z-10')}">
          Click Me
        </span>
      </button>
    `;
  }
  
  handleClick(e) {
    // Add ripple at click position
    const rect = e.target.getBoundingClientRect();
    const ripple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now()
    };
    
    this.setState({
      ripples: [...this.state.ripples, ripple]
    });
    
    // Remove ripple after animation
    setTimeout(() => {
      this.setState({
        ripples: this.state.ripples.filter(r => r.id !== ripple.id)
      });
    }, 600);
  }
}
```

### 6. Utility Classes & Helpers

```javascript
// Tailwind-inspired utility generation
class VelvetUtilities {
  constructor(theme) {
    this.theme = theme;
    this.utilities = this.generateUtilities();
  }
  
  generateUtilities() {
    const utils = {};
    
    // Spacing utilities
    Object.entries(this.theme.spacing).forEach(([key, value]) => {
      utils[`p-${key}`] = { padding: value };
      utils[`m-${key}`] = { margin: value };
      utils[`px-${key}`] = { paddingLeft: value, paddingRight: value };
      utils[`py-${key}`] = { paddingTop: value, paddingBottom: value };
      // ... more spacing utils
    });
    
    // Color utilities
    Object.entries(this.theme.colors).forEach(([name, shades]) => {
      if (typeof shades === 'object') {
        Object.entries(shades).forEach(([shade, color]) => {
          utils[`text-${name}-${shade}`] = { color };
          utils[`bg-${name}-${shade}`] = { background: color };
          utils[`border-${name}-${shade}`] = { borderColor: color };
        });
      }
    });
    
    // Layout utilities
    utils.flex = { display: 'flex' };
    utils.grid = { display: 'grid' };
    utils.hidden = { display: 'none' };
    utils['flex-col'] = { flexDirection: 'column' };
    utils['items-center'] = { alignItems: 'center' };
    utils['justify-center'] = { justifyContent: 'center' };
    
    return utils;
  }
  
  // Parse utility classes
  parse(classString) {
    const classes = classString.split(' ');
    const styles = {};
    
    classes.forEach(cls => {
      if (this.utilities[cls]) {
        Object.assign(styles, this.utilities[cls]);
      }
    });
    
    return styles;
  }
}

// Usage in components
class QuickStyleComponent extends VelvetComponent {
  template() {
    // Mix utilities with custom styles
    return this.html`
      <div class="${this.vs('flex flex-col p-6 bg-white rounded-lg shadow-lg')}">
        <h2 class="${this.vs('text-2xl font-bold text-gray-900 mb-4')}">
          Quick Styling
        </h2>
        <p class="${this.vs('text-gray-600 leading-relaxed')}">
          Use utility classes for rapid prototyping
        </p>
      </div>
    `;
  }
}
```

### 7. Theme Customization

```javascript
// User theme customization
const customTheme = {
  colors: {
    primary: generateColorScale('#6366f1'), // Indigo
    brand: {
      twitter: '#1DA1F2',
      github: '#181717',
      google: '#4285F4'
    }
  },
  fonts: {
    sans: 'Poppins, sans-serif'
  },
  custom: {
    borderRadius: {
      card: '20px',
      button: '10px'
    }
  }
};

// Apply theme globally
Velvet.setGlobalTheme(customTheme);

// Or per component
class ThemedComponent extends VelvetComponent {
  constructor() {
    super();
    this.v.updateTheme(customTheme);
  }
}
```

### 8. Dark Mode Support

```javascript
// Automatic dark mode with system preference detection
class DarkModeManager {
  constructor() {
    this.mode = this.detectSystemPreference();
    this.listeners = new Set();
    
    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        this.setMode(e.matches ? 'dark' : 'light');
      });
  }
  
  detectSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  
  setMode(mode) {
    this.mode = mode;
    document.documentElement.setAttribute('data-theme', mode);
    this.notifyListeners();
  }
  
  toggle() {
    this.setMode(this.mode === 'dark' ? 'light' : 'dark');
  }
}

// Component with dark mode support
class DarkAwareComponent extends VelvetComponent {
  template() {
    const cardStyle = {
      base: {
        padding: this.theme.spacing[6],
        background: this.theme.colors.neutral[0],
        color: this.theme.colors.neutral[900]
      },
      dark: {
        background: this.theme.colors.neutral[900],
        color: this.theme.colors.neutral[100]
      }
    };
    
    return this.html`
      <div class="${this.vs(cardStyle)}">
        Content automatically adapts to dark mode
      </div>
    `;
  }
}
```

### 9. Component Library

```javascript
// Pre-built Velvet components
export const VelvetUI = {
  // Buttons
  Button: class extends VelvetComponent {
    static defaultProps = {
      variant: 'primary', // primary, secondary, ghost, danger
      size: 'md',        // sm, md, lg
      loading: false,
      disabled: false,
      fullWidth: false
    };
    
    template() {
      const { variant, size, loading, disabled, fullWidth } = this.props;
      
      return this.html`
        <button 
          class="${this.vs(`button.${variant}.${size}`)}"
          disabled=${disabled || loading}
          style=${fullWidth ? 'width: 100%' : ''}
        >
          ${loading ? this.renderSpinner() : this.props.children}
        </button>
      `;
    }
  },
  
  // Cards
  Card: class extends VelvetComponent {
    static defaultProps = {
      elevated: false,
      interactive: false,
      padding: 'md'
    };
    
    template() {
      const cardStyle = {
        base: {
          ...this.theme.presets.surfaces.card,
          padding: this.theme.spacing[this.props.padding]
        },
        ...(this.props.interactive && {
          hover: {
            transform: 'translateY(-2px)',
            shadow: this.theme.effects.shadows.lg,
            cursor: 'pointer'
          }
        })
      };
      
      return this.html`
        <div class="${this.vs(cardStyle)}">
          ${this.props.children}
        </div>
      `;
    }
  },
  
  // Forms
  Input: class extends VelvetComponent {
    static defaultProps = {
      type: 'text',
      size: 'md',
      error: false,
      icon: null
    };
    
    template() {
      const inputStyle = {
        base: {
          ...this.theme.presets.forms.input,
          borderColor: this.props.error 
            ? this.theme.colors.danger[500]
            : this.theme.colors.neutral[300]
        },
        focus: {
          borderColor: this.theme.colors.primary[500],
          outline: 'none',
          shadow: `0 0 0 3px ${this.theme.colors.primary[500]}20`
        }
      };
      
      return this.html`
        <div class="${this.vs('relative')}">
          ${this.props.icon && this.renderIcon()}
          <input 
            type="${this.props.type}"
            class="${this.vs(inputStyle)}"
            ...${this.props}
          />
        </div>
      `;
    }
  },
  
  // Layout
  Container: class extends VelvetComponent {
    static defaultProps = {
      maxWidth: 'lg', // sm, md, lg, xl, 2xl, full
      centered: true
    };
    
    template() {
      const widths = {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        full: '100%'
      };
      
      const containerStyle = {
        base: {
          width: '100%',
          maxWidth: widths[this.props.maxWidth],
          margin: this.props.centered ? '0 auto' : '0',
          padding: `0 ${this.theme.spacing[4]}`
        }
      };
      
      return this.html`
        <div class="${this.vs(containerStyle)}">
          ${this.props.children}
        </div>
      `;
    }
  },
  
  // Feedback
  Toast: class extends VelvetComponent {
    static defaultProps = {
      type: 'info', // success, warning, error, info
      duration: 3000,
      position: 'bottom-right'
    };
    
    onCreate() {
      if (this.props.duration > 0) {
        setTimeout(() => this.dismiss(), this.props.duration);
      }
    }
    
    template() {
      const colors = {
        success: this.theme.colors.success,
        warning: this.theme.colors.warning,
        error: this.theme.colors.danger,
        info: this.theme.colors.info
      };
      
      const toastStyle = {
        base: {
          ...this.theme.presets.surfaces.toast,
          background: colors[this.props.type][500],
          color: 'white',
          animation: 'slideIn 300ms ease-out'
        }
      };
      
      return this.html`
        <div class="${this.vs(toastStyle)}">
          ${this.renderIcon()}
          <span>${this.props.message}</span>
          <button onclick=${() => this.dismiss()}>×</button>
        </div>
      `;
    }
  }
};
```

### 10. Performance Optimizations

```javascript
// Style caching and optimization
class VelvetOptimizer {
  constructor() {
    this.styleCache = new Map();
    this.criticalStyles = new Set();
    this.observer = null;
  }
  
  // Deduplicate and cache styles
  cacheStyle(key, styles) {
    const hash = this.hashStyles(styles);
    
    if (this.styleCache.has(hash)) {
      return this.styleCache.get(hash);
    }
    
    const optimized = this.optimizeStyles(styles);
    this.styleCache.set(hash, optimized);
    return optimized;
  }
  
  // Extract critical CSS for initial render
  extractCritical(components) {
    components.forEach(component => {
      const styles = component.getCriticalStyles();
      styles.forEach(style => this.criticalStyles.add(style));
    });
    
    return Array.from(this.criticalStyles).join('\n');
  }
  
  // Lazy load non-critical styles
  lazyLoadStyles(callback) {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadComponentStyles(entry.target);
          }
        });
      });
    }
  }
  
  // Remove unused styles
  purgeUnused() {
    const usedClasses = new Set();
    document.querySelectorAll('[class]').forEach(el => {
      el.classList.forEach(cls => usedClasses.add(cls));
    });
    
    this.styleCache.forEach((value, key) => {
      if (!usedClasses.has(key)) {
        this.styleCache.delete(key);
      }
    });
  }
}
```

## Integration Guide

### Quick Start

```javascript
// 1. Install Velvet (no build step required)
import { VelvetComponent, VelvetUI, velvetTheme } from './smooth-velvet.js';

// 2. Create a styled component
class MyApp extends VelvetComponent {
  constructor() {
    super(null, {
      count: 0
    });
  }
  
  template() {
    return this.html`
      <${VelvetUI.Container} maxWidth="md">
        <${VelvetUI.Card} elevated interactive>
          <h1 class="${this.vs('text-4xl font-bold gradient-text mb-6')}">
            Welcome to Velvet
          </h1>
          
          <p class="${this.vs('text-gray-600 mb-8')}">
            Beautiful styling made simple
          </p>
          
          <${VelvetUI.Button} 
            variant="primary" 
            size="lg"
            onclick=${() => this.setState({ count: this.state.count + 1 })}
          >
            Clicked ${this.state.count} times
          </${VelvetUI.Button}>
        </${VelvetUI.Card}>
      </${VelvetUI.Container}>
    `;
  }
}

// 3. Mount your app
const app = new MyApp();
app.mount('#app');
```

### Advanced Integration

```javascript
// Custom Velvet configuration
const myVelvetConfig = {
  theme: {
    extend: velvetTheme,
    colors: {
      brand: '#FF6B6B'
    }
  },
  
  // Enable features
  features: {
    darkMode: 'class', // or 'media' for system preference
    rtl: false,
    animations: true,
    preflight: true, // Reset styles
    optimizeCss: true
  },
  
  // Custom plugins
  plugins: [
    VelvetPlugin.forms(),
    VelvetPlugin.typography(),
    VelvetPlugin.animations()
  ]
};

// Initialize Velvet with config
Velvet.init(myVelvetConfig);
```

## Best Practices

### 1. Component Composition
```javascript
// Compose complex components from Velvet primitives
class DataTable extends VelvetComponent {
  template() {
    return this.html`
      <${VelvetUI.Card}>
        <div class="${this.vs('overflow-x-auto')}">
          <table class="${this.vs('table.striped')}">
            ${this.renderTableContent()}
          </table>
        </div>
        <${VelvetUI.Pagination} 
          current=${this.state.page}
          total=${this.state.totalPages}
        />
      </${VelvetUI.Card}>
    `;
  }
}
```

### 2. State-Driven Styling
```javascript
// Let component state drive styling
class StatusIndicator extends VelvetComponent {
  getStatusStyle() {
    const statusColors = {
      online: 'success',
      offline: 'neutral',
      busy: 'warning',
      error: 'danger'
    };
    
    return {
      base: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: this.theme.spacing[2]
      },
      dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: this.theme.colors[statusColors[this.props.status]][500],
        animation: this.props.status === 'online' ? 'pulse 2s infinite' : 'none'
      }
    };
  }
}
```

### 3. Responsive Patterns
```javascript
// Mobile-first responsive design
class ResponsiveGrid extends VelvetComponent {
  template() {
    const gridStyle = {
      base: {
        display: 'grid',
        gap: this.theme.spacing[4],
        gridTemplateColumns: '1fr'
      },
      responsive: {
        sm: { gridTemplateColumns: 'repeat(2, 1fr)' },
        md: { gridTemplateColumns: 'repeat(3, 1fr)' },
        lg: { gridTemplateColumns: 'repeat(4, 1fr)' }
      }
    };
    
    return this.html`
      <div class="${this.vs(gridStyle)}">
        ${this.props.items.map(item => this.renderItem(item))}
      </div>
    `;
  }
}
```

## Conclusion

Velvet brings a magical, opinionated design system to SmoothJS that:

1. **Maintains SmoothJS philosophy** - No build step, pure JavaScript, minimal learning curve
2. **Provides beautiful defaults** - Modern, fresh design out of the box
3. **Deeply integrates** - Works seamlessly with SmoothJS components and lifecycle
4. **Stays flexible** - Easy to customize and extend
5. **Optimizes performance** - Smart caching, critical CSS extraction, lazy loading
6. **Simplifies styling** - JavaScript-first API that backend developers will love

The system grows with your needs - start with utility classes and presets, then progressively add custom styles, animations, and themes as your application evolves. Every aspect is designed to make styling as smooth as the framework itself.