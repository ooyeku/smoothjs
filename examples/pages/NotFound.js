import { Component } from '../../index.js';

export class NotFound extends Component { 
  template() {
    return this.html`
      <div style="max-width: 960px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Not Found</h2>
            <p style="margin: 0 0 1.5rem 0; color: #6b7280;">Route does not exist.</p>
            <a href="#/" style="background: #0ea5e9; color: white; border: 1px solid #0ea5e9; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; text-decoration: none;">Go Home</a>
          </div>
        </div>
      </div>
    `;
  } 
}
