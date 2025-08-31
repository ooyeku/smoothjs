// Fallback styling system when Velvet fails
export class FallbackStyling {
  constructor() {
    this.colors = {
      primary: '#0ea5e9',
      secondary: '#6b7280',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0c4a6e'
    };
  }

  // Theme toggle functionality
  toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    
    // Store preference in localStorage
    localStorage.setItem('theme', newTheme);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
    
    return newTheme;
  }

  // Get current theme
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  // Initialize theme from localStorage
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }

  // Container styles
  container(size = 'lg') {
    const sizes = {
      sm: 'max-width: 640px',
      md: 'max-width: 768px',
      lg: 'max-width: 1024px',
      xl: 'max-width: 1280px',
      full: 'max-width: 100%'
    };
    return `margin: 0 auto; padding: 0.75rem 1rem; ${sizes[size] || sizes.lg}`;
  }

  // Card styles
  card(elevated = false) {
    const base = 'background: white; border-radius: 12px; padding: 1rem 1.25rem; border: 1px solid #e5e7eb;';
    const shadow = elevated ? 'box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08);' : 'box-shadow: 0 1px 3px rgba(0,0,0,.1);';
    return `${base} ${shadow}`;
  }

  // Button styles
  button(variant = 'primary', size = 'md') {
    const variants = {
      primary: 'background: #0ea5e9; color: white; border: 1px solid #0ea5e9;',
      secondary: 'background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;',
      ghost: 'background: transparent; color: #6b7280; border: 1px solid #d1d5db;',
      outline: 'background: transparent; color: #0ea5e9; border: 1px solid #0ea5e9;'
    };
    
    const sizes = {
      sm: 'padding: 0.25rem 0.75rem; font-size: 0.875rem;',
      md: 'padding: 0.5rem 1rem; font-size: 1rem;',
      lg: 'padding: 0.75rem 1.5rem; font-size: 1.125rem;'
    };

    return `${variants[variant] || variants.primary} ${sizes[size] || sizes.md} border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block;`;
  }

  // Text styles
  text(options = {}) {
    const { fontSize = '1rem', fontWeight = '400', color = 'inherit', margin = '0' } = options;
    return `font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; margin: ${margin};`;
  }

  // Utility classes
  vs(styles) {
    if (typeof styles === 'string') {
      // Handle utility classes
      const utilityMap = {
        'text-center': 'text-align: center;',
        'text-h2': 'font-size: 1.875rem; font-weight: 600;',
        'text-h3': 'font-size: 1.5rem; font-weight: 600;',
        'text-lg': 'font-size: 1.125rem;',
        'text-sm': 'font-size: 0.875rem;',
        'text-xs': 'font-size: 0.75rem;',
        'font-bold': 'font-weight: 700;',
        'font-semibold': 'font-weight: 600;',
        'font-medium': 'font-weight: 500;',
        'mb-2': 'margin-bottom: 0.5rem;',
        'mb-4': 'margin-bottom: 1rem;',
        'mb-6': 'margin-bottom: 1.5rem;',
        'mb-0': 'margin-bottom: 0;',
        'mt-2': 'margin-top: 0.5rem;',
        'mt-4': 'margin-top: 1rem;',
        'mt-6': 'margin-top: 1.5rem;',
        'p-4': 'padding: 1rem;',
        'p-6': 'padding: 1.5rem;',
        'px-4': 'padding-left: 1rem; padding-right: 1rem;',
        'py-2': 'padding-top: 0.5rem; padding-bottom: 0.5rem;',
        'py-4': 'padding-top: 1rem; padding-bottom: 1rem;',
        'flex': 'display: flex;',
        'flex-col': 'display: flex; flex-direction: column;',
        'items-center': 'align-items: center;',
        'justify-center': 'justify-content: center;',
        'justify-between': 'justify-content: space-between;',
        'gap-2': 'gap: 0.5rem;',
        'gap-4': 'gap: 1rem;',
        'grid': 'display: grid;',
        'grid-cols-1': 'grid-template-columns: repeat(1, 1fr);',
        'grid-cols-2': 'grid-template-columns: repeat(2, 1fr);',
        'grid-cols-3': 'grid-template-columns: repeat(3, 1fr);',
        'grid-cols-4': 'grid-template-columns: repeat(4, 1fr);',
        'space-y-3': 'display: flex; flex-direction: column; gap: 0.75rem;',
        'space-y-4': 'display: flex; flex-direction: column; gap: 1rem;',
        'w-full': 'width: 100%;',
        'h-full': 'height: 100%;',
        'rounded': 'border-radius: 6px;',
        'rounded-lg': 'border-radius: 8px;',
        'rounded-xl': 'border-radius: 12px;',
        'shadow': 'box-shadow: 0 1px 3px rgba(0,0,0,.1);',
        'shadow-lg': 'box-shadow: 0 10px 15px rgba(0,0,0,.1);',
        'transition': 'transition: all 200ms ease;',
        'hover:scale-105': 'transition: transform 200ms ease;',
        'hover:scale-105:hover': 'transform: scale(1.05);',
        'text-neutral-600': 'color: #6b7280;',
        'text-neutral-400': 'color: #9ca3af;',
        'text-neutral-300': 'color: #d1d5db;',
        'text-neutral-700': 'color: #374151;',
        'text-blue-600': 'color: #2563eb;',
        'text-blue-800': 'color: #1e40af;',
        'text-green-600': 'color: #059669;',
        'text-green-700': 'color: #166534;',
        'text-red-600': 'color: #dc2626;',
        'text-yellow-600': 'color: #d97706;',
        'bg-white': 'background: white;',
        'bg-gray-50': 'background: #f9fafb;',
        'bg-gray-100': 'background: #f3f4f6;',
        'bg-blue-50': 'background: #eff6ff;',
        'bg-green-50': 'background: #f0fdf4;',
        'bg-yellow-50': 'background: #fefce8;',
        'bg-red-50': 'background: #fef2f2;',
        'border-gray-200': 'border: 1px solid #e5e7eb;',
        'border-blue-200': 'border: 1px solid #bfdbfe;',
        'border-green-200': 'border: 1px solid #bbf7d0;',
        'border-yellow-200': 'border: 1px solid #fef08a;',
        'border-red-200': 'border: 1px solid #fecaca;'
      };
      
      const classes = styles.split(' ');
      return classes.map(cls => utilityMap[cls] || cls).join(' ');
    }
    
    // Handle object-based styles
    if (typeof styles === 'object') {
      const { base = {}, hover = {}, dark = {}, responsive = {} } = styles;
      let css = '';
      
      // Base styles
      Object.entries(base).forEach(([prop, value]) => {
        css += `${this.camelToKebab(prop)}: ${value}; `;
      });
      
      return css.trim();
    }
    
    return '';
  }

  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}
