// Composable style utilities for Velvet
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

export function variants(base, variantMap, variant) {
  return composeStyles(base, variantMap && variantMap[variant] ? variantMap[variant] : {});
}
