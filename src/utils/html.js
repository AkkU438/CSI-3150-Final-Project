/**
 * Decodes HTML entities returned by the Open Trivia DB API.
 * e.g. "What&#039;s..." → "What's..."
 * @param {string} html - HTML-encoded string.
 * @returns {string} Decoded plain-text string.
 */
export function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
