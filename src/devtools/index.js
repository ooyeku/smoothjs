

/**
 * Represents the state configuration for a UI component.
 * This state holds information about various flags and elements required for operation.
 *
 * @property {boolean} overlayEnabled - Determines whether the overlay feature is active.
 * @property {HTMLElement|null} overlayEl - Reference to the overlay HTML element. It is null when no element is set.
 * @property {boolean} debug - Indicates if debug mode is enabled for the component.
 * @property {boolean} bound - Specifies whether the state has already been bound to an event or component.
 */
const state = {
  overlayEnabled: false,
  overlayEl: null,
  debug: false,
  bound: false
};

/**
 * Ensures that an overlay DOM element is created and appended to the document body.
 * If the overlay element already exists and is properly attached, it is returned.
 * Otherwise, a new overlay element is created, styled, and appended to the document body.
 *
 * @return {HTMLDivElement|null} The overlay element if the document context exists, otherwise null.
 */
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

/**
 * Binds an event listener for the 'smooth:error' event to display error messages in an overlay if enabled.
 * The method ensures that the binding occurs only once and only in environments with a `window` object available.
 *
 * @return {void} This function does not return a value.
 */
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

/**
 * A collection of tools for debugging and enhancing development workflows.
 * The `DevTools` object provides methods to enable or disable an overlay for debugging,
 * toggle debug state, and profile the execution time of functions.
 *
 * @namespace DevTools
 * @property {Function} enableOverlay - Enables the overlay for debugging purposes. Initializes and binds the necessary elements.
 * @property {Function} disableOverlay - Disables the debugging overlay by hiding the overlay element.
 * @property {Function} setDebug - Toggles the debug state.
 * @property {Function} time - Profiles the execution time of a given function and logs the result to the console. Accepts an optional label for the log.
 */
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
