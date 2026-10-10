/** Combine a shared CSS-module class map with a specific one; shared keys get both class names. */
export function merge<A extends Record<string, string>, B extends Record<string, string>>(a: A, b: B): A & B {
  const out: Record<string, string> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = out[k] ? `${out[k]} ${v}` : v;
  return out as A & B;
}
