import { SsrCounter } from './components/SsrCounter.js';
import { DarkModeToggle } from './components/DarkModeToggle.js';

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  return theme;
}

// Expose toggle for the DarkModeToggle component to call
window.toggleDarkMode = function toggleDarkMode() {
  const html = document.documentElement;
  const cur = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  return next;
};

function mountToggle() {
  const host = document.getElementById('toggle-host');
  if (!host) return;
  const toggle = new DarkModeToggle(null, {}, { toggleDarkMode: window.toggleDarkMode });
  toggle.mount(host);
}

function hydrateCounter() {
  const root = document.getElementById('ssr-root');
  if (!root) return;
  // Read initial state from server-provided data or from DOM as fallback
  let initialCount = 0;
  try {
    if (window.__SSR_STATE__ && typeof window.__SSR_STATE__.count === 'number') {
      initialCount = window.__SSR_STATE__.count;
    } else {
      const valEl = root.querySelector('#value');
      if (valEl) initialCount = Number(valEl.textContent || '0') || 0;
    }
  } catch {}
  const comp = new SsrCounter(null, { count: initialCount }, {});
  comp.hydrate(root);
}

function start() {
  initTheme();
  mountToggle();
  hydrateCounter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
