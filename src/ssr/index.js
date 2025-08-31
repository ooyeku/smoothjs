// Simple SSR utilities for SmoothJS
// Usage on server (Node):
//   import { SSR } from 'smoothjs';
//   const html = SSR.renderToString(AppComponent, { props: {}, state: {} });
//
// renderToString will instantiate the component without DOM and call template().
// If template returns a Node (not available on server), it will be stringified as [object Node].
// Best practice is to return HTML strings from template for SSR.

export const SSR = {
  renderToString(ComponentClass, { props = {}, state = undefined, containerId = null } = {}) {
    // Create instance; components may ignore constructor args, so assign props/state explicitly
    const instance = new ComponentClass(null, undefined, undefined);
    try {
      if (props && typeof props === 'object') instance.props = { ...(instance.props || {}), ...props };
      if (state && typeof state === 'object') instance.state = { ...(instance.state || {}), ...state };
    } catch {}
    let html = '';
    try {
      const out = instance.template();
      if (typeof out === 'string') html = out;
      else if (out && typeof out.outerHTML === 'string') html = out.outerHTML;
      else html = String(out ?? '');
    } catch (e) {
      html = `<div style="color:red;">SSR Error: ${e && e.message ? e.message : String(e)}</div>`;
    }
    if (containerId) {
      return `<div id="${String(containerId)}">${html}</div>`;
    }
    return html;
  }
};

export default SSR;
