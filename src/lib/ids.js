/**
 * ID generation utilities.
 * Prefers crypto.randomUUID() where available, with a documented fallback.
 */

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID().
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}