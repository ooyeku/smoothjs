// Minimal query/cache layer for SmoothJS
// Features: request deduping, caching, subscribers, invalidate, refetch, staleTime

const now = () => Date.now();

class QueryClientImpl {
  constructor() {
    this.store = new Map(); // key -> { data, error, updatedAt, subscribers:Set, inflight:Promise|null, fetcher:Function|null, staleTime:number }
  }

  _entry(key) {
    let e = this.store.get(key);
    if (!e) {
      e = { data: undefined, error: null, updatedAt: 0, subscribers: new Set(), inflight: null, fetcher: null, staleTime: 0 };
      this.store.set(key, e);
    }
    return e;
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

  async fetch(key, fetcher, { staleTime = 0, force = false } = {}) {
    const e = this._entry(key);
    if (fetcher && typeof fetcher === 'function') e.fetcher = fetcher;
    if (!e.fetcher) throw new Error(`No fetcher provided for query: ${key}`);
    e.staleTime = typeof staleTime === 'number' ? staleTime : 0;

    const fresh = e.updatedAt && (now() - e.updatedAt) <= e.staleTime;
    if (!force && fresh && e.data !== undefined) {
      return e.data;
    }

    if (e.inflight) return e.inflight;

    e.inflight = Promise.resolve()
      .then(() => e.fetcher())
      .then((data) => {
        e.inflight = null;
        e.data = data;
        e.error = null;
        e.updatedAt = now();
        this._emit(key);
        return data;
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
      e.subscribers.clear();
      this.store.delete(key);
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
