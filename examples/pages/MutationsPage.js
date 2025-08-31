import { Component, Query } from '../../index.js';

// Mutations Demo Page showing optimistic updates + rollback and tag invalidation
export class MutationsPage extends Component {
  constructor() {
    super(null, {
      todosKey: 'todos',
      input: '',
      error: null
    });
  }

  onCreate() {
    this.on('input', '#newTitle', (e) => this.setState({ input: e.target.value }))
        .on('click', '#add', () => this.addTodo())
        .on('click', '#reset', () => this.reset());

    // Seed initial data if absent
    if (!Query.getData(this.state.todosKey)) {
      Query.setData(this.state.todosKey, [ { id: 1, title: 'Learn SmoothJS' } ]);
    }
  }

  async addTodo() {
    const title = (this.state.input || '').trim();
    if (!title) return;
    const id = Date.now();

    // Simulated server mutation
    const serverCreate = async () => {
      await new Promise(r => setTimeout(r, 150));
      // randomly fail to demo rollback
      if (Math.random() < 0.2) throw new Error('Network error');
      const prev = Query.getData(this.state.todosKey) || [];
      return prev.map(x => x).concat({ id, title });
    };

    this.setState({ error: null, input: '' });
    try {
      await Query.mutate(this.state.todosKey, serverCreate, {
        optimisticData: (prev) => (prev || []).concat({ id, title }),
        rollbackOnError: true,
        invalidateTags: ['todos']
      });
    } catch (e) {
      this.setState({ error: e && e.message ? e.message : String(e) });
    }
  }

  reset() {
    Query.setData(this.state.todosKey, [ { id: 1, title: 'Learn SmoothJS' } ]);
    this.setState({ input: '', error: null });
  }

  template() {
    const todos = Query.getData(this.state.todosKey) || [];
    return this.html`
      <div style="max-width:768px; margin:0 auto; padding: 0.75rem 1rem;">
        <div style="background: var(--card); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem;">
          <h2 style="margin:0 0 .75rem 0;">Query Mutations (Optimistic)</h2>
          <div class="row" style="display:flex; gap:.5rem; align-items:center; margin-bottom:.75rem;">
            <input id="newTitle" class="input" placeholder="New todo title" value="${this.state.input}">
            <button id="add" class="btn" type="button">Add</button>
            <button id="reset" class="btn" type="button">Reset</button>
          </div>
          ${this.state.error ? this.html`<div class="notice" style="margin-bottom:.75rem; color:#dc2626;">${this.state.error}</div>` : ''}
          <ul class="list">
            ${todos.map(t => this.html`<li data-key="${t.id}">${t.title}</li>`).join('')}
          </ul>
          <div class="muted" style="font-size:.875rem; margin-top:.5rem;">Tag invalidation: <code>todos</code></div>
        </div>
      </div>
    `;
  }
}
