// Simple Context API for SmoothJS
// Provides createContext and is consumed by SmoothComponent via provideContext/useContext

export function createContext(defaultValue) {
  return { id: Symbol('context'), defaultValue };
}
