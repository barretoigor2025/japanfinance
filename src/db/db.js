import { openDB } from "idb";

const DB_NAME = "salary-tracker-3";
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("kv")) {
          db.createObjectStore("kv");
        }
      },
    });
  }
  return dbPromise;
}

export async function dbGet(key, fallback) {
  try {
    const db = await getDB();
    const val = await db.get("kv", key);
    return val !== undefined ? val : fallback;
  } catch {
    return fallback;
  }
}

export async function dbSet(key, value) {
  try {
    const db = await getDB();
    await db.put("kv", value, key);
  } catch {}
}
