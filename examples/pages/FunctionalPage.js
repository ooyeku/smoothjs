import { defineComponent, http, Query } from '../../index.js';

const FunctionalPage = defineComponent(({ useState, useEffect, useQuery, html, on }) => {
  // Functional Counter demo
  const [count, setCount] = useState(0);
  on('click', '#fc-inc', () => setCount(v => v + 1));
  on('click', '#fc-dec', () => setCount(v => v - 1));

  // Functional Form demo (simple email input with local validation)
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  on('input', '#fc-email', (e) => {
    const v = e.target.value || '';
    setEmail(v);
    setEmailErr(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || v === '' ? '' : 'Invalid email');
  });

  // Functional Query demo
  const fetcher = () => http.withBase('/examples', { timeout: 2000 }).get('/data.json');
  const [data, q] = useQuery('functional-demo', fetcher, { staleTime: 30000, cacheTime: 300000, swr: true, tags: ['demo'] });
  on('click', '#fc-refetch', () => { try { q.refetch(); } catch {} });
  on('click', '#fc-invalidate-tag', () => { try { q.invalidateTag('demo'); } catch {} });

  const render = () => html`
    <div style="display: grid; gap: 1rem;">
      <div class="card">
        <h2 style="margin:0 0 .5rem 0;">Functional Counter</h2>
        <div class="row" style="gap:.75rem;">
          <button id="fc-dec" class="btn" type="button">-</button>
          <div style="min-width: 120px; text-align:center; font-size: 2rem; font-weight: 700;">${count}</div>
          <button id="fc-inc" class="btn" type="button">+</button>
        </div>
      </div>

      <div class="card">
        <h2 style="margin:0 0 .5rem 0;">Functional Form</h2>
        <div class="row" style="gap:.75rem;">
          <input id="fc-email" class="input" type="email" placeholder="email@example.com" value="${email}">
        </div>
        ${emailErr ? html`<div class="error" style="color:#ef4444; font-size:.875rem; margin-top:.5rem;">${emailErr}</div>` : ''}
        <div class="muted" style="font-size:.875rem; margin-top:.5rem;">Value: ${email || '(empty)'}${emailErr ? '' : ' ✓'}</div>
      </div>

      <div class="card">
        <h2 style="margin:0 0 .5rem 0;">Functional Query (useQuery)</h2>
        <div class="row" style="gap:.5rem;">
          <button id="fc-refetch" class="btn" type="button">Refetch</button>
          <button id="fc-invalidate-tag" class="btn" type="button" style="background:transparent; color:var(--muted); border:1px dashed var(--border);">Invalidate Tag "demo"</button>
        </div>
        <div style="margin-top:.75rem;">
          ${q.error ? html`<div class="error" style="color:#ef4444;">${String(q.error)}</div>` : ''}
          ${data ? html`<pre style="margin:0; padding: .75rem; background:#0f172a; color:#e2e8f0; border-radius:8px; overflow:auto;">${JSON.stringify(data, null, 2)}</pre>` : html`<div class="muted">Loading or no data yet…</div>`}
        </div>
      </div>
    </div>
  `;

  return { render };
});

export { FunctionalPage };
