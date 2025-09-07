

/**
 * Retrieves a list of focusable elements within a given container element.
 *
 * @param {HTMLElement} container - The container element to search for focusable elements. Must be a valid DOM element with a `querySelectorAll` method.
 * @return {HTMLElement[]} An array of focusable elements found within the container. Returns an empty array if the container is invalid or contains no focusable elements.
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
 * Creates a focus trap within the specified container element. This ensures that focus is only allowed
 * on the focusable elements inside the container, trapping users in that containment area for accessibility purposes.
 *
 * @param {HTMLElement|string} container - The container element or a selector string identifying the DOM element for trapping focus within.
 *                                           If a string is provided, the method attempts to query and select the corresponding DOM element.
 *                                           If the container element is not found or invalid, the focus trap will not be applied.
 * @return {Function} A cleanup function that removes event listeners and restores the focus to the element that was active before the focus trap was applied.
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
 * A variable that represents a live region element, typically used for
 * accessibility purposes to relay dynamic content changes to assistive
 * technologies such as screen readers.
 *
 * When initialized, it should reference a DOM element that acts as a live
 * region for announcing updates. This is particularly useful for dynamically
 * updated content that might not otherwise be automatically communicated
 * to users relying on assistive technologies.
 *
 * The variable is initialized to null, indicating that no live region
 * element has been assigned yet.
 */
let liveRegion = null;
/**
 * Ensures that a live region element is present in the document for screen readers.
 * If the live region already exists and is attached to the document, it is returned.
 * Otherwise, a new live region element is created, configured, and appended to the document body.
 *
 * @return {HTMLElement|null} The live region element if the document exists, or null if the function is executed in a non-browser environment.
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
 * Announces a given message to assistive technologies using an ARIA live region.
 *
 * @param {string} message - The message to announce. If null or undefined, it will default to an empty string.
 * @param {Object} [options] - Options for the announcement.
 * @param {string} [options.politeness='polite'] - The politeness level for the announcement. Accepts 'polite' or 'assertive'.
 * @param {number} [options.timeout=3000] - The duration in milliseconds before the announcement is cleared. Set to 0 or less to disable clearing.
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
 * Creates an accessible skip link that allows users to bypass navigation
 * or other page sections and jump directly to the main content.
 *
 * @param {string} [target='#app'] - The CSS selector or ID of the element
 * to skip to. Defaults to '#app'.
 * @param {Object} [options={}] - Additional configuration options.
 * @param {string} [options.text='Skip to main content'] - The displayed text for the skip link.
 * @return {HTMLAnchorElement|null} The created skip link element or an existing skip link element
 * if it already exists. Returns null if execution takes place in a non-DOM environment or if
 * an error occurs.
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
 * Assigns ARIA (Accessible Rich Internet Applications) attributes and roles to a given DOM element.
 *
 * @param {HTMLElement} el - The target DOM element to which ARIA attributes and roles will be applied.
 * @param {Object} [attrs={}] - A key-value pair object representing the ARIA attributes or role to be added.
 *                               Keys are ARIA attribute names (without the `aria-` prefix) or `role`, and values are the corresponding attribute values.
 * @return {void} - This method does not return a value.
 */
export function aria(el, attrs = {}) {
  if (!el) return;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'role') el.setAttribute('role', String(v));
    else el.setAttribute(`aria-${k}`, String(v));
  });
}

export default { focusTrap, announce, createSkipLink, aria };
