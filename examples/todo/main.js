import { defineComponent, Velvet } from '../../index.js';

// A simple Todo App using functional components and SmoothJS hooks
export const TodoApp = defineComponent((ctx) => {
  const { html, useState, on, portal } = ctx;
  const { vs } = Velvet.useVelvet(ctx);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | done
  const [items, setItems] = useState([
    { id: '1', title: 'Read docs', done: false },
    { id: '2', title: 'Build something', done: true },
  ]);

  const add = () => {
    const t = String(text || '').trim();
    if (!t) return;
    const item = { id: String(Date.now()), title: t, done: false };
    setItems(list => [...list, item]);
    setText('');
  };

  const toggle = (id) => setItems(list => list.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id) => setItems(list => list.filter(i => i.id !== id));
  const clearDone = () => setItems(list => list.filter(i => !i.done));

  on('click', '#add', add);
  on('click', '.toggle', (e) => toggle(e.currentTarget.getAttribute('data-id')));
  on('click', '.remove', (e) => remove(e.currentTarget.getAttribute('data-id')));
  on('click', '#clearDone', clearDone);
  on('click', '.filter', (e) => setFilter(e.currentTarget.getAttribute('data-filter')));
  on('input', '#new', (e) => setText(e.currentTarget.value));
  on('keydown', '#new', (e) => {
    const key = (e && typeof e === 'object') ? (e.key || ((e.keyCode === 13 || e.which === 13) ? 'Enter' : '')) : '';
    if (key === 'Enter') add();
  });

  const filtered = items.filter(i => filter === 'all' ? true : (filter === 'active' ? !i.done : i.done));

  // Velvet styles
  const appClass = vs({ base: { maxWidth: '720px', margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 8px 18px rgba(0,0,0,.06)' } });
  const rowClass = vs({ base: { display: 'flex', gap: '.5rem', alignItems: 'center' } });
  const inputClass = vs({ base: { flex: '1', padding: '.6rem .75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }, focus: { outline: 'none', borderColor: '#0ea5e9', boxShadow: '0 0 0 3px rgba(14,165,233,.2)' } });
  const btnPrimary = vs({ base: { padding: '.55rem .8rem', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: '1px solid #0ea5e9', cursor: 'pointer' }, hover: { background: '#0284c7', borderColor: '#0284c7' }, active: { transform: 'translateY(0.5px)' } });
  const btnSecondary = vs({ base: { padding: '.55rem .8rem', borderRadius: '8px', background: '#fff', color: '#0ea5e9', border: '1px solid #0ea5e9', cursor: 'pointer' }, hover: { background: 'rgba(14,165,233,.08)' } });
  const listClass = vs({ base: { listStyle: 'none', padding: '0', margin: '.75rem 0 0' } });
  const liClass = vs({ base: { display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .25rem', borderBottom: '1px dashed #e5e7eb' } });
  const emptyClass = vs({ base: { color: '#6b7280', padding: '.5rem' } });
  const filtersClass = vs({ base: { display: 'flex', gap: '.5rem', marginTop: '.75rem' } });
  const filterBtn = (active) => vs({ base: { padding: '.4rem .7rem', borderRadius: '8px', background: active ? '#0284c7' : '#fff', color: active ? '#fff' : '#0ea5e9', border: `1px solid ${active ? '#0284c7' : '#0ea5e9'}`, cursor: 'pointer' }, hover: { background: active ? '#0369a1' : 'rgba(14,165,233,.08)' } });
  const badgeClass = vs({ base: { position: 'fixed', right: '16px', bottom: '16px', padding: '.5rem .75rem', borderRadius: '8px', background: '#0ea5e9', color: 'white' } });

  const render = () => html`
    <div class="${appClass}">
      <h1>Todo</h1>
      <div class="${rowClass}">
        <input id="new" type="text" class="${inputClass}" placeholder="What needs doing?" value="${text}">
        <button id="add" class="${btnPrimary}">Add</button>
      </div>

      <ul class="${listClass}">
        ${filtered.length === 0 ? `<div class=\"${emptyClass}\">No items</div>` : ''}
        ${filtered.map(i => `
          <li class=\"${liClass}\" data-key=\"${i.id}\">
            <input class=\"toggle\" type=\"checkbox\" data-id=\"${i.id}\" ${i.done ? 'checked' : ''}>
            <span class=\"todo\" style=\"text-decoration:${i.done ? 'line-through' : 'none'}\">${i.title}</span>
            <button class=\"remove ${btnSecondary}\" data-id=\"${i.id}\">Delete</button>
          </li>
        `).join('')}
      </ul>

      <div class="${filtersClass}">
        <button class="${filterBtn(filter==='all')}" data-filter="all">All</button>
        <button class="${filterBtn(filter==='active')}" data-filter="active">Active</button>
        <button class="${filterBtn(filter==='done')}" data-filter="done">Done</button>
        <button id="clearDone" class="${btnSecondary}">Clear done</button>
      </div>

      ${portal('#portal-root', `<div class='${badgeClass}'>${items.length} total</div>`, 'stats')}
    </div>
  `;
  return { render };
});

// Mount the app directly
new TodoApp().mount('#app');
