import { defineComponent, createStore, utils, Velvet } from '../../index.js';

// Todo Page (functional)
export const TodoPage = defineComponent(({ useState, html, on, find }) => {
  // Helpers for persistence
  const loadTodos = () => {
    try { return JSON.parse(localStorage.getItem('smoothjs-todos') || '[]'); } catch { return []; }
  };
  const saveTodos = (todos) => {
    try { localStorage.setItem('smoothjs-todos', JSON.stringify(todos)); } catch (e) { console.warn('saveTodos failed', e); }
  };

  // Local store for todos list
  const local = createStore({ todos: loadTodos() });

  // Component-local state
  const [todos, setTodos] = useState(() => local.getState().todos || []);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  let todoInput = null;
  let addButton = null;

  // Subscribe to local store; update todos + persist
  let unsub = null;
  const onMount = () => {
    unsub = local.subscribe((s) => {
      setTodos(s.todos || []);
      saveTodos(s.todos || []);
    });
    // Mount VelvetUI Input and Button using new features
    const { VelvetUI } = Velvet;
    const inputHost = find('#todo-input-host');
    const addHost = find('#todo-add-host');
    if (inputHost) {
      todoInput = new VelvetUI.Input(null, {}, {
        id: 'new-todo',
        placeholder: 'What needs to be done?',
        value: newTodo,
        clearable: true,
        startIcon: '✍',
        helperText: '',
        onInput: (e) => setNewTodo(e.target.value),
        onChange: (e) => setNewTodo(e.target.value)
      });
      todoInput.mount(inputHost);
    }
    if (addHost) {
      addButton = new VelvetUI.Button(null, {}, {
        variant: 'primary',
        children: 'Add',
        startIcon: '+',
        onClick: () => add()
      });
      addButton.mount(addHost);
    }
  };
  const onUnmount = () => { 
    try { unsub && unsub(); } catch {}
    try { todoInput && todoInput.unmount(); } catch {}
    try { addButton && addButton.unmount(); } catch {}
    todoInput = null; addButton = null;
  };

  // Event handlers
  on('input', '#new-todo', (e) => setNewTodo(e.target.value));
  on('keydown', '#new-todo', (e) => {
    // Safely detect Enter without invoking problematic getters on e.key
    let key = '';
    if (e && typeof e === 'object') {
      const code = (typeof e.which === 'number') ? e.which : (typeof e.keyCode === 'number' ? e.keyCode : null);
      if (code != null) {
        if (code === 13) key = 'Enter';
      } else if ('key' in e && typeof e.key === 'string') {
        key = e.key;
      }
    }
    if (key === 'Enter') {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      // delegate to add via button click if present; fallback to direct add()
      const btn = (e && e.currentTarget && e.currentTarget.closest)
        ? e.currentTarget.closest('div')?.querySelector('#add-btn')
        : null;
      if (btn) {
        try { btn.click(); } catch { add(); }
      } else {
        add();
      }
    }
  });
  const add = () => {
    const text = String(newTodo || '').trim();
    if (!text) return;
    const todo = { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() };
    local.setState({ todos: [...(todos || []), todo] });
    setNewTodo('');
    try { todoInput && todoInput.setProps({ value: '' }); } catch {}
    try { const i = find('#new-todo'); if (i) i.focus(); } catch {}
  };
  on('click', '#add-btn', add);

  on('change', '.todo-checkbox', (e) => {
    const id = parseInt(e.target.dataset.id, 10);
    if (Number.isNaN(id)) return;
    const next = (todos || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    local.setState({ todos: next });
  });

  on('click', '.delete-btn', (e) => {
    const id = parseInt(e.target.dataset.id, 10);
    if (Number.isNaN(id)) return;
    local.setState({ todos: (todos || []).filter(t => t.id !== id) });
  });

  on('click', '.filter-btn', (e) => {
    e.preventDefault();
    setFilter(e.target.dataset.filter);
  });

  on('click', '#clear-completed', () => {
    const remaining = (todos || []).filter(t => !t.completed);
    local.setState({ todos: remaining });
  });

  const filtered = () => {
    if (filter === 'active') return (todos || []).filter(t => !t.completed);
    if (filter === 'completed') return (todos || []).filter(t => t.completed);
    return todos || [];
  };

  const render = () => {
    const list = filtered();
    const total = (todos || []).length;
    const completed = (todos || []).filter(t => t.completed).length;
    const active = total - completed;

    return html`
      <div style="max-width: 768px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: var(--card); border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid var(--border);">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Todo</h2>
            <p style="margin: 0; color: var(--muted);">Local state with focus preservation</p>
          </div>
          
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
            <span id="todo-input-host" style="flex:1"></span>
            <span id="todo-add-host"></span>
          </div>
          
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; justify-content: center;">
            <button class="filter-btn" style="background: ${filter === 'all' ? 'var(--primary)' : 'transparent'}; color: ${filter === 'all' ? 'white' : 'var(--muted)'}; border: 1px solid ${filter === 'all' ? 'var(--primary)' : 'var(--border)'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" data-filter="all">All (${total})</button>
            <button class="filter-btn" style="background: ${filter === 'active' ? 'var(--primary)' : 'transparent'}; color: ${filter === 'active' ? 'white' : 'var(--muted)'}; border: 1px solid ${filter === 'active' ? 'var(--primary)' : 'var(--border)'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" data-filter="active">Active (${active})</button>
            <button class="filter-btn" style="background: ${filter === 'completed' ? 'var(--primary)' : 'transparent'}; color: ${filter === 'completed' ? 'white' : 'var(--muted)'}; border: 1px solid ${filter === 'completed' ? 'var(--primary)' : 'var(--border)'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" data-filter="completed">Completed (${completed})</button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0.75rem; background: var(--bg); border-radius: 8px; border: 1px solid var(--border); margin-bottom: 0.75rem;">
            <div style="font-size: 0.875rem;">Showing ${list.length} of ${total} • Active ${active} • Completed ${completed}</div>
            ${completed > 0 ? html`<button id="clear-completed" style="background: transparent; color: var(--muted); border: 1px solid var(--border); padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" title="Remove completed items">Clear completed (${completed})</button>` : ''}
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${list.length === 0 ? 
              html`<div style="text-align: center; padding: 2rem; color: var(--muted); font-style: italic;">No ${filter === 'all' ? '' : filter} items</div>` : 
              list.map(t => html`
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--card); border-radius: 8px; border: 1px solid var(--border); transition: all 200ms ease;" data-key="${t.id}">
                  <input type="checkbox" class="todo-checkbox" style="width: 1.25rem; height: 1.25rem;" data-id="${t.id}" ${t.completed?'checked':''}>
                  <div style="flex: 1; ${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${utils.escapeHtml(t.text)}</div>
                  <button class="delete-btn" style="padding: 0.25rem 0.5rem; background: #fef2f2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 200ms ease;" data-id="${t.id}">Delete</button>
                </div>
              `).join('')
            }
          </div>
          
        </div>
      </div>
    `;
  };

  return { render, onMount, onUnmount };
});
