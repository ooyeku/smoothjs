import { Component } from '../../index.js';

// Home Page
export class HomePage extends Component {
  template() {
    return this.html`
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; text-align: center;">
        <h1 style="margin: 0 0 1rem 0; font-size: 2.25rem; font-weight: 700;">SmoothJS</h1>
        <p style="margin: 0 0 1rem 0; font-size: 1.125rem; opacity: 0.9;">Explore minimal demos with beautiful design</p>
        <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.2); border-radius: 20px; font-size: 0.875rem;">Vite Dev</span>
          <span style="padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.2); border-radius: 20px; font-size: 0.875rem;">Zero Dependencies</span>
        </div>
      </div>
      
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(1, 1fr);">
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
          <a href="${item.href}" ${item.attrs || ''} style="display: block; padding: 1.5rem; background: var(--card); border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); text-decoration: none; color: inherit; transition: all 250ms ease; border: 1px solid var(--border);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">${item.title}</h3>
            </div>
            <p style="margin: 0; color: var(--muted); font-size: 0.875rem;">— ${item.desc}</p>
          </a>
        `).join('')}
      </div>
      
      <div style="margin-top: 2rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="padding: 1rem; background: #f8fafc; border-radius: 6px; border: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: #374151;">Navigation Guards Active</h4>
            <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">
              Try visiting <strong>/protected</strong> (requires authentication) or <strong>/loading-demo</strong> (shows async validation).
              Check the console for navigation logs!
            </p>
          </div>

          <p style="margin: 0; font-size: 0.875rem; color: #1e40af;">
            Use the dark mode toggle in the top-right corner. Hash-based routing works on static hosting with nested routes, dynamic params, lazy loading, and active links.
          </p>
        </div>
      </div>
    `;
  }
}
