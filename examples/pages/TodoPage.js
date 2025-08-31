import { Component, createStore, utils } from '../../index.js';

// Todo Page
export class TodoPage extends Component {
  constructor() {
    super(null, { todos: [], newTodo: '', filter: 'all' });
    this.local = createStore({ todos: this.loadTodos() });
    this.local.subscribe((s) => {
      this.setState({ todos: s.todos });
      this.saveTodos(s.todos);
    });
  }

  onCreate() {
    this
      .on('input', '#new-todo', this.onInput)
      .on('keydown', '#new-todo', this.onKeyDown)
      .on('click', '#add-btn', this.add)
      .on('click', '.delete-btn', this.remove)
      .on('change', '.todo-checkbox', this.toggle)
      .on('click', '.filter-btn', this.setFilter)
      .on('click', '#clear-completed', this.clearCompleted);
  }

  onInput(e) { 
    this.setState({ newTodo: e.target.value }); 
  }

  onKeyDown(e) { 
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      this.add(); 
    } 
  }

  add() {
    const text = this.state.newTodo.trim();
    if (!text) return;
    const todo = { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() };
    this.local.setState({ todos: [...this.state.todos, todo] });
    this.setState({ newTodo: '' });
    const i = this.find('#new-todo'); 
    if (i) i.focus();
  }

  toggle(e) {
    const id = parseInt(e.target.dataset.id, 10); 
    if (Number.isNaN(id)) return;
    const todos = this.state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.local.setState({ todos });
  }

  remove(e) {
    const id = parseInt(e.target.dataset.id, 10); 
    if (Number.isNaN(id)) return;
    this.local.setState({ todos: this.state.todos.filter(t => t.id !== id) });
  }

  clearCompleted() {
    const remaining = this.state.todos.filter(t => !t.completed);
    this.local.setState({ todos: remaining });
  }

  setFilter(e) { 
    e.preventDefault(); 
    this.setState({ filter: e.target.dataset.filter }); 
  }

  filtered() {
    const { todos, filter } = this.state;
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  loadTodos() { 
    try { 
      return JSON.parse(localStorage.getItem('smoothjs-todos') || '[]'); 
    } catch { 
      return []; 
    } 
  }

  saveTodos(todos) { 
    try { 
      localStorage.setItem('smoothjs-todos', JSON.stringify(todos)); 
    } catch (e) { 
      console.warn('saveTodos failed', e); 
    } 
  }

  template() {
    const todos = this.filtered();
    const total = this.state.todos.length;
    const completed = this.state.todos.filter(t => t.completed).length;
    const active = total - completed;

    return this.html`
      <div style="max-width: 768px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: var(--card); border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid var(--border);">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Todo</h2>
            <p style="margin: 0; color: var(--muted);">Local state with focus preservation</p>
          </div>
          
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
            <input 
              id="new-todo" 
              style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 1rem; background: var(--card); color: inherit;"
              placeholder="What needs to be done?" 
              value="${utils.escapeHtml(this.state.newTodo)}"
            >
            <button id="add-btn" style="background: var(--primary); color: white; border: 1px solid var(--primary); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Add</button>
          </div>
          
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; justify-content: center;">
            <button class="filter-btn" style="background: ${this.state.filter === 'all' ? 'var(--primary)' : 'transparent'}; color: ${this.state.filter === 'all' ? 'white' : 'var(--muted)'}; border: 1px solid ${this.state.filter === 'all' ? 'var(--primary)' : 'var(--border)'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" data-filter="all">All (${total})</button>
            <button class="filter-btn" style="background: ${this.state.filter === 'active' ? 'var(--primary)' : 'transparent'}; color: ${this.state.filter === 'active' ? 'white' : 'var(--muted)'}; border: 1px solid ${this.state.filter === 'active' ? 'var(--primary)' : 'var(--border)'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" data-filter="active">Active (${active})</button>
            <button class="filter-btn" style="background: ${this.state.filter === 'completed' ? 'var(--primary)' : 'transparent'}; color: ${this.state.filter === 'completed' ? 'white' : 'var(--muted)'}; border: 1px solid ${this.state.filter === 'completed' ? 'var(--primary)' : 'var(--border)'}; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" data-filter="completed">Completed (${completed})</button>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0.75rem; background: var(--bg); border-radius: 8px; border: 1px solid var(--border); margin-bottom: 0.75rem;">
            <div style="font-size: 0.875rem;">Showing ${todos.length} of ${total} • Active ${active} • Completed ${completed}</div>
            ${completed > 0 ? this.html`<button id="clear-completed" style="background: transparent; color: var(--muted); border: 1px solid var(--border); padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.875rem;" title="Remove completed items">Clear completed (${completed})</button>` : ''}
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${todos.length === 0 ? 
              this.html`<div style="text-align: center; padding: 2rem; color: var(--muted); font-style: italic;">No ${this.state.filter === 'all' ? '' : this.state.filter} items</div>` : 
              todos.map(t => this.html`
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
  }
}
