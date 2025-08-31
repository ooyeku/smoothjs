// Lightweight testing utilities for SmoothJS
// No external dependencies; designed to work in JSDOM or a browser.

export const mount = (ComponentClass, { props = {}, state = null, container = null } = {}) => {
  const root = container || (typeof document !== 'undefined' ? document.createElement('div') : null);
  if (!root) throw new Error('mount requires a DOM environment');
  const instance = new ComponentClass(null, state || undefined, props || {});
  instance.mount(root, { props });
  const unmount = () => { try { instance.unmount && instance.unmount(); } catch {} if (root.parentNode) root.parentNode.removeChild(root); };
  return { instance, container: root, unmount };
};

export const render = (html = '') => {
  if (typeof document === 'undefined') throw new Error('render requires a DOM environment');
  const container = document.createElement('div');
  container.innerHTML = html;
  const unmount = () => { if (container.parentNode) container.parentNode.removeChild(container); container.innerHTML = ''; };
  return { container, unmount };
};

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

export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
export const tick = () => Promise.resolve();

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

export const getByTestId = (container, testId) => {
  if (!container || !testId) return null;
  const esc = (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') ? CSS.escape : (s) => s;
  return container.querySelector(`[data-testid="${esc(testId)}"]`);
};

export const getAllByTestId = (container, testId) => {
  if (!container || !testId) return [];
  const esc = (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') ? CSS.escape : (s) => s;
  return Array.from(container.querySelectorAll(`[data-testid="${esc(testId)}"]`));
};

export default { mount, render, fire, wait, tick, waitFor, act, getByTestId, getAllByTestId };
