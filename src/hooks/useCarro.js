import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../db/db.js";

const KEY = "carro";
const defaultCarro = { financiamentos: [] };

export function useCarro() {
  const [carro, setCarroState] = useState(defaultCarro);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(KEY, defaultCarro).then(v => {
      setCarroState({ ...defaultCarro, ...v });
      setLoading(false);
    });
  }, []);

  function setCarro(next) {
    const val = typeof next === "function" ? next(carro) : next;
    setCarroState(val);
    dbSet(KEY, val);
  }

  return { carro, setCarro, loading };
}
