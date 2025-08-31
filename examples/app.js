import { Component, Velvet, createElement, $, $$, version } from '../index.js';
import { FallbackStyling } from './components/FallbackStyling.js';
import { StatCard } from './components/StatCard.js';
import { ActionButton } from './components/ActionButton.js';
import { DataTable } from './components/DataTable.js';
import { DarkModeToggle } from './components/DarkModeToggle.js';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary.js';
import { router } from './router/index.js';
import { 
  counterStore, 
  preferencesStore, 
  selectIsEven, 
  selectDouble, 
  selectCountCategory, 
  selectAnimationDuration, 
  selectAppStatus 
} from './stores/index.js';

// Initialize Velvet design system
console.log('Initializing Velvet...', Velvet);
let velvetComponent, velvetToggleDarkMode, velvetStyling;

try {
  Velvet.initVelvet({ darkMode: 'auto' });
  velvetComponent = Velvet.VelvetComponent;
  velvetToggleDarkMode = Velvet.toggleDarkMode;
  velvetStyling = Velvet;
  console.log('Velvet initialized successfully', { velvetComponent, velvetToggleDarkMode });
} catch (error) {
  console.error('Error initializing Velvet:', error);
  // Fallback to regular Component if Velvet fails
  velvetComponent = Component;
  velvetToggleDarkMode = () => console.log('Dark mode toggle not available');
  velvetStyling = new FallbackStyling();
}

// Wait for DOM to be ready before starting router and mounting components
function startApp() {
  console.log('Starting app, DOM ready state:', document.readyState);
  
  const appElement = document.querySelector('#app');
  console.log('App element found:', appElement);
  
  if (!appElement) {
    console.log('App element not found, retrying...');
    setTimeout(startApp, 10);
    return;
  }
  
  console.log('Starting router...');
  // Ensure router mounts into a concrete Element to avoid selector timing issues
  router.options.root = appElement;
  router.start();
  
  console.log('Mounting dark mode toggle...');
  const darkToggle = new DarkModeToggle({ toggleDarkMode: velvetToggleDarkMode });
  const existingHost = document.getElementById('toggle-host');
  const toggleHost = existingHost || (() => { const d = document.createElement('div'); document.body.appendChild(d); return d; })();
  darkToggle.mount(toggleHost);
  console.log('App started successfully');
}

// Start the app when DOM is ready
console.log('Initial DOM ready state:', document.readyState);
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  console.log('DOM already loaded, starting app immediately...');
  startApp();
}

// Export components and utilities for external use
export {
  FallbackStyling,
  StatCard,
  ActionButton,
  DataTable,
  DarkModeToggle,
  GlobalErrorBoundary,
  router,
  counterStore,
  preferencesStore,
  selectIsEven,
  selectDouble,
  selectCountCategory,
  selectAnimationDuration,
  selectAppStatus,
  velvetComponent,
  velvetToggleDarkMode,
  velvetStyling
};
