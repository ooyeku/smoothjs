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
let darkModeManager = null;

export function getDarkModeManager() {
  if (!darkModeManager) {
    darkModeManager = new DarkModeManager();
  }
  return darkModeManager;
}

// Convenience functions
export function toggleDarkMode() {
  return getDarkModeManager().toggle();
}

export function setDarkMode(mode) {
  getDarkModeManager().setMode(mode);
}

export function isDarkMode() {
  return getDarkModeManager().getMode() === 'dark';
}

export function subscribeToDarkMode(listener) {
  return getDarkModeManager().subscribe(listener);
}