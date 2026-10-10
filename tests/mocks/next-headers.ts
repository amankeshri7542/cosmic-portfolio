export const cookieJar = new Map<string, string>();
export async function cookies() {
  return { get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined) };
}
