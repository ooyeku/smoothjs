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
    // Create instance with initial state and props
    const instance = new ComponentClass(null, state || undefined, props || {});
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
