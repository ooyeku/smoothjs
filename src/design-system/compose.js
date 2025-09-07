/**
 * Combines multiple style objects into a single composed style object.
 * This function aggregates style rules for different states such as base, hover, focus, active, dark, and responsive.
 * It skips string values and merges properties of objects from the provided styles.
 *
 * @param {...Object} styles - List of style objects to compose. These objects may define styles for various states.
 * @return {Object} A single composed object where styles for different states are merged together.
 */
export function composeStyles(...styles) {
  const composed = { base: {}, hover: {}, focus: {}, active: {}, dark: {}, responsive: {} };
  styles.forEach((style) => {
    if (!style) return;
    if (typeof style === 'string') return; // skip class strings
    Object.entries(style).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        composed[key] = { ...(composed[key] || {}), ...value };
      }
    });
  });
  return composed;
}

/**
 * Combines a base style with a variant style from a variant map.
 *
 * @param {string} base - The base style to be used.
 * @param {Object} variantMap - An object mapping variant keys to their respective styles.
 * @param {string} variant - A key indicating which variant style to combine with the base.
 * @return {{base: {}, hover: {}, focus: {}, active: {}, dark: {}, responsive: {}}} The combined style as a string, constructed from the base and the appropriate variant style.
 */
export function variants(base, variantMap, variant) {
  return composeStyles(base, variantMap && variantMap[variant] ? variantMap[variant] : {});
}
