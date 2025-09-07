

/**
 * Mounts a component to a DOM container and provides control over its lifecycle.
 *
 * @function
 * @param {Function} ComponentClass - The class representing the component to be mounted.
 * @param {Object} [options] - Options to configure the mount process.
 * @param {Object} [options.props={}] - The initial props to pass to the component.
 * @param {Object|null} [options.state=null] - The initial state to initialize the component with.
 * @param {HTMLElement|null} [options.container=null] - The container DOM element to mount the component into. If not provided, a default div will be created.
 * @returns {Object} - An object containing the instance of the mounted component, the container DOM element, and an `unmount` function to clean up.
 * @throws {Error} - Throws an error if there is no DOM environment available or the container cannot be created.
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
 * Renders the provided HTML string to a newly created DOM container element.
 *
 * This function is designed to create and manage a container element in a DOM environment,
 * rendering the given HTML content within it. An error will be thrown if called in a non-DOM environment.
 *
 * @param {string} [html=''] - The HTML string to be rendered inside the container. Defaults to an empty string.
 * @returns {{ container: HTMLElement, unmount: Function }} An object containing:
 *   - `container`: The DOM element that contains the rendered HTML.
 *   - `unmount`: A function to remove the container element from the DOM and clean it up.
 * @throws {Error} Throws an error if called in an environment without a `document` object.
 */
export const render = (html = '') => {
  if (typeof document === 'undefined') throw new Error('render requires a DOM environment');
  const container = document.createElement('div');
  container.innerHTML = html;
  const unmount = () => { if (container.parentNode) container.parentNode.removeChild(container); container.innerHTML = ''; };
  return { container, unmount };
};

/**
 * Dispatches a DOM event of the specified type on a given target element.
 *
 * @param {EventTarget} target - The target element on which the event is dispatched.
 * @param {string} type - The type of the event to trigger (e.g., 'click', 'keydown', 'input').
 * @param {Object} [init={}] - Optional initialization object that contains properties
 * for constructing the event, such as `bubbles`, `cancelable`, and additional event-specific settings.
 * @returns {boolean} - A boolean value indicating whether the event was successfully dispatched.
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
 * Delays the execution of a function or operation by the specified number of milliseconds.
 *
 * @param {number} [ms=0] - The number of milliseconds to wait before resolving the Promise. Defaults to 0 if not provided.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
/**
 * A function that returns a promise which resolves immediately.
 *
 * This function can be used as a utility to simulate or wait
 * for the next microtask in the JavaScript event loop, effectively
 * deferring execution to the next tick.
 *
 * @function
 * @returns {Promise<void>} A promise that resolves without any value.
 */
export const tick = () => Promise.resolve();

/**
 * Waits for a predicate function to return a truthy value within a specified timeout period.
 *
 * @param {Function} predicate - The function that needs to return a truthy value to resolve the promise.
 * @param {Object} [options] - An optional configuration object.
 * @param {number} [options.timeout=1000] - The maximum amount of time, in milliseconds, to wait before rejecting the promise.
 * @param {number} [options.interval=10] - The time, in milliseconds, between successive checks of the predicate function.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the predicate is satisfied within the timeout, or rejects with an error if the timeout is reached.
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
 * Executes a function or value and ensures that asynchronous operations are flushed.
 *
 * This function accepts either a synchronous value or an asynchronous function.
 * If the input is a function, it is invoked. If the function or value produces a promise,
 * the promise is awaited. The function also facilitates ensuring that all microtasks
 * and at least one macrotask are processed before completion.
 *
 * @param {Function|any} run - A function to execute or a value to process.
 * If it's a function, it will be called. If it returns a promise or is an async function,
 * the promise will be awaited.
 * @returns {Promise<any>} A promise that resolves to the result of the execution
 * or the provided value once asynchronous operations are flushed.
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
 * Finds and returns the first element within a specified container that matches the given `data-testid` attribute.
 *
 * @param {HTMLElement} container - The parent container element to search within.
 * @param {string} testId - The value of the `data-testid` attribute to search for.
 * @returns {HTMLElement | null} The first matching element with the specified `data-testid` value, or null if no match is found.
 */
export const getByTestId = (container, testId) => {
  if (!container || !testId) return null;
  const esc = (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') ? CSS.escape : (s) => s;
  return container.querySelector(`[data-testid="${esc(testId)}"]`);
};

/**
 * Retrieves all elements within a specified container that match the given `data-testid` attribute.
 *
 * @function
 * @param {HTMLElement} container - The container element to search within.
 * @param {string} testId - The value of the `data-testid` attribute to match elements.
 * @returns {HTMLElement[]} An array of elements matching the specified `data-testid` attribute. Returns an empty array if `container` or `testId` is not provided.
 */
export const getAllByTestId = (container, testId) => {
  if (!container || !testId) return [];
  const esc = (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') ? CSS.escape : (s) => s;
  return Array.from(container.querySelectorAll(`[data-testid="${esc(testId)}"]`));
};

export default { mount, render, fire, wait, tick, waitFor, act, getByTestId, getAllByTestId };
