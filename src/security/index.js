
/**
 * A variable intended to hold a custom sanitizer function.
 * The value should be a function that processes and returns a sanitized version of its input,
 * or null if no custom sanitization is to be applied.
 *
 * @type {Function|null}
 */
let customSanitizer = null;

/**
 * Removes potentially dangerous attributes from a given DOM element to prevent security vulnerabilities such as XSS.
 *
 * @param {Element} el - The DOM element from which dangerous attributes will be removed. If the element is null or does not have attributes, the function does nothing.
 * @return {void} This function does not return a value.
 */
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

/**
 * Cleans the DOM tree rooted at the given element by removing or sanitizing unwanted nodes
 * and attributes based on the provided options.
 *
 * @param {Node} root - The root node of the tree to be cleaned.
 * @param {Object} [options] - Configuration options for cleaning the tree.
 * @param {string[]} [options.allowTags=null] - An optional array of tag names to allow. Tags not in this list are either removed or unwrapped, depending on the configuration.
 * @param {Object} [options.allowAttrs=null] - An optional object specifying which attributes are allowed for specific tags. Keys are tag names (or '*' for all tags), and values are arrays of allowed attribute names.
 * @return {void} This function does not return a value. The tree is modified in-place.
 */
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

/**
 * Sanitizes the provided HTML string by removing or modifying potentially unsafe elements and attributes.
 *
 * @param {string} html - The HTML string to be sanitized.
 * @param {Object} [options={}] - Optional configuration for the sanitization process.
 * @return {string} - The sanitized HTML string.
 */
export function sanitize(html, options = {}) {
  if (typeof document === 'undefined') return String(html == null ? '' : html);
  if (customSanitizer) return customSanitizer(html, options);
  const tmp = document.createElement('div');
  tmp.innerHTML = String(html == null ? '' : html);
  cleanTree(tmp, options);
  return tmp.innerHTML;
}

/**
 * Configures a custom sanitizer function to be used for sanitizing inputs.
 *
 * @param {Function|null} fn - A function to be used as the sanitizer. If the provided parameter is not a function, the sanitizer will be set to null.
 * @return {void} This function does not return a value.
 */
export function configureSanitizer(fn) {
  customSanitizer = (typeof fn === 'function') ? fn : null;
}

export default { sanitize, configureSanitizer };
