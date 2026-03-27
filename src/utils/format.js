/**
 * Format a byte count into a human-readable string (e.g. "1.50 GB").
 * @param {number} bytes
 * @returns {string}
 */
export function formatSize(bytes) {
  if (bytes >= 1e12) return (bytes / 1e12).toFixed(2) + ' TB';
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
  return bytes + ' B';
}

/**
 * Format a block count with K/M suffix for compact display.
 * @param {number} n
 * @returns {string}
 */
export function formatBlocks(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}
