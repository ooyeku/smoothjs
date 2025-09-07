/**
 * Generates a color scale based on a given base color.
 * The scale includes shades and tints, ranging from lighter to darker variations of the base color.
 *
 * @param {string} baseColor - The base color in any valid CSS color format (e.g., HEX, RGB, HSL).
 * @return {object} An object representing the color scale with keys corresponding to shade levels
 *                  (e.g., 50, 100, 200, ... 950) and values as color strings.
 */
export function generateColorScale(baseColor) {
  // Simple color scale generation - in production, use a proper color library
  const scales = {
    50: lighten(baseColor, 0.95),
    100: lighten(baseColor, 0.9),
    200: lighten(baseColor, 0.8),
    300: lighten(baseColor, 0.6),
    400: lighten(baseColor, 0.3),
    500: baseColor,
    600: darken(baseColor, 0.1),
    700: darken(baseColor, 0.2),
    800: darken(baseColor, 0.3),
    900: darken(baseColor, 0.4),
    950: darken(baseColor, 0.5)
  };
  return scales;
}

/**
 * Adjusts the brightness of a given color by a specified amount to make it lighter.
 *
 * @param {string} color - The color to be lightened, represented as a string (e.g., HEX, RGB).
 * @param {number} amount - The amount by which to lighten the color. Positive values make it lighter.
 * @return {string} The adjusted color after lightening, represented as a string.
 */
function lighten(color, amount) {
  // Simple lighten implementation
  return adjustColor(color, amount, true);
}

/**
 * Adjusts the brightness of a given color by darkening it by a specified amount.
 *
 * @param {string} color - The color to be darkened, represented as a valid CSS color string.
 * @param {number} amount - The amount by which to darken the color. Positive values will darken the color.
 * @return {string} A new color string representing the darkened color.
 */
function darken(color, amount) {
  // Simple darken implementation
  return adjustColor(color, amount, false);
}

/**
 * Adjusts the color by either lightening or darkening it based on the provided parameters.
 *
 * @param {string} color - The original color in hexadecimal format (e.g., "#FFFFFF").
 * @param {number} amount - The adjustment factor between 0 and 1. A higher value results in a more significant adjustment.
 * @param {boolean} lighten - If true, the color will be lightened; if false, it will be darkened.
 * @return {string} The adjusted color in hexadecimal format.
 */
function adjustColor(color, amount, lighten) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  
  const adjust = lighten ? 
    (c) => Math.round(c + (255 - c) * amount) :
    (c) => Math.round(c * (1 - amount));
  
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);
  
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

/**
 * Represents a default theme configuration for a design system.
 *
 * The `defaultTheme` object contains various settings and properties such as colors, typography, spacing, and
 * other design-related variables to ensure consistent styling throughout an application.
 *
 * Properties:
 * - `colors`: Defines a palette of color schemes categorized by purpose, including primary, success,
 *   warning, danger, info, neutral, as well as special effects and gradient styles.
 * - `typography`: Configures font styles and text-related properties, including font families, font sizes,
 *   font weights, line heights, and letter spacing.
 * - `spacing`: Defines spacing values to be used throughout the application, adhering to a standardized
 *   scale.
 * - `borderRadius`: Provides predefined values for corner radius to create rounded elements.
 */
export const defaultTheme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    
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
    
    // Special effects
    glass: 'rgba(255, 255, 255, 0.1)',
    glassDark: 'rgba(0, 0, 0, 0.1)',
    glow: 'rgba(14, 165, 233, 0.5)',
    
    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      success: 'linear-gradient(135deg, #667eea 0%, #10b981 100%)',
      sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shimmer: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)'
    }
  },
  
  typography: {
    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    
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
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    
    lineHeights: {
      none: 1,
      tight: 1.1,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.7,
      loose: 2
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  effects: {
    shadows: {
      none: 'none',
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
      none: 'none',
      all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
      fade: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      slide: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      colors: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    animations: {
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      spin: 'spin 1s linear infinite',
      shimmer: 'shimmer 2s linear infinite',
      float: 'float 3s ease-in-out infinite',
      glow: 'glow 2s ease-in-out infinite',
      slideIn: 'slideIn 300ms ease-out',
      fadeIn: 'fadeIn 300ms ease-out',
      scaleIn: 'scaleIn 200ms ease-out'
    },
    
    blurs: {
      none: '0',
      sm: '4px',
      base: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '40px',
      '3xl': '64px'
    },
    
    opacity: {
      0: '0',
      5: '0.05',
      10: '0.1',
      20: '0.2',
      25: '0.25',
      30: '0.3',
      40: '0.4',
      50: '0.5',
      60: '0.6',
      70: '0.7',
      75: '0.75',
      80: '0.8',
      90: '0.9',
      95: '0.95',
      100: '1'
    }
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070'
  }
};

/**
 * Merges a base theme and a custom theme into a single theme object.
 * For nested objects, the method performs a shallow merge where properties
 * in the custom theme override those in the base theme.
 *
 * @param {Object} baseTheme - The base theme object to be merged.
 * @param {Object} customTheme - The custom theme object that overrides or extends the base theme.
 * @return {Object} A new theme object resulting from the merge of the base theme and custom theme.
 */
export function mergeThemes(baseTheme, customTheme) {
  const merged = { ...baseTheme };
  
  for (const key in customTheme) {
    if (typeof customTheme[key] === 'object' && !Array.isArray(customTheme[key])) {
      merged[key] = { ...baseTheme[key], ...customTheme[key] };
    } else {
      merged[key] = customTheme[key];
    }
  }
  
  return merged;
}