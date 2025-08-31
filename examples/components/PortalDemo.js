import { Component } from '../../index.js';

export class PortalDemo extends Component {
  constructor() {
    super(null, { show: true, count: 0 });
  }

  onCreate() {
    this.on('click', '#toggle', () => this.setState(prev => ({ show: !prev.show })));
    this.on('click', '#increment', () => this.setState(prev => ({ count: prev.count + 1 })));
  }

  template() {
    const portalMarker = this.state.show
      ? this.portal('#portal-target', () => this.html`
          <div data-key="portal" style="position:fixed; right: 1rem; bottom: 1rem; background: var(--card); color: inherit; border: 1px solid var(--border); border-radius: 8px; padding: .75rem 1rem; box-shadow: 0 6px 12px rgba(0,0,0,.15);">
            <div style="font-weight:600; margin-bottom:.25rem;">Portal Box</div>
            <div style="font-size:.9rem;">Count: ${this.state.count}</div>
          </div>
        `)
      : '';

    return this.html`
      <div style="display: grid; gap: .5rem;">
        <div class="muted" style="font-size:.9rem;">This component renders a floating box into #portal-target using portals.</div>
        <div class="row">
          <button id="toggle" class="btn" type="button">${this.state.show ? 'Hide' : 'Show'} Portal</button>
          <button id="increment" class="btn" type="button">Increment</button>
        </div>
        ${portalMarker}
      </div>
    `;
  }
}
