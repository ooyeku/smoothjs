import { SmoothComponent } from '../component/SmoothComponent.js';
import { Velvet } from './velvet.js';
import { defaultTheme } from './theme.js';

export class VelvetComponent extends SmoothComponent {
  constructor(element, initialState, props) {
    super(element, initialState, props);
    this.v = new Velvet(this);
    this.theme = defaultTheme;
  }
  
  vs(styles) {
    if (typeof styles === 'string') {
      // Handle utility classes or preset styles
      const classes = styles.split(' ');
      return classes.map(cls => {
        // Check if it's a utility class
        if (this.v.utilities && this.v.utilities[cls]) {
          return this.v.style({ base: this.v.utilities[cls] });
        }
        return cls;
      }).join(' ');
    }
    return this.v.style(styles);
  }
  
  styled(tag, styles, props = {}) {
    const className = this.vs(styles);
    const propsStr = Object.entries(props)
      .map(([key, value]) => {
        if (key === 'onclick' || key.startsWith('on')) {
          return '';
        }
        return `${key}="${value}"`;
      })
      .join(' ');
    
    return `<${tag} class="${className}" ${propsStr}>`;
  }
  
  styledClose(tag) {
    return `</${tag}>`;
  }
  
  animate(element, animation, options = {}) {
    const {
      duration = '250ms',
      easing = 'ease',
      delay = '0ms',
      fillMode = 'both'
    } = options;
    
    if (typeof element === 'string') {
      element = this.element.querySelector(element);
    }
    
    if (!element) return;
    
    element.style.animation = `${animation} ${duration} ${easing} ${delay} ${fillMode}`;
    
    if (options.onComplete) {
      const handleEnd = () => {
        element.removeEventListener('animationend', handleEnd);
        options.onComplete();
      };
      element.addEventListener('animationend', handleEnd);
    }
  }
  
  ripple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.className = this.vs({
      base: {
        position: 'absolute',
        borderRadius: '50%',
        transform: 'scale(0)',
        background: 'rgba(255, 255, 255, 0.5)',
        animation: 'ripple 600ms ease-out',
        pointerEvents: 'none'
      }
    });
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  // Helper to merge theme values with custom styles
  withTheme(themeKey, customStyles = {}) {
    const themeValue = this.getThemeValue(themeKey);
    return { ...themeValue, ...customStyles };
  }
  
  getThemeValue(path) {
    const keys = path.split('.');
    let value = this.theme;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return {};
    }
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