import { defineComponentVDOM } from '../../src/vdom/defineComponentVDOM.js';

// Home Page (functional with Virtual DOM)
export const HomePage = defineComponentVDOM(({ h, t }) => {
  const vrender = () => {
    // Define styles directly instead of using Velvet hooks
    const outerClass = 'max-width: 960px; margin: 0 auto; padding: 0.75rem 1rem;';
    const cardClass = 'background: var(--card); border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid var(--border);';
    const demoItems = [
      { href: '#/todo', title: 'Todo App', desc: 'Local state management with createStore' },
      { href: '#/counter', title: 'Counter', desc: 'Advanced global state with selectors' },
      { href: '#/dom', title: 'DOM Manipulation', desc: 'Direct DOM access and utilities' },
      { href: '#/users', title: 'User Management', desc: 'Dynamic routing with parameters' },
      { href: '#/loading-demo', title: 'Loading Demo', desc: 'Navigation guards with async validation' },
      { href: '#/composition', title: 'Composition', desc: 'Context, portals, and children demos' },
      { href: '#/mutations', title: 'Mutations', desc: 'Optimistic updates, rollback, and invalidation' },
      { href: '#/forms', title: 'Forms', desc: 'Validation helpers + sanitized preview' },
      { href: '#/datatable', title: 'DataTable', desc: 'Sortable tables with selection and custom rendering' },
      { href: '#/design', title: 'Design System', desc: 'Buttons, Inputs, Modal, Tabs (a11y)'},
      { href: '#/vdom', title: 'Virtual DOM', desc: 'Efficient virtual DOM rendering and diffing' },
      { href: '#/error', title: 'Error Boundaries', desc: 'Error boundary fallback demo' },
      { href: '#/about', title: 'About', desc: 'Utilities, formatters, and version info' }
    ];

    
    return h('div', { style: outerClass }, [
      // Hero section
      h('div', {
        style: `${cardClass} background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; text-align: center;`
      }, [
        h('h1', {
          style: 'margin: 0 0 1rem 0; font-size: 2.25rem; font-weight: 700;'
        }, t('SmoothJS')),
        h('p', {
          style: 'margin: 0 0 1rem 0; font-size: 1.125rem; opacity: 0.9;'
        }, t('Explore minimal demos with beautiful design')),
        h('div', {
          style: 'display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;'
        }, [
          h('span', {
            style: 'padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.2); border-radius: 20px; font-size: 0.875rem;'
          }, t('Vite Dev')),
          h('span', {
            style: 'padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.2); border-radius: 20px; font-size: 0.875rem;'
          }, t('Zero Dependencies'))
        ])
      ]),
      
      // Demo grid
      h('div', {
        style: 'display: grid; gap: 1rem; grid-template-columns: repeat(1, 1fr);'
      }, demoItems.map(item => 
        h('a', {
          href: item.href,
          style: `${cardClass} display: block; padding: 1.5rem; text-decoration: none; color: inherit; transition: all 250ms ease;`
        }, [
          h('div', {
            style: 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;'
          }, [
            h('h3', {
              style: 'margin: 0; font-size: 1.125rem; font-weight: 600;'
            }, t(item.title))
          ]),
          h('p', {
            style: 'margin: 0; color: var(--muted); font-size: 0.875rem;'
          }, t(`— ${item.desc}`))
        ])
      )),
      
      // Info section
      h('div', {
        style: `${cardClass} margin-top: 2rem; padding: 1rem; background: var(--bg); border-radius: 8px; border: 1px solid var(--border);`
      }, [
        h('div', {
          style: 'display: flex; flex-direction: column; gap: 1rem;'
        }, [
          h('div', {
            style: 'padding: 1rem; background: var(--bg); border-radius: 6px; border: 1px solid var(--border);'
          }, [
            h('h4', {
              style: 'margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: var(--text);'
            }, t('Navigation Guards Active')),
            h('p', {
              style: 'margin: 0; font-size: 0.875rem; color: var(--muted);'
            }, [
              t('Try visiting '),
              h('strong', {}, t('/protected')),
              t(' (requires authentication) or '),
              h('strong', {}, t('/loading-demo')),
              t(' (shows async validation). Check the console for navigation logs!')
            ])
          ]),
          h('p', {
            style: 'margin: 0; font-size: 0.875rem; color: var(--primary);'
          }, t('Use the dark mode toggle in the top-right corner. Hash-based routing works on static hosting with nested routes, dynamic params, lazy loading, and active links.'))
        ])
      ])
    ]);
  };
  
  return { vrender };
});
