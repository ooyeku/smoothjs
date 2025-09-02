import { Velvet } from './velvet.js';
import { defaultTheme } from './theme.js';

// Functional component helper for Velvet in SmoothJS
// Usage inside defineComponent setup(ctx):
//   const { vs, theme, utilities } = useVelvet(ctx);
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
