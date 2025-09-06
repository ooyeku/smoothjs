

/**
 * A server-side rendering (SSR) utility object used to render component instances
 * into an HTML string representation.
 *
 * @property {function} renderToString - Renders a given component class to an HTML string.
 *
 * The `renderToString` function initializes a provided component class with optional
 * properties, state, and a container ID, and then generates the HTML output based
 * on the component's `template` method. If errors occur during the rendering process,
 * they are caught and an error HTML snippet is returned instead.
 *
 * @method
 * @param {Function} ComponentClass The component class to render.
 * @param {Object} [options] Configuration options for rendering.
 * @param {Object} [options.props={}] The properties to be passed to the component instance.
 * @param {Object} [options.state=undefined] The initial state to set on the component instance.
 * @param {string|null} [options.containerId=null] The optional ID used to wrap the HTML output in a containing div.
 * @returns {string} The HTML string generated from the component instance.
 */
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
