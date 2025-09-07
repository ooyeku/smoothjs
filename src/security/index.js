
/**
 * A variable that holds a custom sanitizer function to process and clean input data.
 * The sanitizer function, when assigned, will be used to perform specific transformations
 * or validations on the given input.
 *
 * @type {Function|null}
 */
let customSanitizer = null;

/**
 * Removes dangerous attributes from a DOM element to prevent XSS and other security risks.
 * This includes removing attributes such as event handlers (e.g., `onclick`),
 * `javascript:` or unsafe `data:` URLs in `href` or `src`, and any `style` attributes.
 *
 * @param {Element} el - The DOM element from which dangerous attributes will be removed.
 *                        If the element is null or does not have attributes, the function exits early.
 * @return {void} - Does not return any value; modifies the provided element in place.
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
 * Cleans a DOM tree by removing or sanitizing certain elements and attributes based on the provided rules.
 *
 * @param {Node} root - The root node of the DOM tree to be cleaned.
 * @param {Object} [options] - Options to customize the cleaning process.
 * @param {string[]} [options.allowTags] - An array of allowed tags. Tags not in this list are replaced with text or removed entirely.
 * @param {Object} [options.allowAttrs] - An object defining allowed attributes for certain tags. The key is the tag name (or '*' for all tags), and the value is an array of allowed attributes.
 * @return {void} - This function does not return a value; it modifies the DOM tree in place.
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
 * Sanitizes the provided HTML string to remove or adjust potentially unsafe content.
 *
 * @param {string} html - The HTML string to be sanitized.
 * @param {Object} [options={}] - Optional configuration options for the sanitizer.
 * @return {string} The sanitized HTML string.
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
 * Configures a custom sanitizer function to be used. If the provided argument
 * is not a function, the sanitizer will be set to null.
 *
 * @param {function|null} fn - A function that defines the custom sanitizer logic.
 *                              If not a function, the sanitizer will be set to null.
 * @return {void} This method does not return a value.
 */
export function configureSanitizer(fn) {
  customSanitizer = (typeof fn === 'function') ? fn : null;
}

export default { sanitize, configureSanitizer };
