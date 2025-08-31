export const $ = (selector) => {
  if (typeof document === 'undefined' || !selector) return null;
  return document.querySelector(selector);
};

export const $$ = (selector) => {
  if (typeof document === 'undefined' || !selector) return [];
  return Array.from(document.querySelectorAll(selector));
};

const appendChildSafe = (element, child) => {
  if (child == null || child === false) return;
  if (Array.isArray(child)) {
    child.forEach(c => appendChildSafe(element, c));
  } else if (child instanceof Node) {
    element.appendChild(child);
  } else if (typeof child === 'object') {
    // skip plain objects (likely incorrect usage)
    element.appendChild(document.createTextNode(String(child)));
  } else {
    element.appendChild(document.createTextNode(String(child)));
  }
};

export const createElement = (tag, props = {}, ...children) => {
  if (typeof document === 'undefined') return null;
  const element = document.createElement(tag);

  if (props && typeof props === 'object') {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style' && value && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key === 'dataset' && value && typeof value === 'object') {
        Object.assign(element.dataset, value);
      } else if (key === 'className' || key === 'class') {
        element.className = value || '';
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else if (key in element) {
        try {
          element[key] = value;
        } catch {
          if (value === true) {
            element.setAttribute(key, '');
          } else if (value !== false && value != null) {
            element.setAttribute(key, String(value));
          }
        }
      } else {
        if (value === true) {
          element.setAttribute(key, '');
        } else if (value !== false && value != null) {
          element.setAttribute(key, String(value));
        }
      }
    });
  }

  children.forEach(child => appendChildSafe(element, child));
  return element;
};
