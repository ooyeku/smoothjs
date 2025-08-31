import { SsrCounter } from './components/SsrCounter.js';

(function start() {
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
})();
