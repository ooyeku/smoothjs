import { Component } from '../../index.js';

// Loading Demo Route Component
export class LoadingDemoPage extends Component {
  template() {
    return this.html`
      <div style="max-width: 960px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Loading Demo</h2>
            <p style="margin: 0; color: #6b7280;">This page demonstrates navigation guards with loading states</p>
          </div>

          <div style="padding: 2rem; background: #fef3c7; border: 2px solid #fcd34d; border-radius: 8px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">*</div>
            <h3 style="margin: 0 0 1rem 0; color: #d97706; font-size: 1.25rem; font-weight: 600;">Navigation Guard Passed!</h3>
            <p style="margin: 0; color: #374151;">This page was delayed by 1 second during navigation to simulate async validation.</p>
          </div>
        </div>
      </div>
    `;
  }
}
