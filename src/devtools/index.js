// Minimal DevTools and diagnostics for SmoothJS
// Features:
// - Runtime error overlay listenable via CustomEvent 'smooth:error'
// - enableOverlay/disableOverlay to toggle overlay
// - time(label, fn) helper to measure execution duration
// - setDebug to toggle verbose console warnings

const state = {
  overlayEnabled: false,
  overlayEl: null,
  debug: false,
  bound: false
};

function _ensureOverlay() {
  if (typeof document === 'undefined') return null;
  if (state.overlayEl && state.overlayEl.parentNode) return state.overlayEl;
  const el = document.createElement('div');
  el.setAttribute('data-smooth-overlay', '');
  Object.assign(el.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    top: '0',
    background: 'rgba(220, 38, 38, 0.95)',
    color: '#fff',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    fontSize: '14px',
    padding: '10px 14px',
    zIndex: '999999',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'none',
  });
  const title = document.createElement('div');
  title.textContent = 'SmoothJS Error';
  title.style.fontWeight = '600';
  const msg = document.createElement('div');
  msg.style.whiteSpace = 'pre-wrap';
  msg.style.marginTop = '4px';
  el.appendChild(title);
  el.appendChild(msg);
  document.body.appendChild(el);
  state.overlayEl = el;
  return el;
}

function _bind() {
  if (state.bound || typeof window === 'undefined') return;
  try {
    window.addEventListener('smooth:error', (e) => {
      if (!state.overlayEnabled) return;
      const el = _ensureOverlay();
      if (!el) return;
      const msg = (e && e.detail && e.detail.error && (e.detail.error.stack || e.detail.error.message)) || 'Unknown error';
      el.lastChild.textContent = String(msg);
      el.style.display = 'block';
    });
    state.bound = true;
  } catch {}
}

export const DevTools = {
  enableOverlay() {
    state.overlayEnabled = true;
    _bind();
    const el = _ensureOverlay();
    if (el) el.style.display = 'none';
  },
  disableOverlay() {
    state.overlayEnabled = false;
    if (state.overlayEl) state.overlayEl.style.display = 'none';
  },
  setDebug(v) { state.debug = !!v; },
  time(label, fn) {
    const name = String(label || 'measure');
    const hasPerf = (typeof performance !== 'undefined' && performance.now);
    let start, end;
    if (hasPerf) start = performance.now(); else { try { console.time(name); } catch {} }
    let result;
    try {
      result = fn();
      return result;
    } finally {
      if (hasPerf) {
        end = performance.now();
        try { console.log(`[SmoothJS] ${name}: ${(end - start).toFixed(2)}ms`); } catch {}
      } else {
        try { console.timeEnd(name); } catch {}
      }
    }
  }
};

export default DevTools;
