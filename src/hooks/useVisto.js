import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../db/db.js";

const KEY = "visto";
const defaultVisto = { grupoId: null, varianteId: null, validade: null, checklist: {} };

export function useVisto() {
  const [visto, setVistoState] = useState(defaultVisto);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(KEY, defaultVisto).then(v => {
      setVistoState({ ...defaultVisto, ...v });
      setLoading(false);
    });
  }, []);

  function setVisto(next) {
    const val = typeof next === "function" ? next(visto) : next;
    setVistoState(val);
    dbSet(KEY, val);
  }

  return { visto, setVisto, loading };
}
