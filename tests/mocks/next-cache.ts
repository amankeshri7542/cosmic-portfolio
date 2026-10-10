export const revalidated: string[] = [];
export function revalidateTag(tag: string) {
  revalidated.push(tag);
}
export const cacheTag = () => {};
export const cacheLife = () => {};
