import { createContext } from '../component/context.js';
import { SmoothComponent } from '../component/SmoothComponent.js';
import { defaultTheme } from './theme.js';

/**
 * VelvetContext is the context that manages the application's theming configuration.
 * It provides a default theme and a flag to enable or disable dark mode.
 *
 * The context is primarily used to allow components in the application
 * to access and respond to changes in the theme or dark mode state.
 *
 * Default Values:
 * - `theme`: A predefined default theme object.
 * - `darkMode`: A boolean indicating whether dark mode is enabled (default is `false`).
 */
export const VelvetContext = createContext({
  theme: defaultTheme,
  darkMode: false
});

/**
 * Represents a provider component that supplies a context for Velvet-based components.
 * It manages and provides theme data and dark mode configuration to its children.
 *
 * @class VelvetProvider
 * @extends SmoothComponent
 */
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
