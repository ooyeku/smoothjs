import { createStore, createSelector } from '../../index.js';

// Global stores for advanced state management demo
export const counterStore = createStore({ count: 0 });
export const selectIsEven = createSelector(s => s.count, (c) => (c % 2 === 0));
export const selectDouble = createSelector(s => s.count, (c) => c * 2);
export const selectCountCategory = createSelector(
  s => s.count,
  (c) => c === 0 ? 'zero' : c > 0 ? 'positive' : 'negative'
);

// User preferences store for settings persistence
export const preferencesStore = createStore({
  theme: 'auto',
  language: 'en',
  notifications: true,
  animationSpeed: 'normal'
});

// Advanced selectors for preferences
export const selectThemeDisplay = createSelector(
  s => s.theme,
  (theme) => ({
    auto: 'Auto (System)',
    light: 'Light Mode',
    dark: 'Dark Mode'
  }[theme] || theme)
);

export const selectAnimationDuration = createSelector(
  s => s.animationSpeed,
  (speed) => ({
    slow: 600,
    normal: 300,
    fast: 150
  }[speed] || 300)
);

// Combined store for app-wide state
export const appStore = createStore({
  isOnline: navigator.onLine,
  lastActivity: new Date().toISOString(),
  sessionId: Math.random().toString(36).substr(2, 9)
});

// Create a computed store for app status that can be subscribed to
export const selectAppStatus = createStore({
  online: navigator.onLine,
  count: 0,
  theme: 'auto',
  status: 'online'
});

// Update the app status store when other stores change
counterStore.subscribe((state) => {
  selectAppStatus.setState(prev => ({ ...prev, count: state.count }));
});

preferencesStore.subscribe((state) => {
  selectAppStatus.setState(prev => ({ ...prev, theme: state.theme }));
});

appStore.subscribe((state) => {
  selectAppStatus.setState(prev => ({ 
    ...prev, 
    online: state.isOnline,
    status: state.isOnline ? 'online' : 'offline'
  }));
});
