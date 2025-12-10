interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
}

const DB_NAME = 'jarvis-cache';
const STORE = 'kv';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const db = await openDB();
    return new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry<T> | undefined;
        if (!entry) return resolve(null);
        if (Date.now() > entry.expiresAt) {
          // expire lazily
          const del = store.delete(key);
          del.onsuccess = () => resolve(null);
          del.onerror = () => resolve(null);
          return;
        }
        resolve(entry.value);
      };
      req.onerror = () => reject(req.error);
    });
  },
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
      const req = store.put(entry, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};