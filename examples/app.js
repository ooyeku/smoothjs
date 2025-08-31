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

// Global stores for advanced state management demo
const counterStore = createStore({ count: 0 });
const selectIsEven = createSelector(s => s.count, (c) => (c % 2 === 0));
const selectDouble = createSelector(s => s.count, (c) => c * 2);
const selectCountCategory = createSelector(
  s => s.count,
  (c) => c === 0 ? 'zero' : c > 0 ? 'positive' : 'negative'
);

// Reusable component: StatCard
class StatCard extends VelvetComponent {
  constructor() {
    super(null, {
      title: '',
      value: '',
      icon: '',
      color: 'blue',
      trend: null // { direction: 'up|down', value: number }
    });
  }

  setProps(props) {
    super.setProps(props);
  }

  template() {
    const colorMap = {
      blue: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', darkBg: '#1e293b', darkBorder: '#334155', darkText: '#93c5fd' },
      green: { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', darkBg: '#022c22', darkBorder: '#059669', darkText: '#34d399' },
      red: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', darkBg: '#451a1a', darkBorder: '#dc2626', darkText: '#f87171' },
      yellow: { bg: '#fefce8', border: '#fef08a', text: '#ca8a04', darkBg: '#451a03', darkBorder: '#d97706', darkText: '#fbbf24' }
    };

    const colors = colorMap[this.props.color] || colorMap.blue;

    return this.html`
      <div class="${this.vs({
        base: {
          padding: '1.25rem',
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          transition: 'all 200ms ease'
        },
        hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        dark: {
          backgroundColor: colors.darkBg,
          borderColor: colors.darkBorder
        }
      })}">
        <div class="${this.vs('flex items-center justify-between')}">
          <div>
            <div class="${this.vs({
              base: {
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '0.25rem'
              },
              dark: {
                color: '#9ca3af'
              }
            })}">${this.props.title}</div>
            <div class="${this.vs({
              base: {
                fontSize: '1.5rem',
                fontWeight: '700',
                color: colors.text
              },
              dark: {
                color: colors.darkText
              }
            })}">${this.props.value}</div>
          </div>

          ${this.props.icon ? this.html`
            <div class="${this.vs({
              base: {
                fontSize: '1.5rem',
                opacity: '0.8'
              }
            })}">${this.props.icon}</div>
          ` : ''}

          ${this.props.trend ? this.html`
            <div class="${this.vs('flex items-center gap-1')}">
              <span class="${this.vs({
                base: {
                  fontSize: '0.75rem',
                  color: this.props.trend.direction === 'up' ? '#059669' : '#dc2626',
                  fontWeight: '500'
                }
              })}">
                ${this.props.trend.direction === 'up' ? '↑' : '↓'} ${this.props.trend.value}%
              </span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

// Reusable component: ActionButton
class ActionButton extends VelvetComponent {
  constructor() {
    super(null, {
      label: '',
      variant: 'primary',
      size: 'md',
      icon: null,
      disabled: false,
      loading: false,
      onClick: null
    });
  }

  setProps(props) {
    super.setProps(props);
  }

  onCreate() {
    if (this.props.onClick) {
      this.on('click', 'button', this.props.onClick);
    }
  }

  template() {
    const sizeMap = {
      sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
    };

    const sizes = sizeMap[this.props.size] || sizeMap.md;

    return this.html`
      <button
        class="${this.v.button(this.props.variant, this.props.size)} ${this.props.disabled || this.props.loading ? this.vs('opacity-50 cursor-not-allowed') : ''}"
        ${this.props.disabled || this.props.loading ? 'disabled' : ''}
      >
        ${this.props.loading ? this.html`
          <div class="${this.vs('flex items-center gap-2')}">
            <div class="${this.vs({
              base: {
                width: '1rem',
                height: '1rem',
                border: '2px solid currentColor',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }
            })}"></div>
            Loading...
          </div>
        ` : this.html`
          <div class="${this.vs('flex items-center gap-2')}">
            ${this.props.icon ? this.html`<span>${this.props.icon}</span>` : ''}
            <span>${this.props.label}</span>
          </div>
        `}
      </button>
    `;
  }
}

// Reusable component: DataTable
class DataTable extends VelvetComponent {
  constructor() {
    super(null, {
      columns: [],
      data: [],
      sortable: false,
      selectable: false,
      selectedRows: new Set(),
      sortBy: null,
      sortDirection: 'asc'
    });
  }

  setProps(props) {
    super.setProps(props);
  }

  onCreate() {
    if (this.props.sortable) {
      this.props.columns.forEach(col => {
        if (col.sortable) {
          this.on('click', `#sort-${col.key}`, () => this.sortBy(col.key));
        }
      });
    }

    if (this.props.selectable) {
      this.on('change', '.row-checkbox', (e) => {
        const id = e.target.value;
        if (e.target.checked) {
          this.props.selectedRows.add(id);
        } else {
          this.props.selectedRows.delete(id);
        }
        this.render();
      });
    }
  }

  sortBy(key) {
    const direction = this.props.sortBy === key && this.props.sortDirection === 'asc' ? 'desc' : 'asc';
    this.setState({ sortBy: key, sortDirection: direction });
  }

  getSortedData() {
    if (!this.props.sortBy) return this.props.data;

    return [...this.props.data].sort((a, b) => {
      const aVal = a[this.props.sortBy];
      const bVal = b[this.props.sortBy];

      if (this.props.sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  template() {
    const sortedData = this.getSortedData();

    return this.html`
      <div class="${this.vs({
        base: {
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        },
        dark: {
          borderColor: '#374151'
        }
      })}">
        <table class="${this.vs('w-full')}">
          <thead class="${this.vs({
            base: {
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            },
            dark: {
              backgroundColor: '#1f2937',
              borderBottomColor: '#374151'
            }
          })}">
            <tr>
              ${this.props.selectable ? this.html`
                <th class="${this.vs('px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider')}">
                  <input type="checkbox" class="select-all">
                </th>
              ` : ''}

              ${this.props.columns.map(col => this.html`
                <th class="${this.vs('px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider')}">
                  ${col.sortable ? this.html`
                    <button
                      id="sort-${col.key}"
                      class="${this.vs('flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300')}"
                    >
                      ${col.label}
                      ${this.props.sortBy === col.key ? this.html`
                        <span>${this.props.sortDirection === 'asc' ? '↑' : '↓'}</span>
                      ` : ''}
                    </button>
                  ` : col.label}
                </th>
              `).join('')}
            </tr>
          </thead>

          <tbody class="${this.vs({
            base: {
              backgroundColor: 'white',
              divideY: 'divide-y divide-gray-200'
            },
            dark: {
              backgroundColor: '#111827'
            }
          })}">
            ${sortedData.length === 0 ? this.html`
              <tr>
                <td
                  colspan="${this.props.columns.length + (this.props.selectable ? 1 : 0)}"
                  class="${this.vs('px-4 py-8 text-center text-gray-500 dark:text-gray-400')}"
                >
                  No data available
                </td>
              </tr>
            ` : sortedData.map((row, index) => this.html`
              <tr class="${this.vs({
                base: {
                  hover: { backgroundColor: '#f9fafb' }
                },
                dark: {
                  hover: { backgroundColor: '#1f2937' }
                }
              })}">
                ${this.props.selectable ? this.html`
                  <td class="${this.vs('px-4 py-4 whitespace-nowrap')}">
                    <input
                      type="checkbox"
                      class="row-checkbox"
                      value="${row.id || index}"
                      ${this.props.selectedRows.has(row.id || index) ? 'checked' : ''}
                    >
                  </td>
                ` : ''}

                ${this.props.columns.map(col => this.html`
                  <td class="${this.vs('px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100')}">
                    ${col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// User preferences store for settings persistence
const preferencesStore = createStore({
  theme: 'auto',
  language: 'en',
  notifications: true,
  animationSpeed: 'normal'
});

// Advanced selectors for preferences
const selectThemeDisplay = createSelector(
  s => s.theme,
  (theme) => ({
    auto: 'Auto (System)',
    light: 'Light Mode',
    dark: 'Dark Mode'
  }[theme] || theme)
);

const selectAnimationDuration = createSelector(
  s => s.animationSpeed,
  (speed) => ({
    slow: 600,
    normal: 300,
    fast: 150
  }[speed] || 300)
);

// Combined store for app-wide state
const appStore = createStore({
  isOnline: navigator.onLine,
  lastActivity: new Date().toISOString(),
  sessionId: Math.random().toString(36).substr(2, 9)
});

// Advanced selector combining multiple stores
const selectAppStatus = createSelector(
  [appStore.getState, counterStore.getState, preferencesStore.getState],
  ([app, counter, prefs]) => ({
    online: app.isOnline,
    count: counter.count,
    theme: prefs.theme,
    status: app.isOnline ? 'online' : 'offline'
  })
);

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
          { href: '#/counter', title: 'Advanced Counter', desc: 'Multi-store state management with complex selectors' },
          { href: '#/fetch', title: 'Query Cache', desc: 'Advanced network request management with caching' },
          { href: '#/dom', title: 'DOM Utilities', desc: 'createElement, $, $$ utilities, dynamic DOM' },
          { href: '#/users', title: 'Users', desc: 'Nested & dynamic routes with lazy loaded detail', attrs: 'data-router-link data-to="/users"' },
          { href: '#/protected', title: 'Protected Route', desc: 'Navigation guards with authentication checks' },
          { href: '#/loading-demo', title: 'Loading Demo', desc: 'Navigation guards with async validation' },
          { href: '#/error', title: 'Error Boundaries', desc: 'Error boundary fallback demo' },
          { href: '#/about', title: 'About', desc: 'Utilities, formatters, and version info' }
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
        <div class="${this.vs('space-y-4')}">
          <div class="${this.vs({
            base: {
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            },
            dark: {
              backgroundColor: '#1e293b',
              borderColor: '#334155'
            }
          })}">
            <h4 class="${this.vs({
              base: {
                margin: '0 0 0.5rem 0',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              },
              dark: {
                color: '#f9fafb'
              }
            })}">Navigation Guards Active</h4>
            <p class="${this.vs('text-sm text-neutral-600 dark:text-neutral-400 mb-0')}">
              Try visiting <strong>/protected</strong> (requires authentication) or <strong>/loading-demo</strong> (shows async validation).
              Check the console for navigation logs!
            </p>
          </div>

        <p class="${this.vs('text-sm text-blue-800 dark:text-blue-200')}">
            Use the dark mode toggle in the top-right corner. Hash-based routing works on static hosting with nested routes, dynamic params, lazy loading, and active links.
        </p>
        </div>
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

// Counter Page (Advanced Global Store)
class CounterPage extends VelvetComponent {
  constructor() {
    super(null, {
      showAdvanced: false,
      animationDuration: 300
    });
  }

  onCreate() {
    this
      .on('click', '#inc', () => counterStore.setState(prev => ({ count: prev.count + 1 })))
      .on('click', '#inc2', () => utils.batch(() => { counterStore.setState(prev => ({ count: prev.count + 1 })); counterStore.setState(prev => ({ count: prev.count + 1 })); }))
      .on('click', '#dec', () => counterStore.setState(prev => ({ count: prev.count - 1 })))
      .on('click', '#reset', () => counterStore.reset())
      .on('click', '#replace10', () => counterStore.replaceState({ count: 10 }))
      .on('click', '#toggle-advanced', () => this.setState({ showAdvanced: !this.state.showAdvanced }));

    // Debounced log on increment
    this.logInc = utils.debounce(() => console.log('Debounced count:', counterStore.getState().count), 300);

    // Subscribe using multiple selectors for derived values
    this.unsubEven = counterStore.select(selectIsEven, (isEven) => { this._isEven = isEven; this.render(); });
    this.unsubDouble = counterStore.select(selectDouble, (double) => { this._double = double; });
    this.unsubCategory = counterStore.select(selectCountCategory, (category) => { this._category = category; this.render(); });

    // Subscribe to preferences for animation speed
    this.unsubAnimation = preferencesStore.select(selectAnimationDuration, (duration) => {
      this.setState({ animationDuration: duration });
    });

    // Combined selector subscription
    this.unsubAppStatus = selectAppStatus.subscribe((status) => {
      this._appStatus = status;
      this.render();
    });

    // Also subscribe to any change to throttle logs and ensure UI re-renders on count changes
    this.unsubscribe = counterStore.subscribe(() => { this.render(); this.logInc(); });
  }

  onUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubEven) this.unsubEven();
    if (this.unsubDouble) this.unsubDouble();
    if (this.unsubCategory) this.unsubCategory();
    if (this.unsubAnimation) this.unsubAnimation();
    if (this.unsubAppStatus) this.unsubAppStatus();
  }
  template() {
    const { count } = counterStore.getState();
    const { theme, animationSpeed } = preferencesStore.getState();
    const appStatus = this._appStatus || {};

    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Advanced Counter</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Multi-store state management with complex selectors</p>
          </div>
          
          <div class="${this.vs('flex items-center justify-center gap-4 mb-6')}">
            <button id="dec" class="${this.v.button('secondary', 'lg')}">-</button>
            <div class="${this.vs({
              base: {
                fontSize: '3rem',
                fontWeight: '700',
                color: '#0ea5e9',
                minWidth: '120px',
                textAlign: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '2px solid #bae6fd',
                transition: `all ${this.state.animationDuration}ms ease`
              },
              dark: {
                backgroundColor: '#0c4a6e',
                borderColor: '#0284c7',
                color: '#7dd3fc'
              }
            })}">${count}</div>
            <button id="inc" class="${this.v.button('primary', 'lg')}">+</button>
          </div>
          
          <div class="${this.vs('grid grid-cols-2 md:grid-cols-4 gap-2 mb-6')}">
            <button id="inc2" class="${this.v.button('primary', 'sm')}">++ twice</button>
            <button id="reset" class="${this.v.button('ghost', 'sm')}">Reset</button>
            <button id="replace10" class="${this.v.button('secondary', 'sm')}">Set to 10</button>
            <button id="toggle-advanced" class="${this.v.button(this.state.showAdvanced ? 'secondary' : 'outline', 'sm')}">
              ${this.state.showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>

          ${this.state.showAdvanced ? this.html`
            <div class="${this.vs({
              base: {
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem'
              },
              dark: {
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }
            })}">
              <h3 class="${this.vs({
                base: {
                  margin: '0 0 1rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827'
                },
                dark: {
                  color: '#f9fafb'
                }
              })}">Advanced State Management</h3>

              <div class="${this.vs('grid grid-cols-1 md:grid-cols-3 gap-4 mb-4')}">
                <div class="${this.vs({
                  base: {
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  },
                  dark: {
                    backgroundColor: '#374151'
                  }
                })}">
                  <div class="${this.vs('text-sm text-neutral-600 dark:text-neutral-400')}">Category</div>
                  <div class="${this.vs({
                    base: {
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: this._category === 'zero' ? '#6b7280' : this._category === 'positive' ? '#059669' : '#dc2626'
                    }
                  })}">${utils.escapeHtml(this._category || 'unknown')}</div>
                </div>

                <div class="${this.vs({
                  base: {
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  },
                  dark: {
                    backgroundColor: '#374151'
                  }
                })}">
                  <div class="${this.vs('text-sm text-neutral-600 dark:text-neutral-400')}">App Status</div>
                  <div class="${this.vs({
                    base: {
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: appStatus.online ? '#059669' : '#dc2626'
                    }
                  })}">${utils.escapeHtml(appStatus.status || 'unknown')}</div>
                </div>

                <div class="${this.vs({
                  base: {
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  },
                  dark: {
                    backgroundColor: '#374151'
                  }
                })}">
                  <div class="${this.vs('text-sm text-neutral-600 dark:text-neutral-400')}">Animation</div>
                  <div class="${this.vs({
                    base: {
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#0ea5e9'
                    }
                  })}">${animationSpeed} (${this.state.animationDuration}ms)</div>
                </div>
              </div>

              <div class="${this.vs({
                base: {
                  padding: '1rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd'
                },
                dark: {
                  backgroundColor: '#0c4a6e',
                  borderColor: '#0284c7'
                }
              })}">
                <div class="${this.vs('text-sm text-blue-700 dark:text-blue-300')}">
                  <strong>Store States:</strong><br>
                  Counter: ${count} | Double: ${this._double || (count*2)} | Even: ${this._isEven ? 'Yes' : 'No'}<br>
                  Theme: ${theme} | Online: ${appStatus.online ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          ` : ''}
          
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
            <p class="${this.vs('text-sm text-green-700 dark:text-green-300')}">
              Multi-store state management with memoized selectors, update batching, debounced operations, and cross-store synchronization.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

// Fetch Demo Page with Query Cache
class FetchPage extends VelvetComponent {
  constructor() {
    super(null, {
      loading: false,
      error: null,
      data: null,
      cacheEnabled: true,
      backgroundRefresh: false,
      queryKey: 'demo-data'
    });
  }

  onCreate() {
    this
      .on('click', '#load', this.loadData)
      .on('click', '#load-cached', this.loadWithCache)
      .on('click', '#invalidate', this.invalidateCache)
      .on('click', '#background-refresh', this.toggleBackgroundRefresh)
      .on('change', '#cache-toggle', (e) => this.setState({ cacheEnabled: e.target.checked }));

    // Auto-load data if cache exists
    this.loadWithCache();
  }

  async loadData() {
    this.setState({ loading: true, error: null });
    try {
      const api = http.withBase('/examples', { timeout: 2000 });
      const data = await api.get('/data.json');
      await new Promise(r => setTimeout(r, 400)); // Simulate delay
      this.setState({ data, loading: false });
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.setState({ error: msg, loading: false });
    }
  }

  async loadWithCache() {
    if (!this.state.cacheEnabled) {
      return this.loadData();
    }

    this.setState({ loading: true, error: null });

    try {
      // Use Query cache for network request management
      const result = await Query.fetch(
        this.state.queryKey,
        () => http.withBase('/examples', { timeout: 2000 }).get('/data.json'),
        {
          staleTime: 30000, // Cache for 30 seconds
          cacheTime: 300000, // Keep in memory for 5 minutes
          refetchOnWindowFocus: this.state.backgroundRefresh
        }
      );

      this.setState({ data: result.data, loading: false });
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.setState({ error: msg, loading: false });
    }
  }

  invalidateCache() {
    Query.invalidate(this.state.queryKey);
    console.log('Cache invalidated for:', this.state.queryKey);
  }

  toggleBackgroundRefresh() {
    this.setState({ backgroundRefresh: !this.state.backgroundRefresh });
    if (this.state.backgroundRefresh) {
      // Start background refresh
      this.startBackgroundRefresh();
    } else {
      // Stop background refresh
      if (this._refreshInterval) {
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
    }
  }

  startBackgroundRefresh() {
    this._refreshInterval = setInterval(() => {
      if (this.state.cacheEnabled && this.state.backgroundRefresh) {
        Query.refetch(this.state.queryKey);
      }
    }, 10000); // Refresh every 10 seconds
  }

  onUnmount() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    // Clean up Query subscriptions
    Query.unsubscribe(this.state.queryKey);
  }
  template() {
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Query Cache Demo</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Advanced network request management with caching, background refresh, and invalidation</p>
          </div>

          <div class="${this.vs('grid grid-cols-1 md:grid-cols-2 gap-4 mb-6')}">
            <div class="${this.vs({
              base: {
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              },
              dark: {
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }
            })}">
              <h3 class="${this.vs({
                base: {
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827'
                },
                dark: {
                  color: '#f9fafb'
                }
              })}">Cache Settings</h3>

              <div class="${this.vs('space-y-3')}">
                <label class="${this.vs('flex items-center gap-2')}">
                  <input
                    type="checkbox"
                    id="cache-toggle"
                    ${this.state.cacheEnabled ? 'checked' : ''}
                    class="${this.vs({
                      base: {
                        width: '1rem',
                        height: '1rem',
                        accentColor: '#0ea5e9'
                      }
                    })}"
                  >
                  <span class="${this.vs('text-sm text-neutral-700 dark:text-neutral-300')}">Enable Query Cache</span>
                </label>

                <div class="${this.vs('flex items-center gap-2')}">
                  <button
                    id="background-refresh"
                    class="${this.v.button(this.state.backgroundRefresh ? 'primary' : 'outline', 'sm')}"
                  >
                    ${this.state.backgroundRefresh ? 'Pause' : 'Start'} Background Refresh
                  </button>
                  <span class="${this.vs('text-xs text-neutral-500')}">
                    ${this.state.backgroundRefresh ? 'Every 10s' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div class="${this.vs({
              base: {
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              },
              dark: {
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }
            })}">
              <h3 class="${this.vs({
                base: {
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827'
                },
                dark: {
                  color: '#f9fafb'
                }
              })}">Query Actions</h3>

              <div class="${this.vs('grid grid-cols-1 gap-2')}">
                <button
                  id="load-cached"
                  class="${this.v.button('primary', 'sm')}"
                  ${this.state.loading ? 'disabled' : ''}
                >
                  ${this.state.loading ? 'Loading...' : 'Load with Cache'}
                </button>

                <button
                  id="load"
                  class="${this.v.button('secondary', 'sm')}"
                  ${this.state.loading ? 'disabled' : ''}
                >
                  Load Fresh
                </button>

                <button
                  id="invalidate"
                  class="${this.v.button('outline', 'sm')}"
                >
                  Invalidate Cache
                </button>
              </div>
            </div>
          </div>

          ${this.state.error ? this.html`
            <div class="${this.vs({
              base: {
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626'
              },
              dark: {
                backgroundColor: '#451a1a',
                borderColor: '#7f1d1d',
                color: '#fca5a5'
              }
            })}">
              <div class="${this.vs('flex items-center gap-2')}">

                <span class="${this.vs('font-medium')}">Error:</span>
                <span>${utils.escapeHtml(this.state.error)}</span>
              </div>
            </div>
          ` : ''}

          ${this.state.data ? this.html`
            <div class="${this.vs({
              base: {
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              },
              dark: {
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }
            })}">
              <div class="${this.vs({
                base: {
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f1f5f9',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#475569'
                },
                dark: {
                  backgroundColor: '#334155',
                  borderBottomColor: '#475569',
                  color: '#cbd5e1'
                }
              })}">
                Cached Response Data
                ${this.state.cacheEnabled ? this.html`
                  <span class="${this.vs({
                    base: {
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#059669',
                      fontWeight: '500'
                    }
                  })}">(Cached)</span>
                ` : ''}
              </div>
              <pre class="${this.vs({
                base: {
                  margin: '0',
                  padding: '1rem',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  overflow: 'auto',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
                }
              })}">${utils.escapeHtml(JSON.stringify(this.state.data, null, 2))}</pre>
            </div>
          ` : ''}

          <div class="${this.vs({
            base: {
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px'
            },
            dark: {
              backgroundColor: '#0c4a6e',
              borderColor: '#0284c7'
            }
          })}">
            <h4 class="${this.vs({
              base: {
                margin: '0 0 0.75rem 0',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#0c4a6e'
              },
              dark: {
                color: '#7dd3fc'
              }
            })}">Query Cache Features</h4>
            <ul class="${this.vs({
              base: {
                margin: '0',
                paddingLeft: '1.25rem',
                fontSize: '0.875rem',
                color: '#374151',
                lineHeight: '1.6'
              },
              dark: {
                color: '#d1d5db'
              }
            })}">
              <li><strong>Automatic Caching:</strong> 30s stale time, 5min cache time</li>
              <li><strong>Background Refresh:</strong> Refetch data automatically</li>
              <li><strong>Cache Invalidation:</strong> Manually clear cached data</li>
              <li><strong>Request Deduplication:</strong> Multiple calls use cached result</li>
              <li><strong>Error Recovery:</strong> Cached data shown on network failure</li>
            </ul>
          </div>
        </div>
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

// Global Error Boundary Component
class GlobalErrorBoundary extends VelvetComponent {
  constructor() {
    super(null, {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  }

  onError(error, errorInfo) {
    console.error('Global Error Boundary caught:', error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  renderError(error) {
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card()}">
          <div class="${this.vs('text-center mb-6')}">
            <div class="${this.vs({
              base: {
                fontSize: '4rem',
                marginBottom: '1rem'
              }
            })}">!</div>
            <h2 class="${this.vs('text-h2 mb-2 text-red-600 dark:text-red-400')}">Application Error</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Something went wrong in the application</p>
          </div>

          <div class="${this.vs({
            base: {
              padding: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            },
            dark: {
              backgroundColor: '#451a1a',
              borderColor: '#7f1d1d'
            }
          })}">
            <div class="${this.vs('flex items-center gap-2 mb-3')}">
              <span class="${this.vs('font-medium')}">Error Count:</span>
              <span class="${this.vs('px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm font-medium')}">
                ${this.state.errorCount}
              </span>
            </div>
            <div class="${this.vs('text-sm text-red-700 dark:text-red-300')}">
              <strong>${utils.escapeHtml(error.message || 'Unknown Error')}</strong>
            </div>
          </div>

          <div class="${this.vs('flex gap-3 justify-center')}">
            <button
              class="${this.v.button('primary', 'md')}"
              onclick="window.location.reload()"
            >
              Reload App
            </button>
            <button
              class="${this.v.button('secondary', 'md')}"
              onclick="this.setState({ hasError: false, error: null, errorInfo: null })"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    `;
  }

  template() {
    // If there's an error, render the error UI
    if (this.state.hasError) {
      return this.renderError(this.state.error);
    }

    // Otherwise, render the children (this would be the main app content)
    return this.html`
      <div id="app-content">
        <!-- App content will be mounted here -->
      </div>
    `;
  }
}

// Error Demo Page with error boundary fallback
class ErrorPage extends VelvetComponent {
  constructor() {
    super(null, {
      crash: false,
      asyncError: false,
      networkError: false,
      validationError: false,
      errorHistory: []
    });
  }

  onCreate() {
    this
      .on('click', '#crashSelf', () => this.triggerSyncError())
      .on('click', '#asyncError', () => this.triggerAsyncError())
      .on('click', '#networkError', () => this.triggerNetworkError())
      .on('click', '#validationError', () => this.triggerValidationError())
      .on('click', '#resetErr', () => this.resetErrors())
      .on('click', '#clearHistory', () => this.setState({ errorHistory: [] }));
  }
  triggerSyncError() {
    this.setState({ crash: true });
    this.addToHistory('Synchronous Error', 'Runtime error thrown in template');
  }

  async triggerAsyncError() {
    this.setState({ asyncError: true });
    this.addToHistory('Async Error', 'Error in async operation');
    try {
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Async operation failed')), 1000));
    } catch (error) {
      throw new Error('Async Error: ' + error.message);
    }
  }

  triggerNetworkError() {
    this.setState({ networkError: true });
    this.addToHistory('Network Error', 'Failed to fetch data');
    throw new Error('Network Error: Unable to connect to server');
  }

  triggerValidationError() {
    this.setState({ validationError: true });
    this.addToHistory('Validation Error', 'Invalid input data');
    throw new Error('Validation Error: Required field is missing');
  }

  resetErrors() {
    this.setState({
      crash: false,
      asyncError: false,
      networkError: false,
      validationError: false
    });
  }

  addToHistory(type, description) {
    const history = [...this.state.errorHistory];
    history.unshift({
      id: Date.now(),
      type,
      description,
      timestamp: new Date().toLocaleTimeString()
    });
    this.setState({ errorHistory: history.slice(0, 10) }); // Keep last 10
  }

  renderError(err) {
    const errorType = err.message.includes('Async') ? 'Async Error' :
                     err.message.includes('Network') ? 'Network Error' :
                     err.message.includes('Validation') ? 'Validation Error' : 'Runtime Error';

    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card()}">
          <div class="${this.vs('text-center mb-6')}">
            <div class="${this.vs({
              base: {
                fontSize: '4rem',
                marginBottom: '1rem'
              }
            })}">!</div>
            <h2 class="${this.vs('text-h2 mb-2 text-red-600 dark:text-red-400')}">Error Boundary</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Caught a ${errorType.toLowerCase()}</p>
          </div>

          <div class="${this.vs({
            base: {
              padding: '1.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            },
            dark: {
              backgroundColor: '#451a1a',
              borderColor: '#7f1d1d'
            }
          })}">
            <div class="${this.vs('flex items-center gap-2 mb-3')}">
              <span class="${this.vs('font-medium')}">Error Type:</span>
              <span class="${this.vs('px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm font-medium')}">
                ${errorType}
              </span>
            </div>
            <div class="${this.vs('text-sm text-red-700 dark:text-red-300')}">
              <strong>${utils.escapeHtml(err.message || 'Unknown Error')}</strong>
            </div>
          </div>

          <div class="${this.vs('flex gap-3 justify-center')}">
            <button id="resetErr" class="${this.v.button('primary', 'md')}">
              Reset & Continue
            </button>
          </div>
        </div>
      </div>
    `;
  }

  template() {
    // Trigger different types of errors
    if (this.state.crash) {
      throw new Error('Runtime Error: Something went wrong in ErrorPage component');
    }
    if (this.state.asyncError) {
      // This will be caught by the renderError method
      setTimeout(() => { throw new Error('Async Error: Delayed error occurred'); }, 100);
    }
    if (this.state.networkError) {
      throw new Error('Network Error: Failed to connect to server');
    }
    if (this.state.validationError) {
      throw new Error('Validation Error: Invalid data provided');
    }

    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Error Boundaries Demo</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">Test different types of errors and see how they're handled</p>
          </div>

          <div class="${this.vs('grid grid-cols-1 md:grid-cols-2 gap-4 mb-6')}">
            <div class="${this.vs({
              base: {
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              },
              dark: {
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }
            })}">
              <h3 class="${this.vs({
                base: {
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827'
                },
                dark: {
                  color: '#f9fafb'
                }
              })}">Error Triggers</h3>

              <div class="${this.vs('grid grid-cols-1 gap-2')}">
                <button id="crashSelf" class="${this.v.button('primary', 'sm')}">
                  Runtime Error
                </button>
                <button id="asyncError" class="${this.v.button('secondary', 'sm')}">
                  Async Error
                </button>
                <button id="networkError" class="${this.v.button('outline', 'sm')}">
                  Network Error
                </button>
                <button id="validationError" class="${this.v.button('outline', 'sm')}">
                  Validation Error
                </button>
              </div>
            </div>

            <div class="${this.vs({
              base: {
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              },
              dark: {
                backgroundColor: '#1e293b',
                borderColor: '#334155'
              }
            })}">
              <h3 class="${this.vs({
                base: {
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827'
                },
                dark: {
                  color: '#f9fafb'
                }
              })}">Error History</h3>

              <div class="${this.vs('space-y-2')}">
                ${this.state.errorHistory.length === 0 ? this.html`
                  <div class="${this.vs('text-sm text-neutral-500 italic')}">
                    No errors triggered yet
                  </div>
                ` : this.state.errorHistory.slice(0, 3).map(error => this.html`
                  <div class="${this.vs({
                    base: {
                      padding: '0.5rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px'
                    },
                    dark: {
                      backgroundColor: '#451a1a',
                      borderColor: '#7f1d1d'
                    }
                  })}">
                    <div class="${this.vs('text-xs font-medium text-red-700 dark:text-red-300')}">
                      ${error.type}
                    </div>
                    <div class="${this.vs('text-xs text-red-600 dark:text-red-400')}">
                      ${error.timestamp}
                    </div>
                  </div>
                `).join('')}

                ${this.state.errorHistory.length > 3 ? this.html`
                  <div class="${this.vs('text-xs text-neutral-500')}">
                    +${this.state.errorHistory.length - 3} more...
                  </div>
                ` : ''}
              </div>

              ${this.state.errorHistory.length > 0 ? this.html`
                <button id="clearHistory" class="${this.v.button('ghost', 'xs')}">
                  Clear History
                </button>
              ` : ''}
            </div>
          </div>

          <div class="${this.vs({
            base: {
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px'
            },
            dark: {
              backgroundColor: '#451a03',
              borderColor: '#d97706'
            }
          })}">
            <h4 class="${this.vs({
              base: {
                margin: '0 0 0.75rem 0',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#d97706'
              },
              dark: {
                color: '#fbbf24'
              }
            })}">Safety Notice</h4>
            <p class="${this.vs('text-sm text-amber-800 dark:text-amber-200')}">
              These buttons will intentionally trigger errors to demonstrate error boundary functionality.
              The errors are caught safely and won't crash the entire application.
            </p>
          </div>
        </div>
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

// Router Setup with Advanced Guards (hash mode for static hosting)
const router = new Router({ 
  mode: 'hash', 
  root: '#app', 
  notFound: NotFound, 
  beforeEach: async (to, from) => {
    console.log('Navigating:', from, '->', to); 

    // Simulate authentication check
    if (to === '/protected') {
      const isAuthenticated = preferencesStore.getState().notifications; // Using notifications as auth flag for demo
      if (!isAuthenticated) {
        console.warn('Access denied to protected route');
        // Could redirect to login page here
        return false; // Cancel navigation
      }
    }

    // Simulate loading state for certain routes
    if (to === '/loading-demo') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async check
    }

    // Update navigation history in app store
    appStore.setState({
      lastActivity: new Date().toISOString(),
      currentRoute: to
    });

    console.log('Navigation allowed, proceeding...');
    return true; 
  },
  afterEach: (to, from) => {
    console.log('Navigation completed:', from, '->', to);

    // Track page views
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: to,
        page_location: window.location.href
      });
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
// Protected Route Component
class ProtectedPage extends VelvetComponent {
  template() {
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Protected Page</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">This page is protected by navigation guards</p>
          </div>

          <div class="${this.vs({
            base: {
              padding: '2rem',
              backgroundColor: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '8px',
              textAlign: 'center'
            },
            dark: {
              backgroundColor: '#022c22',
              borderColor: '#059669'
            }
          })}">
            <div class="${this.vs({
              base: {
                fontSize: '3rem',
                marginBottom: '1rem'
              }
            })}">✓</div>
            <h3 class="${this.vs({
              base: {
                margin: '0 0 1rem 0',
                color: '#059669',
                fontSize: '1.25rem',
                fontWeight: '600'
              },
              dark: {
                color: '#34d399'
              }
            })}">Access Granted!</h3>
            <p class="${this.vs({
              base: {
                margin: '0',
                color: '#374151'
              },
              dark: {
                color: '#d1d5db'
              }
            })}">You have successfully passed the navigation guard check.</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Loading Demo Route Component
class LoadingDemoPage extends VelvetComponent {
  template() {
    return this.html`
      <div class="${this.v.container('md')}">
        <div class="${this.v.card(true)}">
          <div class="${this.vs('text-center mb-6')}">
            <h2 class="${this.vs('text-h2 mb-2')}">Loading Demo</h2>
            <p class="${this.vs('text-neutral-600 dark:text-neutral-400')}">This page demonstrates navigation guards with loading states</p>
          </div>

          <div class="${this.vs({
            base: {
              padding: '2rem',
              backgroundColor: '#fef3c7',
              border: '2px solid #fcd34d',
              borderRadius: '8px',
              textAlign: 'center'
            },
            dark: {
              backgroundColor: '#451a03',
              borderColor: '#d97706'
            }
          })}">
            <div class="${this.vs({
              base: {
                fontSize: '3rem',
                marginBottom: '1rem'
              }
            })}">*</div>
            <h3 class="${this.vs({
              base: {
                margin: '0 0 1rem 0',
                color: '#d97706',
                fontSize: '1.25rem',
                fontWeight: '600'
              },
              dark: {
                color: '#fbbf24'
              }
            })}">Navigation Guard Passed!</h3>
            <p class="${this.vs({
              base: {
                margin: '0',
                color: '#374151'
              },
              dark: {
                color: '#d1d5db'
              }
            })}">This page was delayed by 1 second during navigation to simulate async validation.</p>
          </div>
        </div>
      </div>
    `;
  }
}

router
  .route('/', HomePage)
  .route('/todo', TodoPage)
  .route('/counter', CounterPage)
  .route('/fetch', FetchPage)
  .route('/dom', DomPage)
  .route('/users', UsersPage)
  .route('/users/:id', () => import('./users.js'))
  .route('/error', ErrorPage)
  .route('/about', AboutPage)
  .route('/protected', ProtectedPage)
  .route('/loading-demo', LoadingDemoPage);

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
