// Security utilities: simple, pluggable HTML sanitizer
// Default strategy removes script/style tags, event handler attributes, and javascript: URLs.

let customSanitizer = null;

function removeDangerousAttrs(el) {
  if (!el || !el.attributes) return;
  // Copy list because we'll mutate
  const attrs = Array.from(el.attributes);
  for (const a of attrs) {
    const name = a.name || '';
    const val = a.value || '';
    // Remove event handlers (on*)
    if (/^on/i.test(name)) {
      try { el.removeAttribute(name); } catch {}
      continue;
    }
    // Remove javascript: or data: with scriptable MIME in href/src
    if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(val)) {
      try { el.removeAttribute(name); } catch {}
      continue;
    }
    if ((name === 'src' || name === 'href') && /^\s*data:/i.test(val)) {
      // allow common safe images only
      const safe = /^\s*data:image\/(png|gif|jpg|jpeg|webp);/i.test(val);
      if (!safe) { try { el.removeAttribute(name); } catch {} }
      continue;
    }
    if (name === 'style') {
      // Very conservative: strip style attribute to avoid expression() or url(javascript:)
      try { el.removeAttribute('style'); } catch {}
      continue;
    }
  }
}

function cleanTree(root, { allowTags = null, allowAttrs = null } = {}) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
  const toRemove = [];
  let node = walker.currentNode;
  while (node) {
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    // Remove script, iframe, object, embed, link, meta, and style entirely
    if (/(script|iframe|object|embed|link|meta|style)/i.test(tag)) {
      toRemove.push(node);
    } else if (Array.isArray(allowTags) && allowTags.length && !allowTags.includes(tag)) {
      // If allowTags provided: unwrap unsupported tags by replacing with text
      const span = document.createElement('span');
      span.textContent = node.textContent || '';
      try { node.parentNode && node.parentNode.replaceChild(span, node); } catch {}
    } else {
      // sanitize attributes
      removeDangerousAttrs(node);
      if (allowAttrs && typeof allowAttrs === 'object') {
        const attrs = Array.from(node.attributes);
        for (const a of attrs) {
          const name = a.name;
          if (!allowAttrs[tag] && !allowAttrs['*']) continue; // no restrictions for this tag
          const allowedList = (allowAttrs[tag] || []).concat(allowAttrs['*'] || []);
          if (allowedList.length && !allowedList.includes(name)) {
            try { node.removeAttribute(name); } catch {}
          }
        }
      }
    }
    node = walker.nextNode();
  }
  for (const n of toRemove) {
    try { n.parentNode && n.parentNode.removeChild(n); } catch {}
  }
}

export function sanitize(html, options = {}) {
  if (typeof document === 'undefined') return String(html == null ? '' : html);
  if (customSanitizer) return customSanitizer(html, options);
  const tmp = document.createElement('div');
  tmp.innerHTML = String(html == null ? '' : html);
  cleanTree(tmp, options);
  return tmp.innerHTML;
}

export function configureSanitizer(fn) {
  customSanitizer = (typeof fn === 'function') ? fn : null;
}

export default { sanitize, configureSanitizer };
