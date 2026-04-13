/**
 * Fisher-Yates shuffle algorithm.
 * Produces a uniformly random permutation of the input array.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} A new shuffled array.
 */
export function fisherYatesShuffle(array) {
  const arr = [...array]; // Never mutate the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
