import { VelvetComponent } from './VelvetComponent.js';

/**
 * Creates a VelvetComponent class with a specified name and setup function.
 *
 * @param {string} name - The name of the component, used for display purposes.
 * @param {function} setup - A function that receives the context object and returns the component's template.
 * @return {class} A custom VelvetComponent class with the specified functionality and template.
 */
export function createVelvetComponent(name, setup) {
  return class extends VelvetComponent {
    static displayName = name;

    template() {
      const ctx = {
        props: this.props,
        state: this.state,
        vs: this.vs.bind(this),
        theme: this.theme,
        html: this.html.bind(this)
      };
      return setup(ctx);
    }
  };
}
