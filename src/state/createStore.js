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
