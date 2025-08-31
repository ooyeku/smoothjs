export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export class ResponsiveManager {
  constructor() {
    this.currentBreakpoint = this.getBreakpoint();
    this.listeners = new Set();
    this.init();
  }
  
  init() {
    // Add resize listener with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.checkBreakpoint();
      }, 150);
    });
    
    // Initial check
    this.checkBreakpoint();
  }
  
  getBreakpoint() {
    const width = window.innerWidth;
    
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    if (width < breakpoints['2xl']) return 'xl';
    return '2xl';
  }
  
  checkBreakpoint() {
    const newBreakpoint = this.getBreakpoint();
    
    if (newBreakpoint !== this.currentBreakpoint) {
      const oldBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = newBreakpoint;
      this.notifyListeners(newBreakpoint, oldBreakpoint);
    }
  }
  
  isBreakpoint(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    
    return currentIndex >= targetIndex;
  }
  
  isMobile() {
    return this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm';
  }
  
  isTablet() {
    return this.currentBreakpoint === 'md';
  }
  
  isDesktop() {
    return this.currentBreakpoint === 'lg' || 
           this.currentBreakpoint === 'xl' || 
           this.currentBreakpoint === '2xl';
  }
  
  getWidth() {
    return window.innerWidth;
  }
  
  getHeight() {
    return window.innerHeight;
  }
  
  getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    
    this.listeners.add(listener);
    
    // Call listener immediately with current breakpoint
    listener(this.currentBreakpoint, null);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  notifyListeners(newBreakpoint, oldBreakpoint) {
    this.listeners.forEach(listener => {
      try {
        listener(newBreakpoint, oldBreakpoint);
      } catch (error) {
        console.error('Responsive listener error:', error);
      }
    });
  }
  
  // Media query helpers
  matchesQuery(query) {
    return window.matchMedia(query).matches;
  }
  
  onQueryChange(query, callback) {
    const mq = window.matchMedia(query);
    
    // Initial call
    callback(mq.matches);
    
    // Listen for changes
    const handler = (e) => callback(e.matches);
    
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
    
    return () => {};
  }
}

// Singleton instance
let responsiveManager = null;

export function getResponsiveManager() {
  if (!responsiveManager) {
    responsiveManager = new ResponsiveManager();
  }
  return responsiveManager;
}

// Convenience functions
export function getCurrentBreakpoint() {
  return getResponsiveManager().currentBreakpoint;
}

export function isBreakpoint(breakpoint) {
  return getResponsiveManager().isBreakpoint(breakpoint);
}

export function isMobile() {
  return getResponsiveManager().isMobile();
}

export function isTablet() {
  return getResponsiveManager().isTablet();
}

export function isDesktop() {
  return getResponsiveManager().isDesktop();
}

export function subscribeToBreakpoint(listener) {
  return getResponsiveManager().subscribe(listener);
}

// Responsive utility for conditional rendering
export function responsive(values) {
  const breakpoint = getCurrentBreakpoint();
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  // Find the most specific value for current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // Fallback to default if provided
  return values.default || null;
}