

/**
 * The `SSR` object provides methods for server-side rendering of components to a string.
 * It is designed to take a component class, instantiate it, and render its output
 * into an HTML string representation, optionally wrapping it in a container with a specific ID.
 *
 * @property {function} renderToString - Renders an instance of the given component class as an HTML string.
 *
 * @method renderToString
 * @param {class} ComponentClass - The class of the component to be rendered.
 * @param {object} [options] - Optional configuration for the rendering process.
 * @param {object} [options.props={}] - Properties to be applied to the component instance during rendering.
 * @param {object} [options.state=undefined] - State to be applied to the component instance during rendering.
 * @param {string|null} [options.containerId=null] - ID to use for wrapping the rendered output in a container div, or null to omit wrapping.
 * @returns {string} The rendered HTML output of the component as a string. If a `containerId` is supplied, the result will be wrapped in a div with that ID.
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
