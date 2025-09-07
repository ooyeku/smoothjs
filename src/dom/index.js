/**
 * A shorthand function for selecting a single DOM element based on a CSS selector.
 *
 * @function $
 * @param {string} selector - A CSS selector string used to query the DOM.
 * @returns {Element|null} The first DOM element that matches the given selector, or null if no match is found or if the DOM is unavailable.
 */
export const $ = (selector) => {
  if (typeof document === 'undefined' || !selector) return null;
  return document.querySelector(selector);
};

/**
 * Utility function to select DOM elements based on a CSS selector.
 *
 * This function takes a CSS selector string as an argument and returns an array of matching DOM elements.
 * If the environment does not support `document` or if the selector is not provided, an empty array is returned.
 *
 * @param {string} selector - A valid CSS selector string to query elements from the DOM.
 * @returns {Array<Element>} An array containing the DOM elements that match the specified selector.
 */
export const $$ = (selector) => {
  if (typeof document === 'undefined' || !selector) return [];
  return Array.from(document.querySelectorAll(selector));
};

/**
 * Safely appends a child or a collection of children to a DOM element.
 *
 * This function handles various data types, including DOM nodes, arrays of nodes,
 * plain objects, and other data types. It ensures only valid DOM nodes or
 * string representations of objects are appended to the specified element.
 *
 * @param {HTMLElement} element - The parent DOM element to which children are appended.
 * @param {(Node|Array|Object|string|number|boolean|null)} child - The child or children to append.
 *   - If `child` is a Node, it will be appended directly.
 *   - If `child` is an Array, its elements will be recursively processed and appended.
 *   - If `child` is a plain object, it is converted to a string and appended as text.
 *   - If `child` is a string or a number, it is appended as a text node.
 *   - If `child` is `null` or `false`, the function takes no action.
 */
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

/**
 * Creates a new DOM element with specified tag, properties, and children.
 *
 * @param {string} tag - The tag name of the element to be created (e.g., 'div', 'span').
 * @param {Object} [props={}] - An object of properties and attributes to set on the element.
 *                              Includes standard DOM properties, styles, event listeners, etc.
 *                              Special handling is applied for:
 *                              - `style`: Should be an object with CSS property-value pairs.
 *                              - `dataset`: Should be an object of data-* attributes.
 *                              - `className` or `class`: Sets the element's class attribute.
 *                              - Event listeners: Keys prefixed with 'on' (e.g., 'onclick')
 *                                are treated as event handlers.
 * @param {...(string|Node|Array)} children - Child elements or text nodes to append to the created element.
 *                                            Can be strings, DOM nodes, or arrays containing strings/nodes.
 * @returns {HTMLElement|null} The created DOM element with all properties/attributes/children applied,
 *                             or `null` if running in a non-browser environment.
 */
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
