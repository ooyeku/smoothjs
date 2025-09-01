import { defineComponent } from '../../index.js';
import { ContextDemo } from '../components/ContextDemo.js';
import { PortalDemo } from '../components/PortalDemo.js';
import { ChildrenDemo } from '../components/ChildrenDemo.js';

export const CompositionPage = defineComponent(({ html, find }) => {
  let _ctx = null, _portal = null, _children = null;

  const onMount = () => {
    const ctxHost = find('#ctx-host');
    const portalHost = find('#portal-host');
    const childrenHost = find('#children-host');
    _ctx = new ContextDemo();
    _portal = new PortalDemo();
    _children = new ChildrenDemo();
    if (ctxHost) _ctx.mount(ctxHost);
    if (portalHost) _portal.mount(portalHost);
    if (childrenHost) _children.mount(childrenHost);
  };

  const onUnmount = () => {
    try { _ctx && _ctx.unmount(); } catch {}
    try { _portal && _portal.unmount(); } catch {}
    try { _children && _children.unmount(); } catch {}
    _ctx = _portal = _children = null;
  };

  const render = () => html`
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

  return { render, onMount, onUnmount };
});
