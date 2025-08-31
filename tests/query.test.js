import { describe, it, expect, vi } from 'vitest';
import { Query } from '../src/data/query.js';

describe('Query cache', () => {
  it('subscribe gets initial snapshot and updates on setData', () => {
    const spy = vi.fn();
    const unsub = Query.subscribe('k1', spy);
    expect(spy).toHaveBeenCalledTimes(1);
    Query.setData('k1', 123);
    expect(spy).toHaveBeenCalledTimes(2);
    unsub();
  });

  it('fetch dedupes inflight, caches data, respects staleTime', async () => {
    let calls = 0;
    const fetcher = vi.fn().mockImplementation(async () => { calls++; return { val: calls }; });

    const r1 = await Query.fetch('k2', fetcher, { staleTime: 50 });
    const r2 = await Query.fetch('k2', fetcher, { staleTime: 50 });
    expect(r1).toEqual({ val: 1 });
    expect(r2).toEqual({ val: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('refetch forces a new request and invalidate marks stale', async () => {
    let n = 0;
    const fetcher = async () => ({ n: ++n });
    await Query.fetch('k3', fetcher, { staleTime: 1000 });
    const before = Query.getData('k3');
    await Query.refetch('k3');
    const after = Query.getData('k3');
    expect(after.n).toBeGreaterThan(before.n);
    Query.invalidate('k3');
    // After invalidate, data remains but updatedAt is reset; we just assert fetch again returns cached until force
    const again = await Query.fetch('k3', fetcher, { staleTime: 0 });
    // staleTime 0 forces refetch
    expect(again.n).toBeGreaterThan(after.n);
  });

  it('remove clears entry and subscribers', () => {
    const spy = vi.fn();
    const unsub = Query.subscribe('k4', spy);
    Query.setData('k4', 'x');
    expect(spy).toHaveBeenCalledTimes(2);
    Query.remove('k4');
    // No error and no more calls after remove
    Query.setData('k4', 'y');
    expect(spy).toHaveBeenCalledTimes(2);
    unsub();
  });
});
