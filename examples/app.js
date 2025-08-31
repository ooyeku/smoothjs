import { Component, Router, createStore, createSelector, http, utils, createElement, $, $$, version, Velvet, Query } from '../index.js';

// Initialize Velvet design system
console.log('Initializing Velvet...', Velvet);
let VelvetComponent, toggleDarkMode;

try {
  Velvet.initVelvet({ darkMode: 'auto' });
  VelvetComponent = Velvet.VelvetComponent;
  toggleDarkMode = Velvet.toggleDarkMode;
  console.log('Velvet initialized successfully', { VelvetComponent, toggleDarkMode });
} catch (error) {
  console.error('Error initializing Velvet:', error);
  // Fallback to regular Component if Velvet fails
  VelvetComponent = Component;
  toggleDarkMode = () => console.log('Dark mode toggle not available');
}

// Global store for Counter demo
const counterStore = createStore({ count: 0 });
const selectIsEven = createSelector(s => s.count, (c) => (c % 2 === 0));
const selectDouble = createSelector(s => s.count, (c) => c * 2);

// Dark mode toggle component
class DarkModeToggle extends VelvetComponent {
  constructor() {
    super(null, { isDark: false });
  }
  
  onCreate() {
    this.on('click', 'button', () => {
      toggleDarkMode();
      this.setState({ isDark: !this.state.isDark });
    });
    
    // Check initial state
    this.setState({ 
      isDark: document.documentElement.getAttribute('data-theme') === 'dark' 
    });
  }
  
  template() {
    return this.html`
      <button class="${this.vs({
        base: {
          padding: '0.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1.25rem',
          transition: 'all 200ms ease'
        },
        hover: {
          backgroundColor: 'white',
          transform: 'scale(1.05)'
        },
        dark: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white'
        }
      })}">
        ${this.state.isDark ? 'Light' : 'Dark'}
      </button>
    `;
  }
}

// Home Page
class HomePage extends VelvetComponent {
  template() {
    return this.html`
      <div class="${this.vs({
        base: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          textAlign: 'center'
        },
        dark: {
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
        }
      })}">
        <h1 class="${this.vs('text-4xl font-bold mb-4')}">SmoothJS + Velvet</h1>
        <p class="${this.vs('text-lg opacity-90 mb-4')}">Explore minimal demos with beautiful design</p>
        <div class="${this.vs('flex justify-center gap-2 flex-wrap')}">
          <span class="${this.vs({
            base: {
              padding: '0.25rem 0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              fontSize: '0.875rem'
            }
          })}">Vite Dev</span>
          <span class="${this.vs({
            base: {
              padding: '0.25rem 0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              fontSize: '0.875rem'
            }
          })}">Zero Dependencies</span>
        </div>
      </div>
      
      <div class="${this.vs({
        base: {
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr'
        },
        responsive: {
          md: { gridTemplateColumns: 'repeat(2, 1fr)' }
        }
      })}">
        ${[
          { href: '#/todo', title: 'Todo', desc: 'Component, local store, events, input focus preservation' },
          { href: '#/counter', title: 'Counter', desc: 'Global store + selectors, batching, debounce/throttle' },
          { href: '#/fetch', title: 'Fetch', desc: 'HTTP client (withBase, timeout, error handling)' },
          { href: '#/dom', title: 'DOM', desc: 'createElement, $, $$ utilities, dynamic DOM' },
          { href: '#/users', title: 'Users', desc: 'Nested & dynamic routes with lazy loaded detail', attrs: 'data-router-link data-to="/users"' },
          { href: '#/error', title: 'Error', desc: 'Error boundary fallback demo' },
          { href: '#/about', title: 'About', desc: 'Utilities and version' }
        ].map(item => this.html`
          <a href="${item.href}" ${item.attrs || ''} class="${this.vs({
            base: {
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 250ms ease'
            },
            hover: {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
            },
            dark: {
              backgroundColor: '#374151',
              color: 'white'
            }
          })}">
            <div class="${this.vs('flex items-center gap-2 mb-2')}">
              <h3 class="${this.vs('text-lg font-semibold')}">${item.title}</h3>
            </div>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-300 text-sm')}">— ${item.desc}</p>
          </a>
        `).join('')}
      </div>
      
      <div class="${this.vs({
        base: {
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        },
        dark: {
          backgroundColor: '#0c4a6e',
          borderColor: '#0284c7'
        }
      })}">
        <p class="${this.vs('text-sm text-blue-800 dark:text-blue-200')}">
          Tip: Use the dark mode toggle in the top-right corner. Hash-based routing works on static hosting with nested routes, dynamic params, lazy loading, and active links.
        </p>
      </div>
    `;
  }
}

// Todo Page
class TodoPage extends VelvetComponent {
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
  onInput(e) { this.setState({ newTodo: e.target.value }); }
  onKeyDown(e) { if (e.key === 'Enter') { e.preventDefault(); this.add(); } }
  add() {
    const text = this.state.newTodo.trim();
    if (!text) return;
    const todo = { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() };
    this.local.setState({ todos: [...this.state.todos, todo] });
    this.setState({ newTodo: '' });
    const i = this.find('#new-todo'); if (i) i.focus();
  }
  toggle(e) {
    const id = parseInt(e.target.dataset.id, 10); if (Number.isNaN(id)) return;
    const todos = this.state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.local.setState({ todos });
  }
  remove(e) {
    const id = parseInt(e.target.dataset.id, 10); if (Number.isNaN(id)) return;
    this.local.setState({ todos: this.state.todos.filter(t => t.id !== id) });
  }
  clearCompleted() {
    const remaining = this.state.todos.filter(t => !t.completed);
    this.local.setState({ todos: remaining });
  }
  setFilter(e) { e.preventDefault(); this.setState({ filter: e.target.dataset.filter }); }
  filtered() {
    const { todos, filter } = this.state;
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }
  loadTodos() { try { return JSON.parse(localStorage.getItem('smoothjs-todos') || '[]'); } catch { return []; } }
  saveTodos(todos) { try { localStorage.setItem('smoothjs-todos', JSON.stringify(todos)); } catch (e) { console.warn('saveTodos failed', e); } }
  template() {
    const todos = this.filtered();
    const total = this.state.todos.length;
    const completed = this.state.todos.filter(t => t.completed).length;
    const active = total - completed;
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Todo</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Local state with focus preservation</p>
          </div>
          
          <div class="${this.vs('flex gap-3 mb-6')}">
            <input 
              id="new-todo" 
              class="${this.v.input()}" 
              placeholder="What needs to be done?" 
              value="${utils.escapeHtml(this.state.newTodo)}"
              style="flex: 1"
            >
            <button id="add-btn" class="${this.v.button('primary', 'md')}">Add</button>
          </div>
          
          <div class="${this.vs('flex gap-2 mb-3 justify-center')}">
            <button class="filter-btn ${this.v.button(this.state.filter === 'all' ? 'primary' : 'ghost', 'sm')}" data-filter="all">All (${total})</button>
            <button class="filter-btn ${this.v.button(this.state.filter === 'active' ? 'primary' : 'ghost', 'sm')}" data-filter="active">Active (${active})</button>
            <button class="filter-btn ${this.v.button(this.state.filter === 'completed' ? 'primary' : 'ghost', 'sm')}" data-filter="completed">Completed (${completed})</button>
          </div>

          <div class="${this.vs({
            base: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              marginBottom: '0.75rem'
            },
            dark: {
              backgroundColor: '#1f2937',
              borderColor: '#374151',
              color: '#e5e7eb'
            }
          })}">
            <div class="${this.vs('text-sm')}">Showing ${todos.length} of ${total} • Active ${active} • Completed ${completed}</div>
            ${completed > 0 ? this.html`<button id="clear-completed" class="${this.v.button('ghost','sm')}" title="Remove completed items">Clear completed (${completed})</button>` : ''}
          </div>
          
          <div class="${this.vs('space-y-2')}">
            ${todos.length === 0 ? 
              this.html`<div class="${this.vs({
                base: {
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#9ca3af',
                  fontStyle: 'italic'
                },
                dark: { color: '#6b7280' }
              })}">No ${this.state.filter === 'all' ? '' : this.state.filter} items</div>` : 
              todos.map(t => this.html`
                <div class="${this.vs({
                  base: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 200ms ease'
                  },
                  hover: { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
                  dark: {
                    backgroundColor: '#374151',
                    borderColor: '#4b5563',
                    color: 'white'
                  }
                })}" data-key="${t.id}">
                  <input type="checkbox" class="todo-checkbox ${this.vs({
                    base: { width: '1.25rem', height: '1.25rem', accentColor: '#0ea5e9' }
                  })}" data-id="${t.id}" ${t.completed?'checked':''}>
                  <div class="${this.vs({
                    base: {
                      flex: '1',
                      ...(t.completed && {
                        textDecoration: 'line-through',
                        opacity: '0.6'
                      })
                    }
                  })}">${utils.escapeHtml(t.text)}</div>
                  <button class="delete-btn ${this.vs({
                    base: {
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 200ms ease'
                    },
                    hover: { backgroundColor: '#fee2e2' },
                    dark: {
                      backgroundColor: '#7f1d1d',
                      color: '#fecaca'
                    }
                  })}" data-id="${t.id}">Delete</button>
                </div>
              `).join('')
            }
          </div>
          
        </div>
      </div>
    `;
  }
}

// Counter Page (Global store)
class CounterPage extends VelvetComponent {
  onCreate() {
    this
      .on('click', '#inc', () => counterStore.setState(prev => ({ count: prev.count + 1 })))
      .on('click', '#inc2', () => utils.batch(() => { counterStore.setState(prev => ({ count: prev.count + 1 })); counterStore.setState(prev => ({ count: prev.count + 1 })); }))
      .on('click', '#dec', () => counterStore.setState(prev => ({ count: prev.count - 1 })))
      .on('click', '#reset', () => counterStore.reset())
      .on('click', '#replace10', () => counterStore.replaceState({ count: 10 }));

    // Debounced log on increment
    this.logInc = utils.debounce(() => console.log('Debounced count:', counterStore.getState().count), 300);

    // Subscribe using selectors for derived values
    this.unsubEven = counterStore.select(selectIsEven, (isEven) => { this._isEven = isEven; this.render(); });
    this.unsubDouble = counterStore.select(selectDouble, (double) => { this._double = double; });

    // Also subscribe to any change to throttle logs and ensure UI re-renders on count changes
    this.unsubscribe = counterStore.subscribe(() => { this.render(); this.logInc(); });
  }
  onUnmount() { if (this.unsubscribe) this.unsubscribe(); if (this.unsubEven) this.unsubEven(); if (this.unsubDouble) this.unsubDouble(); }
  template() {
    const { count } = counterStore.getState();
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Counter</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Global store + selectors, batching & debounce</p>
          </div>
          
          <div class="${this.vs('flex items-center justify-center gap-4 mb-6')}">
            <button id="dec" class="${this.v.button('secondary', 'lg')}">−</button>
            <div class="${this.vs({
              base: {
                fontSize: '3rem',
                fontWeight: '700',
                color: '#0ea5e9',
                minWidth: '100px',
                textAlign: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '2px solid #bae6fd'
              },
              dark: {
                backgroundColor: '#0c4a6e',
                borderColor: '#0284c7',
                color: '#7dd3fc'
              }
            })}">${count}</div>
            <button id="inc" class="${this.v.button('primary', 'lg')}">＋</button>
          </div>
          
          <div class="${this.vs('grid grid-cols-1 md:grid-cols-3 gap-2 mb-6')}">
            <button id="inc2" class="${this.v.button('primary', 'sm')}" style="background:#059669;">++ twice (batched)</button>
            <button id="reset" class="${this.v.button('ghost', 'sm')}">Reset</button>
            <button id="replace10" class="${this.v.button('secondary', 'sm')}">Replace 10</button>
          </div>
          
          <div class="${this.vs({
            base: {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            },
            dark: {
              backgroundColor: '#1e293b'
            }
          })}">
            <div class="${this.vs('text-center')}">
              <div class="${this.vs('text-sm font-medium text-neutral-600 dark:text-neutral-400')}">Double</div>
              <div class="${this.vs('text-xl font-bold text-blue-600 dark:text-blue-400')}">${this._double ?? (count*2)}</div>
            </div>
            <div class="${this.vs('text-center')}">
              <div class="${this.vs('text-sm font-medium text-neutral-600 dark:text-neutral-400')}">Even?</div>
              <div class="${this.vs('text-xl font-bold')}" style="color: ${this._isEven ? '#059669' : '#dc2626'}">${this._isEven ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div class="${this.vs({
            base: {
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            },
            dark: {
              backgroundColor: '#022c22',
              borderColor: '#059669'
            }
          })}">
            <p class="${this.vs('text-sm text-green-700 dark:text-green-300')}">Store-backed counter with memoized selectors, update batching, and debounced console logs.</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Fetch Demo Page
class FetchPage extends VelvetComponent {
  constructor() { super(null, { loading: false, error: null, data: null }); }
  onCreate() { this.on('click', '#load', this.loadData); }
  async loadData() {
    this.setState({ loading: true, error: null });
    try {
      // Use withBase to demonstrate prefixing the /examples folder
      const api = http.withBase('/examples', { timeout: 2000 });
      const data = await api.get('/data.json');
      // Add slight delay to visualize loading
      await new Promise(r => setTimeout(r, 400));
      this.setState({ data, loading: false });
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.setState({ error: msg, loading: false });
    }
  }
  template() {
    return this.html`
      <div>
        <h2>Fetch</h2>
        <p class="muted">Using http.withBase, timeout, and error handling against a local JSON file.</p>
        <button id="load" class="btn" ${this.state.loading?'disabled':''}>${this.state.loading?'Loading...':'Load Data'}</button>
        ${this.state.error?this.html`<div class="error" style="margin-top:.5rem;">${this.state.error}</div>`:''}
        ${this.state.data?this.html`
          <pre style="background:#111;color:#e6e6e6;padding:.75rem;border-radius:6px;overflow:auto;">${utils.escapeHtml(JSON.stringify(this.state.data, null, 2))}</pre>
        `:''}
      </div>
    `;
  }
}

// DOM Demo Page
class DomPage extends VelvetComponent {
  onCreate() {
    this.on('click', '#addItem', this.addItem)
        .on('click', '#clearItems', this.clearItems);
  }
  addItem() {
    const list = this.find('#dom-list');
    const idx = list.children.length + 1;
    const item = createElement('li', { className: 'row', dataset: { idx } },
      createElement('span', { style: { flex: 1 } }, `Item #${idx}`),
      createElement('button', { className: 'btn', onClick: () => alert(`Clicked ${idx}`) }, 'Click'));
    list.appendChild(item);
  }
  clearItems() { const list = this.find('#dom-list'); if (list) list.innerHTML = ''; }
  template() {
    return this.html`
      <div>
        <h2>DOM Utilities</h2>
        <div class="row" style="margin-bottom:.5rem;">
          <button id="addItem" class="btn">Add Item</button>
          <button id="clearItems" class="btn" style="background:#6c757d;">Clear</button>
        </div>
        <ul id="dom-list" class="list"></ul>
        <p class="muted">Built with createElement(), event handlers, and dataset/style/class usage. Try the buttons.</p>
      </div>
    `;
  }
}

// Users Parent Page (nested routing demo)
class UsersPage extends VelvetComponent {
  constructor() {
    super(null, { users: [
      { id: 1, name: 'Ada Lovelace' },
      { id: 2, name: 'Alan Turing' },
      { id: 3, name: 'Grace Hopper' }
    ]});
  }
  template() {
    return this.html`
      <div>
        <h2>Users</h2>
        <p class="muted">Nested routing with dynamic params and lazy loading. Select a user to load details lazily.</p>
        <ul class="list">
          ${this.state.users.map(u => this.html`<li>
            <a href="#/users/${u.id}" data-router-link data-to="/users/${u.id}">${u.name}</a>
          </li>`)}
        </ul>
        <div class="card" style="margin-top:1rem; padding: .5rem 1rem;">
          <div class="muted" style="margin-bottom:.5rem;">Details outlet:</div>
          <div data-router-outlet></div>
        </div>
      </div>
    `;
  }
}

// About Page
class AboutPage extends VelvetComponent {
  template() {
    const now = new Date();
    return this.html`
      <div>
        <h2>About</h2>
        <p>Running SmoothJS v${version}</p>
        <p class="muted">Formatted date: ${utils.formatters.date(now)}</p>
        <p class="muted">Formatted number: ${utils.formatters.number(1234567.89)}</p>
      </div>
    `;
  }
}

// Error Demo Page with error boundary fallback
class ErrorPage extends VelvetComponent {
  constructor() { super(null, { crash: false }); }
  onCreate() {
    this
      .on('click', '#crashSelf', () => this.setState({ crash: true }))
      .on('click', '#resetErr', () => this.setState({ crash: false }));
  }
  renderError(err) {
    return this.html`
      <div>
        <h2>Error Boundary</h2>
        <div class="error">Caught error: ${utils.escapeHtml(err.message || String(err))}</div>
        <button id="resetErr" class="btn" style="background:#6c757d;margin-top:.5rem;">Reset</button>
      </div>
    `;
  }
  template() {
    if (this.state.crash) {
      throw new Error('Boom! Something went wrong in ErrorPage');
    }
    return this.html`
      <div>
        <h2>Error Demo</h2>
        <p class="muted">Click to throw an error and show fallback via renderError().</p>
        <button id="crashSelf" class="btn" style="background:#dc3545;">Throw Error</button>
      </div>
    `;
  }
}

class NotFound extends VelvetComponent { 
  template() { 
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card()}">
          <div class="${this.vs('text-center')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Not Found</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400 mb-6')}">Route does not exist.</p>
            <a href="#/" class="${this.v.button('primary', 'md')}">Go Home</a>
          </div>
        </div>
      </div>
    `; 
  } 
}

// Router Setup (hash mode for static hosting)
const router = new Router({ 
  mode: 'hash', 
  root: '#app', 
  notFound: NotFound, 
  beforeEach: (to, from) => { 
    console.log('Navigating:', from, '->', to); 
    console.log('App element before navigation:', document.querySelector('#app'));
    return true; 
  } 
});
router
  .route('/', HomePage)
  .route('/todo', TodoPage)
  .route('/counter', CounterPage)
  .route('/fetch', FetchPage)
  .route('/dom', DomPage)
  .route('/users', UsersPage)
  .route('/users/:id', () => import('./users.js'))
  .route('/error', ErrorPage)
  .route('/about', AboutPage);

// Wait for DOM to be ready before starting router and mounting components
function startApp() {
  console.log('Starting app, DOM ready state:', document.readyState);
  
  const appElement = document.querySelector('#app');
  console.log('App element found:', appElement);
  
  if (!appElement) {
    console.log('App element not found, retrying...');
    setTimeout(startApp, 10);
    return;
  }
  
  console.log('Starting router...');
  // Ensure router mounts into a concrete Element to avoid selector timing issues
  router.options.root = appElement;
  router.start();
  
  console.log('Mounting dark mode toggle...');
  const darkToggle = new DarkModeToggle();
  const existingHost = document.getElementById('toggle-host');
  const toggleHost = existingHost || (() => { const d = document.createElement('div'); document.body.appendChild(d); return d; })();
  darkToggle.mount(toggleHost);
  console.log('App started successfully');
}

// Start the app when DOM is ready
console.log('Initial DOM ready state:', document.readyState);
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  console.log('DOM already loaded, starting app immediately...');
  startApp();
}
