import { createContext } from '../component/context.js';
import { SmoothComponent } from '../component/SmoothComponent.js';
import { defaultTheme } from './theme.js';

export const VelvetContext = createContext({
  theme: defaultTheme,
  darkMode: false
});

export class VelvetProvider extends SmoothComponent {
  template() {
    this.provideContext(VelvetContext, {
      theme: this.props && this.props.theme ? this.props.theme : defaultTheme,
      darkMode: !!(this.props && this.props.darkMode)
    });
    // Render children as-is
    return this.renderChildren();
  }
}
