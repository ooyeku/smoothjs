import { VelvetComponent } from './VelvetComponent.js';

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
