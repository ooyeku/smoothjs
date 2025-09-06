/**
 * A utility function to create a predictable and lightweight state management store.
 *
 * This store allows you to manage state through a public API, enabling state updates,
 * state replacement, resetting to the initial state, subscribing to state changes,
 * and selecting specific state slices with custom equality checks.
 *
 * @param {Object} [initialState={}] - An optional object representing the initial state of the store.
 * @returns {Object} An API object with the following methods:
 * - `getState`: Returns the current state as an object copy.
 * - `setState`: Updates the state with a partial object or a function that returns a partial state.
 * - `replaceState`: Completely replaces the state with a new object.
 * - `reset`: Resets the state to the initial state.
 * - `subscribe`: Registers a listener function that will be invoked on state changes. Returns an unsubscribe function.
 * - `select`: Subscribes to a selected part of the state with an optional custom equality function and change callback.
 */
export const createStore = (initialState = {}) => {
  let state = { ...initialState };
  const listeners = new Set();
  let scheduled = false;

  const notify = () => {
    scheduled = false;
    const snapshot = { ...state };
    // Copy to array to avoid mutation during iteration
    Array.from(listeners).forEach((l) => {
      try { l(snapshot); } catch (e) { console.error('Store listener error:', e); }
    });
  };

  const scheduleNotify = () => {
    if (!scheduled) {
      scheduled = true;
      Promise.resolve().then(notify);
    }
  };

  const shallowEqual = (a, b) => {
    if (Object.is(a, b)) return true;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      for (let k of aKeys) { if (!Object.prototype.hasOwnProperty.call(b, k) || !Object.is(a[k], b[k])) return false; }
      return true;
    }
    return false;
  };

  const api = {
    getState: () => ({ ...state }),

    setState: (update) => {
      const patch = typeof update === 'function' ? update({ ...state }) : update;
      if (!patch || typeof patch !== 'object') return;
      state = { ...state, ...patch };
      scheduleNotify();
    },

    replaceState: (nextState) => {
      state = { ...(typeof nextState === 'object' && nextState ? nextState : {}) };
      scheduleNotify();
    },

    reset: () => {
      state = { ...initialState };
      scheduleNotify();
    },

    subscribe: (listener) => {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    select: (selector, onChange, isEqual = Object.is) => {
      if (typeof selector !== 'function') return () => {};
      let selected = selector(state);
      const eq = isEqual === 'shallow' ? shallowEqual : (typeof isEqual === 'function' ? isEqual : Object.is);
      const listener = () => {
        const next = selector(state);
        if (!eq(next, selected)) {
          selected = next;
          if (typeof onChange === 'function') {
            try { onChange(selected); } catch (e) { console.error('select listener error:', e); }
          }
        }
      };
      const unsub = api.subscribe(listener);
      // Initial callback if provided
      if (typeof onChange === 'function') {
        try { onChange(selected); } catch (e) { console.error('select initial callback error:', e); }
      }
      return () => unsub();
    }
  };

  return api;
};

/**
 * Creates a memoized selector function that computes a derived state.
 * The output of the selector function is cached, and the cache is utilized
 * when the input-derived state has not changed, improving performance.
 *
 * @param {...Function} funcs - A list of functions where all except the last one
 *                              are input-selectors, and the last one is a result function.
 *                              Each input-selector extracts a portion of the state.
 *                              The result function computes the derived state from
 *                              the combined results of the input-selectors.
 * @returns {Function} A memoized selector function that takes the state and optional
 *                     additional arguments and computes or retrieves the derived state.
 */
export const createSelector = (...funcs) => {
  const resultFunc = funcs.pop();
  const inputSelectors = funcs;
  let lastArgs = null;
  let lastResult;
  return (state, ...rest) => {
    const values = inputSelectors.map(fn => fn(state, ...rest));
    if (lastArgs && values.length === lastArgs.length && values.every((v, i) => Object.is(v, lastArgs[i]))) {
      return lastResult;
    }
    lastArgs = values;
    lastResult = resultFunc(...values);
    return lastResult;
  };
};
