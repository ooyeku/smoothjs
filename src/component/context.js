

/**
 * Creates and returns a new context object with a unique identifier and an optional default value.
 *
 * @param {any} defaultValue - The default value to be used by the created context.
 * @return {Object} An object representing the context, containing a unique identifier and the provided default value.
 */
export function createContext(defaultValue) {
  return { id: Symbol('context'), defaultValue };
}
