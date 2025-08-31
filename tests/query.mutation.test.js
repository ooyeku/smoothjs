import { describe, it, expect, vi } from 'vitest';
import { Query } from '../src/data/query.js';

describe('Query mutations and tags', () => {
  it('optimistic update rolls back on error', async () => {
    Query.setData('opt', 1);
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(Query.mutate('opt', fn, { optimisticData: 2, rollbackOnError: true })).rejects.toThrow('fail');
    expect(Query.getData('opt')).toBe(1);
  });

  it('optimistic update persists on success and invalidation happens', async () => {
    Query.setData('todos', [{ id: 1, title: 'a' }]);
    const server = vi.fn().mockResolvedValue([{ id: 1, title: 'a' }, { id: 2, title: 'b' }]);
    const result = await Query.mutate('todos', server, {
      optimisticData: (prev) => (prev || []).concat({ id: 2, title: 'b' }),
      invalidateKeys: ['todos-list'],
      invalidateTags: ['todos']
    });
    expect(result.length).toBe(2);
    expect(Query.getData('todos').length).toBe(2);
  });

  it('invalidateTag marks tagged entries stale and SWR revalidates in background', async () => {
    const fetcher = vi.fn().mockResolvedValue({ v: Math.random() });
    await Query.fetch('k-tag', fetcher, { staleTime: 1000, tags: ['group1'] });
    expect(fetcher).toHaveBeenCalledTimes(1);
    Query.invalidateTag('group1');
    // With staleTime, next fetch should refetch
    await Query.fetch('k-tag', fetcher, { staleTime: 1000 });
    expect(fetcher).toHaveBeenCalledTimes(2);

    // SWR should trigger background revalidation when stale
    const f2 = vi.fn().mockResolvedValue({ v: Math.random() });
    await Query.fetch('k-swr', f2, { staleTime: 0 }); // always stale
    expect(f2).toHaveBeenCalledTimes(1);
    const val = await Query.fetch('k-swr', f2, { staleTime: 0, swr: true });
    expect(val).toBeDefined();
    // Revalidation should have been scheduled
    await Promise.resolve();
    expect(f2).toHaveBeenCalledTimes(2);
  });
});
