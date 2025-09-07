import { Velvet } from './velvet.js';
import { defaultTheme } from './theme.js';

/**
 * Represents the base class for plugins to be used with the Velvet framework.
 * This class is a utility to manage and register plugins by invoking their `install` method.
 */
export class VelvetPlugin {
  static plugins = [];

  static register(plugin) {
    if (!plugin || typeof plugin.install !== 'function') return;
    this.plugins.push(plugin);
    try {
      plugin.install(Velvet, defaultTheme);
    } catch {}
  }
}

// Example plugin: adds a responsive helper using Velvet.style
/**
 * A plugin to enhance VelvetClass with responsive styling capabilities.
 * The `responsivePlugin` allows setting base styles and responsive breakpoints
 * that adapt styles based on varying conditions like screen size.
 *
 * @property {Object} responsivePlugin - The plugin object containing the `install` method.
 * @method install - Attaches the responsive functionality to the VelvetClass prototype.
 * @param {Object} VelvetClass - The class to extend with the responsive styling method.
 * @param {Object} theme - An optional theme configuration object, not used directly here.
 */
export const responsivePlugin = {
  install(VelvetClass, theme) {
    // Extend the prototype carefully to avoid overwriting existing methods
    if (!VelvetClass.prototype.responsive) {
      VelvetClass.prototype.responsive = function(base, breakpoints) {
        return this.style({
          base,
          responsive: breakpoints || {}
        });
      };
    }
  }
};
