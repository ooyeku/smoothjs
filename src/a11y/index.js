// Accessibility utilities for SmoothJS
// - focusTrap(container): traps focus within container; returns cleanup function
// - announce(message, { politeness, timeout }): announces a message via aria-live region
// - createSkipLink(target): inserts a skip link to target at top of document
// - aria(el, attrs): sets ARIA attributes conveniently

function getFocusable(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  const selectors = [
    'a[href]', 'button:not([disabled])', 'textarea:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ];
  const nodes = Array.from(container.querySelectorAll(selectors.join(',')));
  // In non-browser test environments (e.g., JSDOM), size/rects may be zero; return nodes directly
  return nodes;
}

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

let liveRegion = null;
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

export function announce(message, { politeness = 'polite', timeout = 3000 } = {}) {
  const region = ensureLiveRegion();
  if (!region) return;
  try { region.setAttribute('aria-live', politeness === 'assertive' ? 'assertive' : 'polite'); } catch {}
  region.textContent = String(message == null ? '' : message);
  if (timeout > 0) {
    setTimeout(() => { if (region) region.textContent = ''; }, timeout);
  }
}

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

export function aria(el, attrs = {}) {
  if (!el) return;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'role') el.setAttribute('role', String(v));
    else el.setAttribute(`aria-${k}`, String(v));
  });
}

export default { focusTrap, announce, createSkipLink, aria };
