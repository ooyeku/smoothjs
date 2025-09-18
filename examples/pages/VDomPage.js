import { defineComponent, utils, Velvet } from '../../index.js';
import { SmoothComponentVDOM } from '../../src/vdom/SmoothComponentVDOM.js';
import { defineComponentVDOM } from '../../src/vdom/defineComponentVDOM.js';

// Performance monitoring
let renderCount = 0;
let lastRenderTime = 0;

function updatePerformanceInfo() {
  const now = performance.now();
  const timeSinceLastRender = now - lastRenderTime;
  lastRenderTime = now;
  
  const performanceInfo = document.getElementById('performance-info');
  if (performanceInfo) {
    performanceInfo.innerHTML = `
      <strong>Performance Info:</strong><br>
      Render Count: ${renderCount}<br>
      Time Since Last Render: ${timeSinceLastRender.toFixed(2)}ms<br>
      Memory Usage: ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'}
    `;
  }
}

// Virtual DOM Toggle Component
const VDomToggle = defineComponent(({ html, useState, on }) => {
  const [vdomEnabled, setVdomEnabled] = useState(true);
  
  on('click', '#vdom-toggle', () => {
    const newState = !vdomEnabled;
    setVdomEnabled(newState);
    
    // Update global state and re-render all components
    window.vdomEnabled = newState;
    if (window.counterComponent) {
      window.counterComponent.setVDOMEnabled(newState);
      window.counterComponent.render();
    }
    if (window.todoComponent) {
      window.todoComponent.setVDOMEnabled(newState);
      window.todoComponent.render();
    }
    if (window.listComponent) {
      window.listComponent.setVDOMEnabled(newState);
      window.listComponent.render();
    }
  });
  
  const render = () => html`
    <button id="vdom-toggle" class="vdom-toggle ${vdomEnabled ? '' : 'disabled'}">
      VDOM: ${vdomEnabled ? 'ON' : 'OFF'}
    </button>
  `;
  
  return { render };
});

// Counter Component with Virtual DOM
class CounterVDOM extends SmoothComponentVDOM {
  constructor() {
    super(null, { count: 0, step: 1 });
  }
  
  vtemplate() {
    const { count, step } = this.state;
    
    return this.h('div', { className: 'demo-section' }, [
      this.h('h2', { className: 'demo-title' }, 'Counter with Virtual DOM'),
      this.h('p', { className: 'demo-description' }, 
        'This counter uses virtual DOM for efficient updates. ' +
        'Notice how only the changed elements are updated in the DOM.'
      ),
      this.h('div', { className: 'demo-controls' }, [
        this.h('button', { 
          onclick: () => this.setState({ count: count - step })
        }, 'Decrease'),
        this.h('button', { 
          onclick: () => this.setState({ count: count + step })
        }, 'Increase'),
        this.h('button', { 
          onclick: () => this.setState({ step: step === 1 ? 5 : 1 })
        }, `Step: ${step}`)
      ]),
      this.h('div', { className: 'counter' }, `Count: ${count}`),
      this.h('div', { id: 'performance-info', className: 'performance-info' })
    ]);
  }
  
  render() {
    renderCount++;
    updatePerformanceInfo();
    super.render();
  }
}

// Todo Component with Virtual DOM
class TodoVDOM extends SmoothComponentVDOM {
  constructor() {
    super(null, { 
      todos: [
        { id: 1, text: 'Learn Virtual DOM', completed: false },
        { id: 2, text: 'Build amazing apps', completed: false },
        { id: 3, text: 'Optimize performance', completed: true }
      ],
      newTodo: ''
    });
  }
  
  vtemplate() {
    const { todos, newTodo } = this.state;
    
    return this.h('div', { className: 'demo-section' }, [
      this.h('h2', { className: 'demo-title' }, 'Todo List with Virtual DOM'),
      this.h('p', { className: 'demo-description' }, 
        'This todo list demonstrates keyed reconciliation. ' +
        'Items can be reordered, added, or removed efficiently.'
      ),
      this.h('div', { className: 'demo-controls' }, [
        this.h('input', {
          type: 'text',
          placeholder: 'Add new todo...',
          value: newTodo,
          oninput: (e) => this.setState({ newTodo: e.target.value }),
          onkeypress: (e) => {
            if (e.key === 'Enter' && newTodo.trim()) {
              this.addTodo();
            }
          }
        }),
        this.h('button', { 
          onclick: () => this.addTodo(),
          disabled: !newTodo.trim()
        }, 'Add Todo'),
        this.h('button', { 
          onclick: () => this.clearCompleted()
        }, 'Clear Completed'),
        this.h('button', { 
          onclick: () => this.shuffleTodos()
        }, 'Shuffle')
      ]),
      this.h('div', {}, todos.map(todo => 
        this.h('div', { 
          key: todo.id,
          className: `todo-item ${todo.completed ? 'completed' : ''}`
        }, [
          this.h('input', {
            type: 'checkbox',
            className: 'todo-checkbox',
            checked: todo.completed,
            onchange: () => this.toggleTodo(todo.id)
          }),
          this.h('span', { className: 'todo-text' }, todo.text),
          this.h('button', {
            className: 'todo-delete',
            onclick: () => this.deleteTodo(todo.id)
          }, 'Delete')
        ])
      ))
    ]);
  }
  
  addTodo() {
    const { todos, newTodo } = this.state;
    if (!newTodo.trim()) return;
    
    const newId = Math.max(...todos.map(t => t.id), 0) + 1;
    this.setState({
      todos: [...todos, { id: newId, text: newTodo.trim(), completed: false }],
      newTodo: ''
    });
  }
  
  toggleTodo(id) {
    const { todos } = this.state;
    this.setState({
      todos: todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    });
  }
  
  deleteTodo(id) {
    const { todos } = this.state;
    this.setState({
      todos: todos.filter(todo => todo.id !== id)
    });
  }
  
  clearCompleted() {
    const { todos } = this.state;
    this.setState({
      todos: todos.filter(todo => !todo.completed)
    });
  }
  
  shuffleTodos() {
    const { todos } = this.state;
    const shuffled = [...todos].sort(() => Math.random() - 0.5);
    this.setState({ todos: shuffled });
  }
  
  render() {
    renderCount++;
    updatePerformanceInfo();
    super.render();
  }
}

// Functional Component with Virtual DOM
const ListVDOM = defineComponentVDOM(({ useState, h, t }) => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [newItem, setNewItem] = useState('');
  
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };
  
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const vrender = () => h('div', { className: 'demo-section' }, [
    h('h2', { className: 'demo-title' }, 'Functional Component with Virtual DOM'),
    h('p', { className: 'demo-description' }, 
      'This demonstrates virtual DOM with functional components using hooks.'
    ),
    h('div', { className: 'demo-controls' }, [
      h('input', {
        type: 'text',
        placeholder: 'Add new item...',
        value: newItem,
        oninput: (e) => setNewItem(e.target.value),
        onkeypress: (e) => {
          if (e.key === 'Enter') addItem();
        }
      }),
      h('button', { 
        onclick: addItem,
        disabled: !newItem.trim()
      }, 'Add Item')
    ]),
    h('ul', {}, items.map((item, index) => 
      h('li', { 
        key: index,
        style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '5px 0',
          borderBottom: '1px solid #eee'
        }
      }, [
        t(item),
        h('button', {
          onclick: () => removeItem(index),
          style: { background: '#dc3545', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '3px' }
        }, 'Remove')
      ])
    ))
  ]);
  
  return { vrender };
});

// Main VDOM Page
export const VDomPage = defineComponent((ctx) => {
  const { html, on, useState } = ctx;
  const { vs } = Velvet.useVelvet(ctx);
  const [currentDemo, setCurrentDemo] = useState('counter');
  
  on('click', '#demo-counter', () => setCurrentDemo('counter'));
  on('click', '#demo-todo', () => setCurrentDemo('todo'));
  on('click', '#demo-list', () => setCurrentDemo('list'));
  
  const onMount = () => {
    // Initialize global VDOM state
    window.vdomEnabled = true;
    
    // Mount child components
    const counterComponent = new CounterVDOM();
    counterComponent.setVDOMEnabled(true);
    counterComponent.mount('#counter-demo');
    
    const todoComponent = new TodoVDOM();
    todoComponent.setVDOMEnabled(true);
    todoComponent.mount('#todo-demo');
    
    const listComponent = new ListVDOM();
    listComponent.setVDOMEnabled(true);
    listComponent.mount('#list-demo');
    
    // Store references globally for toggle
    window.counterComponent = counterComponent;
    window.todoComponent = todoComponent;
    window.listComponent = listComponent;
  };
  
  const render = () => {
    const outerClass = vs({ base: { maxWidth: '960px', margin: '0 auto', padding: '0.75rem 1rem' } });
    const cardClass = vs({ base: { background: 'var(--card)', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08)', border: '1px solid var(--border)' } });
    const btn = vs({ base: { padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'inherit' }, hover: { background: 'var(--bg)' } });
    const btnPrimary = vs({ base: { padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--primary)', background: 'var(--primary)', color: '#fff' }, hover: { background: 'var(--primary)', borderColor: 'var(--primary)' } });
    const demoSection = vs({ base: { background: 'var(--card)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,.1)', border: '1px solid var(--border)' } });
    const demoTitle = vs({ base: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' } });
    const demoDescription = vs({ base: { color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: '1.5' } });
    const demoControls = vs({ base: { marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } });
    const counter = vs({ base: { fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', minWidth: '120px', textAlign: 'center', padding: '0.5rem 1rem', background: 'var(--bg)', borderRadius: '12px', border: '2px solid var(--border)' } });
    const todoItem = vs({ base: { display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '5px', background: 'var(--card)' } });
    const todoItemCompleted = vs({ base: { opacity: '0.6', textDecoration: 'line-through' } });
    const todoCheckbox = vs({ base: { marginRight: '10px' } });
    const todoText = vs({ base: { flex: '1' } });
    const todoDelete = vs({ base: { background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }, hover: { background: '#c82333' } });
    const performanceInfo = vs({ base: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px', marginTop: '20px', fontFamily: 'monospace', fontSize: '0.9em' } });
    const vdomToggle = vs({ base: { position: 'fixed', top: '20px', right: '20px', background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', zIndex: '1000' }, hover: { background: '#218838' } });
    const vdomToggleDisabled = vs({ base: { background: '#dc3545' }, hover: { background: '#c82333' } });
    
    return html`
      <div class="${outerClass}">
        <div class="${cardClass}">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h1 class="${demoTitle}">SmoothJS Virtual DOM Demo</h1>
            <p class="${demoDescription}">
              Experience the power of virtual DOM with SmoothJS. Toggle between virtual DOM and direct DOM manipulation 
              to see the performance differences and understand how virtual DOM optimizes updates.
            </p>
          </div>
          
          <div class="${demoControls}" style="justify-content: center;">
            <button id="demo-counter" class="${currentDemo === 'counter' ? btnPrimary : btn}">
              Counter Demo
            </button>
            <button id="demo-todo" class="${currentDemo === 'todo' ? btnPrimary : btn}">
              Todo List Demo
            </button>
            <button id="demo-list" class="${currentDemo === 'list' ? btnPrimary : btn}">
              Functional Demo
            </button>
          </div>
          
          <div id="counter-demo" style="display: ${currentDemo === 'counter' ? 'block' : 'none'};"></div>
          <div id="todo-demo" style="display: ${currentDemo === 'todo' ? 'block' : 'none'};"></div>
          <div id="list-demo" style="display: ${currentDemo === 'list' ? 'block' : 'none'};"></div>
          
          <div class="${performanceInfo}" id="performance-info">
            <strong>Performance Info:</strong><br>
            Render Count: ${renderCount}<br>
            Time Since Last Render: 0ms<br>
            Memory Usage: ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'}
          </div>
        </div>
      </div>
      
      <div id="vdom-toggle-host"></div>
      
      <style>
        .vdom-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          z-index: 1000;
        }
        
        .vdom-toggle:hover {
          background: #218838;
        }
        
        .vdom-toggle.disabled {
          background: #dc3545;
        }
        
        .vdom-toggle.disabled:hover {
          background: #c82333;
        }
        
        .demo-section {
          background: var(--card);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .demo-title {
          color: var(--text);
          margin-bottom: 15px;
          font-size: 1.5em;
        }
        
        .demo-description {
          color: var(--muted);
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .demo-controls {
          margin-bottom: 20px;
        }
        
        .demo-controls button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
          margin-bottom: 10px;
        }
        
        .demo-controls button:hover {
          opacity: 0.9;
        }
        
        .demo-controls button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .counter {
          font-size: 2em;
          font-weight: bold;
          color: var(--primary);
          margin: 20px 0;
        }
        
        .todo-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 4px;
          margin-bottom: 5px;
          background: var(--card);
        }
        
        .todo-item.completed {
          opacity: 0.6;
          text-decoration: line-through;
        }
        
        .todo-checkbox {
          margin-right: 10px;
        }
        
        .todo-text {
          flex: 1;
        }
        
        .todo-delete {
          background: #dc3545;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
        }
        
        .todo-delete:hover {
          background: #c82333;
        }
        
        .performance-info {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 10px;
          margin-top: 20px;
          font-family: monospace;
          font-size: 0.9em;
        }
      </style>
    `;
  };
  
  return { render, onMount };
});
