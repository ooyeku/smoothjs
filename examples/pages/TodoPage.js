import { defineComponent } from '../../index.js';

// Rebuilt Todo Page (simple, robust, no dependencies)
export const TodoPage = defineComponent((ctx) => {
  const { html, useState, useEffect, on } = ctx;

  // State
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | done
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smoothjs-todos') || '[]'); } catch { return []; }
  });

  // Persist on changes
  useEffect(() => {
    try { localStorage.setItem('smoothjs-todos', JSON.stringify(items)); } catch {}
  }, [items]);

  // Helpers
  const keyFromEvent = (e) => {
    if (!e || typeof e !== 'object') return '';
    // Prefer e.key, but accessing it can throw in some delegated/wrapped events
    try {
      if (typeof e.key === 'string') return e.key;
    } catch {}
    // Fallback to numeric codes; access guarded by try/catch to avoid WebIDL getter errors
    try {
      const code = (typeof e.which === 'number') ? e.which : (typeof e.keyCode === 'number' ? e.keyCode : null);
      if (code === 13) return 'Enter';
      if (code === 32) return ' ';
    } catch {}
    return '';
  };

  // Actions
  const add = () => {
    const t = String(text || '').trim();
    if (!t) return;
    setItems(list => [...list, { id: String(Date.now()), title: t, done: false }]);
    setText('');
  };
  const toggle = (id) => setItems(list => list.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id) => setItems(list => list.filter(i => i.id !== id));
  const clearDone = () => setItems(list => list.filter(i => !i.done));

  // Events
  on('input', '#new', (e) => {
    const v = (e && e.currentTarget && typeof e.currentTarget.value === 'string') ? e.currentTarget.value : (e && e.target && typeof e.target.value === 'string' ? e.target.value : '');
    setText(v);
  });
  on('keydown', '#new', (e) => { if (keyFromEvent(e) === 'Enter') { if (e && e.preventDefault) e.preventDefault(); add(); } });
  on('click', '#add', add);
  on('click', '.toggle', (e) => {
    const id = (e && e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute('data-id') : (e && e.target && e.target.getAttribute ? e.target.getAttribute('data-id') : null);
    if (id) toggle(id);
  });
  on('click', '.remove', (e) => {
    const id = (e && e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute('data-id') : (e && e.target && e.target.getAttribute ? e.target.getAttribute('data-id') : null);
    if (id) remove(id);
  });
  on('click', '.filter', (e) => {
    const val = (e && e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute('data-filter') : (e && e.target && e.target.getAttribute ? e.target.getAttribute('data-filter') : null);
    if (val) setFilter(val);
  });
  on('click', '#clearDone', clearDone);

  const filtered = items.filter(i => filter === 'all' ? true : (filter === 'active' ? !i.done : i.done));
  const total = items.length;
  const active = items.filter(i => !i.done).length;
  const done = total - active;

  const appStyle = 'max-width: 720px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; box-shadow: 0 8px 18px rgba(0,0,0,.06)';
  const row = 'display:flex; gap:.5rem; align-items:center;';
  const inputCls = 'flex:1; padding:.6rem .75rem; border:1px solid var(--border); border-radius:8px; font-size:14px; background: var(--card); color: inherit;';
  const btnPrimary = 'padding:.55rem .8rem; border-radius:8px; background: var(--primary); color:#fff; border:1px solid var(--primary); cursor:pointer;';
  const btnSecondary = 'padding:.55rem .8rem; border-radius:8px; background: transparent; color: var(--primary); border:1px solid var(--primary); cursor:pointer;';

  const render = () => html`
    <div style="${appStyle}">
      <h1 style="margin-top:0;">Todo</h1>
      <div style="${row}">
        <input id="new" type="text" style="${inputCls}" placeholder="What needs doing?" value="${text}">
        <button id="add" style="${btnPrimary}" type="button">Add</button>
      </div>

      <ul style="list-style:none; padding:0; margin:.75rem 0 0;">
        ${filtered.length === 0 ? `<div style='color: var(--muted); padding:.5rem;'>No items</div>` : ''}
        ${filtered.map(i => `
          <li style="display:flex; align-items:center; gap:.5rem; padding:.5rem .25rem; border-bottom:1px dashed var(--border);" data-key="${i.id}">
            <input class="toggle" type="checkbox" data-id="${i.id}" ${i.done ? 'checked' : ''}>
            <span class="todo" style="flex:1; text-decoration:${i.done ? 'line-through' : 'none'}">${i.title}</span>
            <button class="remove" style="${btnSecondary}" data-id="${i.id}" type="button">Delete</button>
          </li>
        `).join('')}
      </ul>

      <div style="display:flex; gap:.5rem; margin-top:.75rem;">
        <button class="filter" style="${btnSecondary}; ${filter==='all' ? 'background: var(--primary); color:#fff; border-color: var(--primary);' : ''}" data-filter="all" type="button">All (${total})</button>
        <button class="filter" style="${btnSecondary}; ${filter==='active' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : ''}" data-filter="active" type="button">Active (${active})</button>
        <button class="filter" style="${btnSecondary}; ${filter==='done' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : ''}" data-filter="done" type="button">Done (${done})</button>
        <button id="clearDone" style="${btnSecondary}" type="button" ${done ? '' : 'disabled'}>Clear done</button>
      </div>
    </div>
  `;

  return { render };
});
