// Velvet Design System for SmoothJS
export { Velvet, initVelvet, toggleDarkMode } from './velvet.js';
export { VelvetComponent } from './VelvetComponent.js';
export { VelvetUI } from './components.js';
export { defaultTheme, generateColorScale, mergeThemes } from './theme.js';
export { VelvetUtilities } from './utilities.js';
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