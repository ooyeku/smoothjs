/**
 * Handles management of dark mode settings, including detection of system preferences,
 * applying themes, saving preferences, and notifying subscribers of mode changes.
 */
export class DarkModeManager {
  constructor() {
    this.mode = this.detectSystemPreference();
    this.listeners = new Set();
    this.init();
  }
  
  init() {
    // Apply initial mode
    this.applyMode(this.mode);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        const newMode = e.matches ? 'dark' : 'light';
        // Only auto-switch if no manual override
        if (!this.hasManualOverride()) {
          this.setMode(newMode);
        }
      });
    } else if (mediaQuery.addListener) {
      // Legacy browsers
      mediaQuery.addListener((e) => {
        const newMode = e.matches ? 'dark' : 'light';
        if (!this.hasManualOverride()) {
          this.setMode(newMode);
        }
      });
    }
    
    // Check for saved preference
    const saved = this.getSavedPreference();
    if (saved) {
      this.setMode(saved);
    }
  }
  
  detectSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  hasManualOverride() {
    return localStorage.getItem('velvet-color-mode') !== null;
  }
  
  getSavedPreference() {
    return localStorage.getItem('velvet-color-mode');
  }
  
  savePreference(mode) {
    localStorage.setItem('velvet-color-mode', mode);
  }
  
  clearPreference() {
    localStorage.removeItem('velvet-color-mode');
  }
  
  applyMode(mode) {
    const root = document.documentElement;
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', mode);
    
    // Add/remove dark class for compatibility
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set color-scheme for native elements
    root.style.colorScheme = mode;
  }
  
  setMode(mode, save = true) {
    if (mode !== 'dark' && mode !== 'light' && mode !== 'auto') {
      console.warn('Invalid color mode:', mode);
      return;
    }
    
    if (mode === 'auto') {
      this.clearPreference();
      mode = this.detectSystemPreference();
    } else if (save) {
      this.savePreference(mode);
    }
    
    this.mode = mode;
    this.applyMode(mode);
    this.notifyListeners(mode);
  }
  
  getMode() {
    return this.mode;
  }
  
  toggle() {
    const newMode = this.mode === 'dark' ? 'light' : 'dark';
    this.setMode(newMode);
    return newMode;
  }
  
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    
    this.listeners.add(listener);
    
    // Call listener immediately with current mode
    listener(this.mode);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  notifyListeners(mode) {
    this.listeners.forEach(listener => {
      try {
        listener(mode);
      } catch (error) {
        console.error('Dark mode listener error:', error);
      }
    });
  }
}

// Singleton instance
/**
 * A variable to manage the dark mode functionality in an application.
 * It is initially set to null and can be assigned an object or function
 * responsible for controlling and handling the dark mode state and actions.
 *
 * Usage of this variable typically involves assigning a relevant implementation
 * that encapsulates logic such as toggling between dark and light themes,
 * persisting user preferences, and applying appropriate styles.
 *
 * It should be properly initialized before invoking any related operations
 * to ensure proper functionality.
 */
let darkModeManager = null;

/**
 * Retrieves the singleton instance of the DarkModeManager.
 * If the instance does not exist, a new instance is created.
 *
 * @return {DarkModeManager} The singleton instance of the DarkModeManager.
 */
export function getDarkModeManager() {
  if (!darkModeManager) {
    darkModeManager = new DarkModeManager();
  }
  return darkModeManager;
}

// Convenience functions
/**
 * Toggles the dark mode state between enabled and disabled.
 *
 * @return {boolean} The resulting state of dark mode after the toggle.
 */
export function toggleDarkMode() {
  return getDarkModeManager().toggle();
}

/**
 * Sets the application's dark mode preference.
 *
 * @param {boolean} mode - A boolean value where `true` enables dark mode and `false` disables it.
 * @return {void} This function does not return any value.
 */
export function setDarkMode(mode) {
  getDarkModeManager().setMode(mode);
}

/**
 * Determines if the application is currently running in dark mode.
 *
 * This function checks the current mode of the application's settings and
 * returns whether it is set to 'dark'.
 *
 * @return {boolean} True if the application is in dark mode, otherwise false.
 */
export function isDarkMode() {
  return getDarkModeManager().getMode() === 'dark';
}

/**
 * Subscribes the provided listener function to dark mode changes.
 * The listener will be triggered whenever the dark mode state changes.
 *
 * @param {function(boolean)} listener - A callback function that will be invoked with the updated
 *                                        dark mode state. The state is passed as a boolean, where
 *                                        `true` indicates dark mode is enabled and `false` indicates it is disabled.
 * @return {function} A function that can be called to unsubscribe the listener from dark mode updates.
 */
export function subscribeToDarkMode(listener) {
  return getDarkModeManager().subscribe(listener);
}