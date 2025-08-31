// Minimal query/cache layer for SmoothJS
// Features: request deduping, caching, subscribers, invalidate, refetch, staleTime

const now = () => Date.now();

class QueryClientImpl {
  constructor() {
    this.store = new Map(); // key -> { data, error, updatedAt, subscribers:Set, inflight:Promise|null, fetcher:Function|null, staleTime:number, tags:Set<string>, cacheTime:number, gcTimer:any, refetchOnWindowFocus:boolean, refetchOnReconnect:boolean }
    this._bound = false;
    if (typeof window !== 'undefined' && !this._bound) {
      const focus = () => {
        this.store.forEach((e, key) => {
          if (e.refetchOnWindowFocus && this._isStale(e) && !e.inflight) {
            try { this.refetch(key); } catch {}
          }
        });
      };
      const online = () => {
        this.store.forEach((e, key) => {
          if (e.refetchOnReconnect && this._isStale(e) && !e.inflight) {
            try { this.refetch(key); } catch {}
          }
        });
      };
      try { window.addEventListener('focus', focus); } catch {}
      try { window.addEventListener('online', online); } catch {}
      this._bound = true;
    }
  }

  _entry(key) {
    let e = this.store.get(key);
    if (!e) {
      e = { data: undefined, error: null, updatedAt: 0, subscribers: new Set(), inflight: null, fetcher: null, staleTime: 0, tags: new Set(), cacheTime: 0, gcTimer: null, refetchOnWindowFocus: false, refetchOnReconnect: false };
      this.store.set(key, e);
    }
    return e;
  }

  _isStale(e) {
    if (!e) return true;
    if (!e.updatedAt) return true;
    return (now() - e.updatedAt) > (e.staleTime || 0);
  }

  _scheduleGC(key, e) {
    if (!e) e = this.store.get(key);
    if (!e) return;
    if (e.gcTimer) { try { clearTimeout(e.gcTimer); } catch {} e.gcTimer = null; }
    if (!e.cacheTime || e.cacheTime <= 0) return;
    // schedule only if there are no subscribers
    if (e.subscribers && e.subscribers.size > 0) return;
    try {
      e.gcTimer = setTimeout(() => {
        // remove only if still no subscribers
        const cur = this.store.get(key);
        if (cur && cur.subscribers.size === 0) {
          this.store.delete(key);
        }
      }, e.cacheTime);
    } catch {}
  }

  getData(key) {
    const e = this.store.get(key);
    return e ? e.data : undefined;
  }

  setData(key, updater) {
    const e = this._entry(key);
    e.data = typeof updater === 'function' ? updater(e.data) : updater;
    e.error = null;
    e.updatedAt = now();
    this._emit(key);
    return e.data;
  }

  subscribe(key, listener) {
    const e = this._entry(key);
    if (typeof listener !== 'function') return () => {};
    e.subscribers.add(listener);
    // emit current snapshot
    try { listener({ data: e.data, error: e.error, updatedAt: e.updatedAt }); } catch {}
    return () => {
      e.subscribers.delete(listener);
    };
  }

  async fetch(key, fetcher, { staleTime = 0, force = false, cacheTime = 0, tags = [], swr = false, refetchOnWindowFocus = false, refetchOnReconnect = false } = {}) {
    const e = this._entry(key);
    if (fetcher && typeof fetcher === 'function') e.fetcher = fetcher;
    if (!e.fetcher) throw new Error(`No fetcher provided for query: ${key}`);
    e.staleTime = typeof staleTime === 'number' ? staleTime : 0;
    e.cacheTime = typeof cacheTime === 'number' ? cacheTime : 0;
    e.refetchOnWindowFocus = !!refetchOnWindowFocus;
    e.refetchOnReconnect = !!refetchOnReconnect;
    if (Array.isArray(tags)) {
      e.tags = new Set(tags.map(String));
    }

    const fresh = e.updatedAt && (now() - e.updatedAt) < e.staleTime;

    if (swr && e.data !== undefined && !force) {
      // Return cached value immediately and revalidate in background if stale
      if (!fresh && !e.inflight) {
        this.refetch(key).catch(() => {});
      }
      this._scheduleGC(key, e);
      return e.data;
    }

    if (!force && fresh && e.data !== undefined) {
      this._scheduleGC(key, e);
      return e.data;
    }

    if (e.inflight) return e.inflight;

    const startedAt = now();
    e.inflight = Promise.resolve(e.fetcher())
      .then((data) => {
        e.inflight = null;
        // Only apply result if no newer update happened after this fetch started
        if (!e.updatedAt || e.updatedAt <= startedAt) {
          e.data = data;
          e.error = null;
          e.updatedAt = now();
          this._emit(key);
        }
        this._scheduleGC(key, e);
        return e.data;
      })
      .catch((err) => {
        e.inflight = null;
        e.error = err;
        this._emit(key);
        throw err;
      });

    return e.inflight;
  }

  async refetch(key) {
    const e = this._entry(key);
    if (!e.fetcher) throw new Error(`No fetcher to refetch: ${key}`);
    return this.fetch(key, e.fetcher, { force: true, staleTime: e.staleTime });
  }

  invalidate(key) {
    const e = this._entry(key);
    e.updatedAt = 0; // mark stale
    this._emit(key);
  }

  remove(key) {
    const e = this.store.get(key);
    if (e) {
      if (e.gcTimer) { try { clearTimeout(e.gcTimer); } catch {} e.gcTimer = null; }
      e.subscribers.clear();
      this.store.delete(key);
    }
  }

  invalidateTag(tag) {
    const t = String(tag);
    this.store.forEach((e, key) => {
      if (e.tags && e.tags.has(t)) {
        e.updatedAt = 0;
        this._emit(key);
      }
    });
  }

  async mutate(key, mutationFn, { optimisticData, rollbackOnError = true, invalidateKeys = [], invalidateTags = [] } = {}) {
    const k = String(key);
    const e = this._entry(k);
    const prev = e.data;
    let appliedOptimistic = false;
    try {
      if (typeof optimisticData !== 'undefined') {
        e.data = typeof optimisticData === 'function' ? optimisticData(e.data) : optimisticData;
        e.error = null;
        e.updatedAt = now();
        this._emit(k);
        appliedOptimistic = true;
      }
      const result = await mutationFn();
      if (typeof result !== 'undefined') {
        e.data = result;
        e.error = null;
        e.updatedAt = now();
        this._emit(k);
      }
      // Invalidate targets
      for (const kk of invalidateKeys) { this.invalidate(String(kk)); }
      for (const tg of invalidateTags) { this.invalidateTag(String(tg)); }
      return e.data;
    } catch (err) {
      if (rollbackOnError && appliedOptimistic) {
        e.data = prev;
        e.error = err;
        e.updatedAt = now();
        this._emit(k);
      } else {
        e.error = err;
        this._emit(k);
      }
      throw err;
    }
  }

  _emit(key) {
    const e = this.store.get(key);
    if (!e) return;
    const snapshot = { data: e.data, error: e.error, updatedAt: e.updatedAt };
    Array.from(e.subscribers).forEach((fn) => { try { fn(snapshot); } catch {} });
  }
}

export const Query = new QueryClientImpl();
export default Query;
