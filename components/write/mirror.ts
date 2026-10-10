// A copy of every draft on this device (IndexedDB), so a crash, a closed tab or a lost connection
// never loses writing. The server stays the source of truth; the mirror is offered, never applied silently.
import type { PostBody } from "@/lib/post-types";

export type Mirror = { id: string; draft: PostBody; baseVersion: number; savedAt: number };

const DB = "ak-writer";
const STORE = "drafts";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined; // private mode or storage blocked: the editor still works, just without the mirror
  }
}

export const mirror = {
  put: (m: Mirror) => tx("readwrite", (s) => s.put(m)),
  get: (id: string) => tx<Mirror>("readonly", (s) => s.get(id) as IDBRequest<Mirror>),
  remove: (id: string) => tx("readwrite", (s) => s.delete(id)),
  clearAll: () => tx("readwrite", (s) => s.clear()),
};

export function sameDraft(a: PostBody, b: PostBody) {
  return JSON.stringify(a) === JSON.stringify(b);
}
