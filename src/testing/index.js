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

export const getByTestId = (container, testId) => {
  if (!container || !testId) return null;
  return container.querySelector(`[data-testid="${CSS.escape ? CSS.escape(testId) : testId}"]`);
};

export const getAllByTestId = (container, testId) => {
  if (!container || !testId) return [];
  return Array.from(container.querySelectorAll(`[data-testid="${CSS.escape ? CSS.escape(testId) : testId}"]`));
};

export default { mount, render, fire, wait, tick, getByTestId, getAllByTestId };
