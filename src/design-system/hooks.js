import { Velvet } from './velvet.js';
import { defaultTheme } from './theme.js';


/**
 * Provides functionality for managing Velvet instance and its utilities, styles, and themes.
 *
 * @param {Object} ctx - The context object which provides a `useRef` method.
 * @return {Object} - Returns an object with Velvet style handler, default theme, and utility functions:
 *   - vs: A function to apply styles using Velvet.
 *   - theme: The default theme for the Velvet instance.
 *   - utilities: Utility functions provided by the Velvet instance.
 */
export function useVelvet(ctx) {
  const velvetRef = ctx.useRef(null);
  if (!velvetRef.current) {
    velvetRef.current = new Velvet(null);
  }
  const v = velvetRef.current;
  return {
    vs: (styles) => v.style(styles),
    theme: defaultTheme,
    utilities: v.utilities
  };
}
