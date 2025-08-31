import { Component, createElement, $, $$, version } from '../index.js';
import { StatCard } from './components/StatCard.js';
import { ActionButton } from './components/index.js';
import { DataTable } from './components/index.js';
import { DarkModeToggle } from './components/index.js';
import { GlobalErrorBoundary } from './components/index.js';
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

// Simple theme toggle function
window.toggleDarkMode = function() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  return newTheme;
};

// Initialize theme
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

// Wait for DOM to be ready before starting router and mounting components
function startApp() {
  const appElement = document.querySelector('#app');
  if (!appElement) {
    setTimeout(startApp, 10);
    return;
  }
  
  // Start router
  router.options.root = appElement;
  router.start();
  
  // Mount dark mode toggle
  const toggleHost = document.getElementById('toggle-host');
  if (toggleHost) {
    console.log('About to create DarkModeToggle with props:', { toggleDarkMode: window.toggleDarkMode });
    const darkToggle = new DarkModeToggle(null, {}, { toggleDarkMode: window.toggleDarkMode });
    console.log('DarkModeToggle created, props:', darkToggle.props);
    darkToggle.mount(toggleHost);
  }
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
  selectAppStatus
};
