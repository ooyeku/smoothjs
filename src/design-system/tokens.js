import { defaultTheme } from './theme.js';

// Generate a flat record of CSS variables from the theme
/**
 * Generates a collection of CSS custom properties (variables) based on the provided theme object.
 * Extracts and maps theme properties such as colors, spacing, typography sizes, and border radius into CSS variable definitions.
 *
 * @param {object} [theme=defaultTheme] - The theme object containing design tokens like colors, spacing, typography, and borderRadius.
 * @param {object} [theme.colors] - An object defining color tokens, optionally supporting nested shade objects.
 * @param {object} [theme.spacing] - An object defining spacing tokens.
 * @param {object} [theme.typography] - An object containing typography-related information.
 * @param {object} [theme.typography.sizes] - An object defining font size tokens.
 * @param {object} [theme.borderRadius] - An object defining border radius tokens.
 *
 * @return {object} A key-value map of CSS variable names (keys) and their corresponding values from the theme.
 */
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
/**
 * Injects CSS variables corresponding to the provided theme into the document's root element.
 *
 * @param {Object} theme - The theme object containing key-value pairs of CSS variable names and their corresponding values. Defaults to `defaultTheme` if not provided.
 * @return {void} This function does not return a value.
 */
export function injectThemeVariables(theme = defaultTheme) {
  if (typeof document === 'undefined') return;
  const vars = generateCSSVariables(theme);
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    try { root.style.setProperty(key, value); } catch {}
  });
}
