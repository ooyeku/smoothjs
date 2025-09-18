import { defineComponentVDOM } from '../../src/vdom/defineComponentVDOM.js';
import { Query } from '../../index.js';

// Mutations Demo Page showing optimistic updates + rollback and tag invalidation (functional)
export const MutationsPage = defineComponentVDOM(({ html, on, useState }) => {
  const [todosKey] = useState('todos');
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  on('input', '#newTitle', (e) => setInput(e.target.value));
  on('click', '#add', async () => {
    const title = String(input || '').trim();
    if (!title) return;
    const id = Date.now();

    const serverCreate = async () => {
      await new Promise(r => setTimeout(r, 150));
      if (Math.random() < 0.2) throw new Error('Network error');
      const prev = Query.getData(todosKey) || [];
      return prev.map(x => x).concat({ id, title });
    };

    setError(null); setInput('');
    try {
      await Query.mutate(todosKey, serverCreate, {
        optimisticData: (prev) => (prev || []).concat({ id, title }),
        rollbackOnError: true,
        invalidateTags: ['todos']
      });
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  });
  on('click', '#reset', () => { Query.setData(todosKey, [ { id: 1, title: 'Learn SmoothJS' } ]); setInput(''); setError(null); });

  // Seed initial data if absent
  Promise.resolve().then(() => { if (!Query.getData(todosKey)) Query.setData(todosKey, [ { id: 1, title: 'Learn SmoothJS' } ]); });

  const render = () => {
    const todos = Query.getData(todosKey) || [];
    return html`
      <div style="max-width:768px; margin:0 auto; padding: 0.75rem 1rem;">
        <div style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .75rem 0;">Query Mutations (Optimistic)</h2>
          <div class="row" style="display:flex; gap:.5rem; align-items:center; margin-bottom:.75rem;">
            <input id="newTitle" class="input" placeholder="New todo title" value="${input}">
            <button id="add" class="btn" type="button">Add</button>
            <button id="reset" class="btn" type="button">Reset</button>
          </div>
          ${error ? html`<div class="notice" style="margin-bottom:.75rem; color:#dc2626;">${error}</div>` : ''}
          <ul class="list">
            ${todos.map(t => html`<li data-key="${t.id}">${t.title}</li>`).join('')}
          </ul>
          <div class="muted" style="font-size:.875rem; margin-top:.5rem;">Tag invalidation: <code>todos</code></div>
        </div>
      </div>
    `;
  };

  return { render };
});
