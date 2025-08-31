import { describe, it, expect, vi } from 'vitest';
import { createStore, createSelector } from '../src/state/createStore.js';

const tick = () => Promise.resolve();

describe('state/createStore', () => {
  it('getState, setState and replaceState work', async () => {
    const store = createStore({ a: 1, b: 2 });
    expect(store.getState()).toEqual({ a: 1, b: 2 });
    store.setState({ a: 2 });
    await tick();
    expect(store.getState()).toEqual({ a: 2, b: 2 });
    store.replaceState({ c: 3 });
    await tick();
    expect(store.getState()).toEqual({ c: 3 });
  });

  it('reset goes back to initial state', async () => {
    const store = createStore({ a: 1 });
    store.setState({ a: 5 });
    await tick();
    expect(store.getState().a).toBe(5);
    store.reset();
    await tick();
    expect(store.getState().a).toBe(1);
  });

  it('subscribe is microtask-batched', async () => {
    const store = createStore({ n: 0 });
    const fn = vi.fn();
    store.subscribe(fn);
    store.setState({ n: 1 });
    store.setState({ n: 2 });
    expect(fn).toHaveBeenCalledTimes(0);
    await tick();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(store.getState().n).toBe(2);
  });

  it('select uses memoization and custom equality', async () => {
    const store = createStore({ obj: { x: 1, y: 2 } });
    const onChange = vi.fn();
    const unsub = store.select(s => s.obj, onChange, 'shallow');
    // initial call triggers once
    expect(onChange).toHaveBeenCalledTimes(1);
    onChange.mockClear();
    // update with same shallow props
    store.setState({ obj: { x: 1, y: 2 } });
    await tick();
    expect(onChange).not.toHaveBeenCalled();
    // update with change
    store.setState({ obj: { x: 2, y: 2 } });
    await tick();
    expect(onChange).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('createSelector memoizes inputs', () => {
    const selector = createSelector(
      (s) => s.a,
      (s) => s.b,
      (a, b) => a + b
    );
    const state = { a: 1, b: 2 };
    const r1 = selector(state);
    const r2 = selector({ a: 1, b: 2 });
    expect(r2).toBe(r1);
    const r3 = selector({ a: 2, b: 2 });
    expect(r3).toBe(4);
  });
});
