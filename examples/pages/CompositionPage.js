import { Component } from '../../index.js';
import { ContextDemo } from '../components/ContextDemo.js';
import { PortalDemo } from '../components/PortalDemo.js';
import { ChildrenDemo } from '../components/ChildrenDemo.js';

export class CompositionPage extends Component {
  onMount() {
    const ctxHost = this.find('#ctx-host');
    const portalHost = this.find('#portal-host');
    const childrenHost = this.find('#children-host');
    this._ctx = new ContextDemo();
    this._portal = new PortalDemo();
    this._children = new ChildrenDemo();
    if (ctxHost) this._ctx.mount(ctxHost);
    if (portalHost) this._portal.mount(portalHost);
    if (childrenHost) this._children.mount(childrenHost);
  }

  onUnmount() {
    try { this._ctx && this._ctx.unmount(); } catch {}
    try { this._portal && this._portal.unmount(); } catch {}
    try { this._children && this._children.unmount(); } catch {}
    this._ctx = this._portal = this._children = null;
  }

  template() {
    return this.html`
      <div style="display: grid; gap: 1rem;">
        <div class="card">
          <h2 style="margin:0 0 .5rem 0;">Context Demo</h2>
          <div id="ctx-host"></div>
        </div>
        <div class="card">
          <h2 style="margin:0 0 .5rem 0;">Portals Demo</h2>
          <div id="portal-host"></div>
        </div>
        <div class="card">
          <h2 style="margin:0 0 .5rem 0;">Children Demo</h2>
          <div id="children-host"></div>
        </div>
      </div>
    `;
  }
}
