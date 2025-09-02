import { Velvet } from './velvet.js';
import { defaultTheme } from './theme.js';

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
