/**
 * Sanitize a free-text search term for use inside a PostgREST logic tree
 * (`.or(...)`) or an `ilike` filter.
 *
 * PostgREST parses logic trees with commas and parentheses as syntax, so a user
 * typing "PT, A" or "Pangkalan (Baru)" produces a malformed filter and a
 * 400 PGRST100 response. Colons, asterisks and backslashes parse fine but are
 * stripped defensively since they carry filter syntax meaning elsewhere.
 *
 * e.g. "PT, A (Baru)*" → "PT A Baru"
 */
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()*:\\]/g, " ").replace(/\s+/g, " ").trim();
}