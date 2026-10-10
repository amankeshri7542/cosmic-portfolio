export type Redirect = { from: string; to: string };

/**
 * Renaming a live post from `oldSlug` to `newSlug`: point every existing redirect at the new
 * address (no chains), add old → new, and drop any redirect that the new slug now shadows.
 */
export function collapseRedirects(existing: Redirect[], oldSlug: string, newSlug: string): { upsert: Redirect[]; remove: string[] } {
  if (oldSlug === newSlug) return { upsert: [], remove: [] };
  const upsert = existing.filter((r) => r.to === oldSlug && r.from !== newSlug).map((r) => ({ from: r.from, to: newSlug }));
  upsert.push({ from: oldSlug, to: newSlug });
  return { upsert, remove: existing.some((r) => r.from === newSlug) ? [newSlug] : [] };
}
