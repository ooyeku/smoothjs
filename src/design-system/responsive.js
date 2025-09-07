/**
 * An object representing the breakpoints used for responsive design.
 * Each property corresponds to a breakpoint name and its associated minimum width in pixels.
 *
 * Properties:
 * - `sm`: Represents the "small" breakpoint, with a minimum width of 640 pixels.
 * - `md`: Represents the "medium" breakpoint, with a minimum width of 768 pixels.
 * - `lg`: Represents the "large" breakpoint, with a minimum width of 1024 pixels.
 * - `xl`: Represents the "extra-large" breakpoint, with a minimum width of 1280 pixels.
 * - `2xl`: Represents the "2x extra-large" breakpoint, with a minimum width of 1536 pixels.
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

/**
 * A class for managing responsive behaviors based on screen size, orientation, and specific media queries.
 */
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
/**
 * Represents a manager responsible for handling responsiveness in an application.
 * This variable is initialized as null and is intended to be assigned
 * as the application manages or adapts to responsiveness requirements.
 *
 * @type {object | null}
 */
let responsiveManager = null;

/**
 * Retrieves the singleton instance of the ResponsiveManager.
 * If the instance does not exist, it initializes and returns the newly created instance.
 *
 * @return {ResponsiveManager} The singleton instance of the ResponsiveManager.
 */
export function getResponsiveManager() {
  if (!responsiveManager) {
    responsiveManager = new ResponsiveManager();
  }
  return responsiveManager;
}

// Convenience functions
/**
 * Retrieves the current responsive breakpoint being used by the application.
 *
 * @return {string} The name of the current breakpoint as defined by the responsive manager.
 */
export function getCurrentBreakpoint() {
  return getResponsiveManager().currentBreakpoint;
}

/**
 * Checks if the provided breakpoint matches the current responsive state.
 *
 * @param {string} breakpoint - The name of the breakpoint to check.
 * @return {boolean} Returns true if the current responsive state matches the specified breakpoint, otherwise false.
 */
export function isBreakpoint(breakpoint) {
  return getResponsiveManager().isBreakpoint(breakpoint);
}

/**
 * Determines if the current device or viewport is classified as a mobile device.
 *
 * This method checks the responsive manager to evaluate whether the current
 * device or screen size meets the criteria for being considered mobile.
 *
 * @return {boolean} Returns true if the device or viewport is classified as mobile, otherwise false.
 */
export function isMobile() {
  return getResponsiveManager().isMobile();
}

/**
 * Determines if the current device is a tablet based on the responsive manager's state.
 *
 * @return {boolean} Returns true if the device is identified as a tablet, otherwise false.
 */
export function isTablet() {
  return getResponsiveManager().isTablet();
}

/**
 * Determines if the current device or view is classified as a desktop.
 *
 * This function utilizes the responsive manager to evaluate and determine
 * whether the device or view meets the criteria for desktop categorization.
 *
 * @return {boolean} True if the current view is identified as a desktop, false otherwise.
 */
export function isDesktop() {
  return getResponsiveManager().isDesktop();
}

/**
 * Subscribes a listener to breakpoint changes using the responsive manager.
 *
 * @param {Function} listener - A callback function that will be executed whenever the breakpoint changes. The function receives the new breakpoint as an argument.
 * @return {Function} A function to unsubscribe the listener from breakpoint changes.
 */
export function subscribeToBreakpoint(listener) {
  return getResponsiveManager().subscribe(listener);
}

// Responsive utility for conditional rendering
/**
 * Determines the appropriate value based on the current breakpoint and a set of responsive values.
 *
 * @param {Object} values - An object containing values mapped to breakpoints. The keys represent breakpoints ('xs', 'sm', 'md', 'lg', 'xl', '2xl') or 'default' as a fallback. The values are the corresponding values for each breakpoint.
 * @return {*} The most specific value corresponding to the current breakpoint or the 'default' value if no match is found. Returns null if no default value is specified.
 */
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