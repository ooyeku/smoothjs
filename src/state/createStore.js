/**
 * Creates a state management store with reactive capabilities.
 *
 * @param {Object} [initialState={}] - The initial state of the store. Defaults to an empty object.
 * @returns {Object} A store object with the following methods:
 *
 * - `getState`: Returns a shallow copy of the current store state.
 * - `setState`: Merges an updated state into the store. Accepts either a partial state object
 *   or a function that takes the current state and returns the updated state. Triggers notification to listeners if state changes.
 * - `replaceState`: Replaces the store's current state with the provided state object, overriding the entire state.
 *   Triggers notification to listeners.
 * - `reset`: Resets the store's state to the initial state provided during creation. Triggers notification to listeners.
 * - `subscribe`: Registers a listener function that gets called whenever the state changes. Returns an unsubscribe function to remove the listener.
 * - `select`: Creates a derived state management mechanism. Takes a selector function and an optional callback
 *   to be notified of derived state changes. Optionally accepts a comparison function (e.g. Object.is, shallow equality).
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
 * Creates a memoized selector function.
 *
 * This function is used to efficiently compute derived data based on input selectors and a result function.
 * It ensures that the computation is only performed when the input selectors' outputs have changed, allowing for performance optimization in applications such as state management.
 *
 * @param {...Function} funcs - A series of input selector functions followed by a result function.
 *                              The input selectors take in the application state and optional arguments
 *                              and compute intermediate values. The result function takes the outputs
 *                              of the input selectors to compute the final memoized result.
 * @returns {Function} A memoized selector function. This function takes the application state and
 *                     any additional arguments, computes the input selectors' outputs, and runs the
 *                     result function only when the inputs have changed (using `Object.is` comparison).
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
