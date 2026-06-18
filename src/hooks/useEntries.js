import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../db/db.js";

const KEY = "entries";

export function useEntries() {
  const [entries, setEntriesState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(KEY, []).then(v => { setEntriesState(v); setLoading(false); });
  }, []);

  function setEntries(next) {
    const val = typeof next === "function" ? next(entries) : next;
    setEntriesState(val);
    dbSet(KEY, val);
  }

  function addEntry(entry) {
    setEntries(prev => [...prev.filter(e => e.id !== entry.id), entry]);
  }

  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return { entries, setEntries, addEntry, deleteEntry, loading };
}
