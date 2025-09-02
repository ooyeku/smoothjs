import { defaultTheme } from './theme.js';

// Generate a flat record of CSS variables from the theme
export function generateCSSVariables(theme = defaultTheme) {
  const vars = {};

  // Colors: support nested shade objects (e.g., primary.500)
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([name, shades]) => {
      if (shades && typeof shades === 'object') {
        Object.entries(shades).forEach(([shade, value]) => {
          if (typeof value === 'string') {
            vars[`--color-${name}-${shade}`] = value;
          }
        });
      } else if (typeof shades === 'string') {
        vars[`--color-${name}`] = shades;
      }
    });
  }

  // Spacing (flat mapping)
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      vars[`--spacing-${String(key).replace(/\./g, '-')}`] = value;
    });
  }

  // Typography sizes (optional)
  if (theme.typography && theme.typography.sizes) {
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
      vars[`--font-size-${key}`] = value;
    });
  }

  // Border radius (optional)
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      vars[`--radius-${key}`] = value;
    });
  }

  return vars;
}

// Inject variables at :root
export function injectThemeVariables(theme = defaultTheme) {
  if (typeof document === 'undefined') return;
  const vars = generateCSSVariables(theme);
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    try { root.style.setProperty(key, value); } catch {}
  });
}
