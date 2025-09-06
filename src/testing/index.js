// Lightweight testing utilities for SmoothJS
// No external dependencies; designed to work in JSDOM or a browser.

/**
 * Mounts a given component class to a DOM container and provides an interface for managing the component lifecycle.
 *
 * @function
 * @param {Function} ComponentClass - The constructor of the component to be instantiated and mounted.
 * @param {Object} [options] - Options for configuring the mounting process.
 * @param {Object} [options.props={}] - The properties to be passed to the component.
 * @param {Object} [options.state=null] - The initial state to be set on the component.
 * @param {HTMLElement|null} [options.container=null] - The DOM element where the component will be mounted. If none is provided, a new `div` will be created.
 * @returns {Object} - An object that provides access to the mounted component instance, the container element, and a method to unmount the component.
 * @throws {Error} - Throws an error if no DOM environment is available.
 */
export const mount = (ComponentClass, { props = {}, state = null, container = null } = {}) => {
  const root = container || (typeof document !== 'undefined' ? document.createElement('div') : null);
  if (!root) throw new Error('mount requires a DOM environment');
  const instance = new ComponentClass(null, state || undefined, props || {});
  instance.mount(root, { props });
  const unmount = () => { try { instance.unmount && instance.unmount(); } catch {} if (root.parentNode) root.parentNode.removeChild(root); };
  return { instance, container: root, unmount };
};

/**
 * Renders the provided HTML string into a newly created DOM container and
 * returns an object containing the container and an unmount function.
 *
 * This function is designed to operate in a browser environment with access
 * to the DOM. If called in an environment where `document` is undefined,
 * an error will be thrown.
 *
 * @param {string} [html=''] - The HTML string to render into the container.
 * @throws {Error} Throws an error if a DOM environment is not available.
 * @returns {Object} An object containing:
 *   - `container` (HTMLElement): The DOM container containing the rendered content.
 *   - `unmount` (Function): A function to remove the container from the DOM and clear its contents.
 */
export const render = (html = '') => {
  if (typeof document === 'undefined') throw new Error('render requires a DOM environment');
  const container = document.createElement('div');
  container.innerHTML = html;
  const unmount = () => { if (container.parentNode) container.parentNode.removeChild(container); container.innerHTML = ''; };
  return { container, unmount };
};

/**
 * Dispatches an event of a specified type on a target element with optional initialization parameters.
 *
 * @param {Element} target - The target element on which the event will be dispatched. If falsy, the function returns false.
 * @param {string} type - The type of event to dispatch (e.g., 'click', 'keydown', 'input').
 * @param {Object} [init={}] - Optional initialization object for the event, which may include additional properties like `bubbles`, `cancelable`, and event-specific data.
 * @returns {boolean} - Returns `true` if the event is successfully dispatched and not canceled. Returns `false` if the `target` is falsy.
 */
export const fire = (target, type, init = {}) => {
  if (!target) return false;
  let event;
  if (/^mouse|click/.test(type)) {
    event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
  } else if (/^key/.test(type)) {
    event = new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init });
  } else if (type === 'input' || type === 'change') {
    event = new Event(type, { bubbles: true, cancelable: true });
  } else {
    event = new Event(type, { bubbles: true, cancelable: true });
  }
  return target.dispatchEvent(event);
};

/**
 * Creates a Promise that resolves after a specified amount of time.
 *
 * @param {number} [ms=0] - The number of milliseconds to wait before the Promise resolves. Defaults to 0.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
/**
 * Represents a function that returns a promise which resolves immediately.
 *
 * This function is often used to defer the execution of code until the next
 * microtask in the JavaScript event loop. It is useful for scenarios where
 * asynchronous behavior is desired without any delay.
 *
 * @function tick
 * @returns {Promise<void>} A promise that resolves with no value.
 */
export const tick = () => Promise.resolve();

/**
 * Repeatedly evaluates a predicate function until it returns a truthy value
 * or a specified timeout is reached.
 *
 * @param {Function} predicate - A function that determines the condition to wait for.
 *                               Should return `true` when the condition is met.
 * @param {Object} [options={}] - Optional configuration for the wait operation.
 * @param {number} [options.timeout=1000] - Maximum time, in milliseconds, to wait before rejecting. Default is 1000ms.
 * @param {number} [options.interval=10] - Time, in milliseconds, between successive checks of the predicate function. Default is 10ms.
 * @returns {Promise<boolean>} A promise that resolves to `true` when the predicate returns a truthy value,
 *                             or rejects with an error if the timeout is reached before the predicate is satisfied.
 * @throws {Error} Throws a timeout error if the timeout duration is exceeded before the predicate is fulfilled.
 */
export const waitFor = (predicate, { timeout = 1000, interval = 10 } = {}) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      try {
        if (predicate && predicate()) return resolve(true);
      } catch {}
      if (Date.now() - start >= timeout) return reject(new Error('waitFor: timeout'));
      setTimeout(check, interval);
    };
    check();
  });
};

/**
 * An asynchronous function that executes a provided input, awaits its result if it returns a promise,
 * and ensures all microtasks and a macrotask are flushed before returning.
 *
 * @param {Function|any} run - The input to be executed. If it's a function, it will be called and its return value is processed.
 *                             Otherwise, the input value is processed directly. If the result is a promise, it will be awaited.
 * @returns {Promise<any>} A promise resolving to the final result of the executed input.
 */
export const act = async (run) => {
  let result;
  if (typeof run === 'function') result = run(); else result = run;
  // Await the result if it's a promise
  if (result && typeof result.then === 'function') {
    await result;
  }
  // Let microtasks and a macrotask flush
  await Promise.resolve();
  await new Promise(r => setTimeout(r, 0));
  return result;
};

/**
 * Finds and retrieves the first DOM element within a given container that matches the specified
 * `data-testid` attribute.
 *
 * @function
 * @param {HTMLElement} container - The HTML container element to search within.
 * @param {string} testId - The value of the `data-testid` attribute to query for.
 * @returns {HTMLElement|null} The first element matching the specified `data-testid` value, or
 * null if no matching element is found, the container is not provided, or the testId is not provided.
 */
export const getByTestId = (container, testId) => {
  if (!container || !testId) return null;
  const esc = (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') ? CSS.escape : (s) => s;
  return container.querySelector(`[data-testid="${esc(testId)}"]`);
};

/**
 * Retrieves all elements within a specified container that match the given data-testid attribute.
 *
 * @param {HTMLElement} container - The container element where the search is conducted.
 * @param {string} testId - The data-testid attribute value to query for.
 * @returns {HTMLElement[]} An array of elements that match the specified data-testid. Returns an empty array if no elements match or if required parameters are missing.
 */
export const getAllByTestId = (container, testId) => {
  if (!container || !testId) return [];
  const esc = (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') ? CSS.escape : (s) => s;
  return Array.from(container.querySelectorAll(`[data-testid="${esc(testId)}"]`));
};

export default { mount, render, fire, wait, tick, waitFor, act, getByTestId, getAllByTestId };
