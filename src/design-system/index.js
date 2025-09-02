// Velvet Design System for SmoothJS
export { Velvet, initVelvet, toggleDarkMode } from './velvet.js';
export { VelvetComponent } from './VelvetComponent.js';
export { VelvetUI } from './components.js';
export { defaultTheme, generateColorScale, mergeThemes } from './theme.js';
export { VelvetUtilities } from './utilities.js';
// New functional, tokens, composition, plugins, factory, registry, provider
export { useVelvet } from './hooks.js';
export { generateCSSVariables, injectThemeVariables } from './tokens.js';
export { composeStyles, variants } from './compose.js';
export { VelvetPlugin, responsivePlugin } from './plugins.js';
export { createVelvetComponent } from './factory.js';
export { StyleRegistry } from './registry.js';
export { VelvetContext, VelvetProvider } from './provider.js';
export { 
  DarkModeManager, 
  getDarkModeManager, 
  setDarkMode, 
  isDarkMode, 
  subscribeToDarkMode 
} from './dark-mode.js';
export { 
  ResponsiveManager,
  getResponsiveManager,
  getCurrentBreakpoint,
  isBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  subscribeToBreakpoint,
  responsive,
  breakpoints
} from './responsive.js';