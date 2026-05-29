import type { SavedTab, SortDirection, SortField, StorageStats } from "./types";

const DB_NAME = "tab-memory";
const DB_VERSION = 1;
const TABS_STORE = "tabs";
const SCREENSHOTS_STORE = "screenshots";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TABS_STORE)) {
        const store = db.createObjectStore(TABS_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("title", "title", { unique: false });
      }
      if (!db.objectStoreNames.contains(SCREENSHOTS_STORE)) {
        db.createObjectStore(SCREENSHOTS_STORE, { keyPath: "key" });
      }
    };
  });
}

function tx<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = fn(store);
    transaction.oncomplete = () => {
      if (result instanceof IDBRequest) {
        resolve(result.result);
      } else {
        resolve();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function saveTab(
  tab: SavedTab,
  screenshotDataUrl: string,
): Promise<void> {
  const db = await openDb();
  const blob = await dataUrlToBlob(screenshotDataUrl);

  await tx(db, SCREENSHOTS_STORE, "readwrite", (store) =>
    store.put({ key: tab.screenshotKey, blob }),
  );
  await tx(db, TABS_STORE, "readwrite", (store) => store.put(tab));
}

export async function getAllTabs(
  sortField: SortField = "createdAt",
  sortDirection: SortDirection = "desc",
): Promise<SavedTab[]> {
  const db = await openDb();
  const tabs = await new Promise<SavedTab[]>((resolve, reject) => {
    const transaction = db.transaction(TABS_STORE, "readonly");
    const store = transaction.objectStore(TABS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as SavedTab[]);
    request.onerror = () => reject(request.error);
  });

  const dir = sortDirection === "asc" ? 1 : -1;
  return tabs.sort((a, b) => {
    if (sortField === "createdAt") {
      return (a.createdAt - b.createdAt) * dir;
    }
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" }) * dir;
  });
}

export async function getScreenshotUrl(screenshotKey: string): Promise<string | null> {
  const db = await openDb();
  const record = await new Promise<{ key: string; blob: Blob } | undefined>(
    (resolve, reject) => {
      const transaction = db.transaction(SCREENSHOTS_STORE, "readonly");
      const store = transaction.objectStore(SCREENSHOTS_STORE);
      const request = store.get(screenshotKey);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    },
  );

  if (!record?.blob) return null;
  return URL.createObjectURL(record.blob);
}

export async function deleteTab(id: string): Promise<void> {
  const db = await openDb();
  const tab = await new Promise<SavedTab | undefined>((resolve, reject) => {
    const transaction = db.transaction(TABS_STORE, "readonly");
    const store = transaction.objectStore(TABS_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as SavedTab | undefined);
    request.onerror = () => reject(request.error);
  });

  if (tab) {
    await tx(db, SCREENSHOTS_STORE, "readwrite", (store) =>
      store.delete(tab.screenshotKey),
    );
  }
  await tx(db, TABS_STORE, "readwrite", (store) => store.delete(id));
}

export async function clearAll(): Promise<void> {
  const db = await openDb();
  await tx(db, TABS_STORE, "readwrite", (store) => store.clear());
  await tx(db, SCREENSHOTS_STORE, "readwrite", (store) => store.clear());
}

export async function getStorageStats(): Promise<StorageStats> {
  const db = await openDb();
  const [tabs, screenshots] = await Promise.all([
    new Promise<SavedTab[]>((resolve, reject) => {
      const transaction = db.transaction(TABS_STORE, "readonly");
      const request = transaction.objectStore(TABS_STORE).getAll();
      request.onsuccess = () => resolve(request.result as SavedTab[]);
      request.onerror = () => reject(request.error);
    }),
    new Promise<{ blob: Blob }[]>((resolve, reject) => {
      const transaction = db.transaction(SCREENSHOTS_STORE, "readonly");
      const request = transaction.objectStore(SCREENSHOTS_STORE).getAll();
      request.onsuccess = () =>
        resolve(request.result as { blob: Blob }[]);
      request.onerror = () => reject(request.error);
    }),
  ]);

  const bytesUsed = screenshots.reduce((sum, s) => sum + (s.blob?.size ?? 0), 0);
  return { count: tabs.length, bytesUsed };
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
