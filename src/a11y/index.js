

/**
 * Retrieves all focusable elements within a specified container.
 *
 * @param {HTMLElement} container - The container element in which to find focusable elements. Must support `querySelectorAll`.
 * @return {HTMLElement[]} An array of focusable elements within the specified container. Returns an empty array if the container is invalid or no focusable elements are found.
 */
function getFocusable(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  const selectors = [
    'a[href]', 'button:not([disabled])', 'textarea:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ];
    // In non-browser test environments (e.g., JSDOM), size/rects may be zero; return nodes directly
  return Array.from(container.querySelectorAll(selectors.join(',')));
}

/**
 * Creates a focus trap within a given container, ensuring that focus remains
 * within the specified element while allowing navigation via the Tab key.
 *
 * @param {HTMLElement|string} container - The target container element or a CSS selector string.
 * If a string is provided, the method queries the DOM to find the element. If no element is found, the method no-ops.
 *
 * @return {Function} A cleanup function to remove the focus trap. This function restores the original
 * focus, removes event listeners, and resets any temporary focus-related attributes added during setup.
 */
export function focusTrap(container) {
  if (typeof document === 'undefined') return () => {};
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return () => {};
  let lastFocused = null;
  try { lastFocused = document.activeElement; } catch {}

  const focusables = () => getFocusable(el);
  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    const f = focusables();
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0];
    const last = f[f.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !el.contains(active)) {
        e.preventDefault();
        try { last.focus(); } catch {}
      }
    } else {
      if (active === last) {
        e.preventDefault();
        try { first.focus(); } catch {}
      }
    }
  }

  function handleFocusIn(e) {
    if (!el.contains(e.target)) {
      const f = focusables();
      if (f.length) {
        try { f[0].focus(); } catch {}
      }
    }
  }

  el.addEventListener('keydown', handleKeydown);
  document.addEventListener('focusin', handleFocusIn);

  // Move focus to first focusable within container
  const initial = focusables();
  if (initial.length) {
    try { initial[0].focus(); } catch {}
  } else {
    // Make container focusable temporarily
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { el.focus(); } catch {}
  }

  return () => {
    try { el.removeEventListener('keydown', handleKeydown); } catch {}
    try { document.removeEventListener('focusin', handleFocusIn); } catch {}
    if (lastFocused && document.contains(lastFocused)) {
      try { lastFocused.focus(); } catch {}
    }
  };
}

/**
 * Represents a live region within the application, used for ARIA live region
 * functionality to announce dynamic content changes to assistive technologies.
 *
 * This variable is typically assigned an appropriate DOM element or remains
 * null if no live region is set. It is utilized to enhance accessibility by
 * enabling screen readers to monitor and announce updates in response to
 * application interactions.
 *
 * @type {?HTMLElement}
 */
let liveRegion = null;
/**
 * Ensures the presence of a live region in the DOM for assistive technologies.
 * If a live region already exists, it returns the existing live region element.
 * Otherwise, it creates a new live region element, appends it to the document body,
 * and returns the newly created live region element.
 *
 * @return {HTMLDivElement|null} The live region element if executed in a browser environment,
 * or null if executed in a non-browser environment (e.g., server-side rendering).
 */
function ensureLiveRegion() {
  if (typeof document === 'undefined') return null;
  if (liveRegion && liveRegion.parentNode) return liveRegion;
  const div = document.createElement('div');
  div.setAttribute('aria-live', 'polite');
  div.setAttribute('role', 'status');
  Object.assign(div.style, {
    position: 'absolute', width: '1px', height: '1px', margin: '-1px', border: '0', padding: '0',
    clip: 'rect(0 0 0 0)', overflow: 'hidden'
  });
  document.body.appendChild(div);
  liveRegion = div;
  return div;
}

/**
 * Announces a message using an ARIA live region for screen readers.
 *
 * @param {string} message - The message to be announced.
 * @param {Object} [options] - Configuration options for the announcement.
 * @param {string} [options.politeness='polite'] - The politeness level for the announcement. Can be 'polite' or 'assertive'.
 * @param {number} [options.timeout=3000] - The duration in milliseconds before clearing the message. Set to 0 to disable clearing the message.
 * @return {void} This function does not return a value.
 */
export function announce(message, { politeness = 'polite', timeout = 3000 } = {}) {
  const region = ensureLiveRegion();
  if (!region) return;
  try { region.setAttribute('aria-live', politeness === 'assertive' ? 'assertive' : 'polite'); } catch {}
  region.textContent = String(message == null ? '' : message);
  if (timeout > 0) {
    setTimeout(() => { if (region) region.textContent = ''; }, timeout);
  }
}

/**
 * Creates and appends a skip link to the document for accessibility purposes.
 * The skip link allows users to bypass navigation and skip directly to the main content.
 *
 * @param {string} [target='#app'] - The ID or selector of the target element to which the skip link will navigate.
 * @param {Object} [options={}] - Additional options.
 * @param {string} [options.text='Skip to main content'] - The text to display in the skip link.
 * @return {HTMLAnchorElement|null} The created skip link element, or null if the operation fails or if the document object is not available.
 */
export function createSkipLink(target = '#app', { text = 'Skip to main content' } = {}) {
  if (typeof document === 'undefined') return null;
  try {
    const existing = document.querySelector('[data-skip-link]');
    if (existing) return existing;
    const a = document.createElement('a');
    a.href = typeof target === 'string' ? target : '#app';
    a.textContent = text;
    a.setAttribute('data-skip-link', '');
    Object.assign(a.style, {
      position: 'absolute', left: '8px', top: '8px', background: '#111827', color: '#fff',
      padding: '6px 10px', borderRadius: '6px', transform: 'translateY(-150%)',
      transition: 'transform 150ms ease', zIndex: '99999', textDecoration: 'none'
    });
    a.addEventListener('focus', () => { a.style.transform = 'translateY(0)'; });
    a.addEventListener('blur', () => { a.style.transform = 'translateY(-150%)'; });
    document.body.insertBefore(a, document.body.firstChild);
    return a;
  } catch { return null; }
}

/**
 * Updates the given element with ARIA attributes and roles.
 *
 * @param {HTMLElement} el - The HTML element to which ARIA attributes will be applied.
 * @param {Object} [attrs={}] - A key-value pair object where the key is the ARIA attribute name (without the 'aria-' prefix) or 'role', and the value is the attribute value.
 * @return {void} This function does not return a value.
 */
export function aria(el, attrs = {}) {
  if (!el) return;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'role') el.setAttribute('role', String(v));
    else el.setAttribute(`aria-${k}`, String(v));
  });
}

export default { focusTrap, announce, createSkipLink, aria };
