/**
 * Generates a hash string based on the input string.
 * Converts the input string into a consistent hash value represented as a base-36 string.
 *
 * @param {string} str - The input string to be hashed.
 * @return {string} A base-36 string representation of the computed hash.
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