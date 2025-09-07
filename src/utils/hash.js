/**
 * Generates a hash string for a given input.
 *
 * @param {string} str - The input string to hash.
 * @return {string} The computed hash value as a base-36 string.
 */
export function hash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}