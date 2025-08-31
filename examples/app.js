import { Component, createElement, $, $$, version, DevTools, A11y } from '../index.js';
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
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Add a skip link for keyboard users
try { A11y && typeof A11y.createSkipLink === 'function' && A11y.createSkipLink('#app'); } catch {}

// Helper: idle callback with fallback
const rIC = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb) : setTimeout(cb, 1));

// Start when DOM is ready
function startApp() {
  const appElement = document.querySelector('#app');
  if (!appElement) return;
  // Start router
  router.options.root = appElement;
  router.start();
  // Defer non-critical work
  rIC(() => {
    try { DevTools && typeof DevTools.enableOverlay === 'function' && DevTools.enableOverlay(); } catch {}
    const toggleHost = document.getElementById('toggle-host');
    if (toggleHost) {
      const darkToggle = new DarkModeToggle(null, {}, { toggleDarkMode: window.toggleDarkMode });
      darkToggle.mount(toggleHost);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
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
