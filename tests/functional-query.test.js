import { defineComponent, Query, Testing } from '../index.js';

describe('Functional useQuery adapter', () => {
  let host;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    // Ensure clean slate
    try { Query.remove('t-key'); } catch {}
  });

  afterEach(() => {
    if (host && host.parentNode) host.parentNode.removeChild(host);
    try { Query.remove('t-key'); } catch {}
  });

  it('subscribes to Query and updates UI when data changes', async () => {
    const Comp = defineComponent(({ useQuery, html }) => {
      const [data, q] = useQuery('t-key', () => Promise.resolve({ n: 1 }), { tags: ['t'], staleTime: 0, swr: false });
      const render = () => html`<div data-testid="val">${data && data.n !== undefined ? data.n : (data && data.__raw__ ? JSON.stringify(data.__raw__) : 'empty')}</div>`;
      return { render };
    });

    const c = new Comp();
    c.mount(host);

    // Ensure mount/render cycle completed
    await Promise.resolve();

    // Push new data through Query and expect UI to update via subscription
    Query.setData('t-key', { n: 2 });

    await Testing.waitFor(() => {
      const el = host.querySelector('[data-testid="val"]');
      return !!el && el.textContent === '2';
    });

    // Invalidate tag should not change data but should not throw
    expect(() => Query.invalidateTag('t')).not.toThrow();
  });
});
